import { json, settle, screenshot } from '../helpers/evidence.mjs'
import { inspectLayout } from '../helpers/layout.mjs'

const frame = (page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )
const state = (page, selector, variable) =>
  page.locator(selector).evaluate(
    (el, variable) => ({
      scrollY,
      progress: getComputedStyle(el).getPropertyValue(variable),
      className: el.className,
      cards: el.querySelectorAll('article,a').length,
    }),
    variable,
  )
async function touchSwipe(session, x, startY, endY) {
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: startY }],
  })
  for (let step = 1; step <= 12; step++)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: startY + ((endY - startY) * step) / 12 }],
    })
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
export async function run({ base, engines, engineNames }) {
  const results = [],
    errors = []
  for (const engine of engineNames) {
    const browser = await engines[engine].launch()
    try {
      for (const width of [390, 1440]) {
        const context = await browser.newContext({
            viewport: { width, height: 900 },
            hasTouch: width === 390,
          }),
          page = await context.newPage()
        for (const slug of ['title', 'mortgage', 'tax-property', 'technology']) {
          const route = '/services/' + slug
          try {
            await page.goto(base + route)
            await settle(page)
            const buttons = page.locator('.service-scope-tabs button')
            for (let i = 0; i < (await buttons.count()); i++) {
              const button = buttons.nth(i)
              await button.scrollIntoViewIfNeeded()
              await button.focus()
              await page.keyboard.press('Enter')
              await page.waitForFunction(
                (index) =>
                  document
                    .querySelectorAll('.service-scope-tabs button')
                    [index]?.getAttribute('aria-pressed') === 'true',
                i,
                { timeout: 3000 },
              )
              results.push({
                engine,
                width,
                route,
                mode: 'service-capability-keyboard',
                index: i,
                pressed: await button.getAttribute('aria-pressed'),
                heading: await page.locator('#service-capability h3').innerText(),
              })
            }
          } catch (error) {
            errors.push({
              engine,
              width,
              route,
              mode: 'service-capability-keyboard',
              error: String(error),
            })
          }
        }
        for (const [route, selector, variable] of [
          ['/', '#services', '--deck-progress'],
          ['/products', '.product-reveal-v3', '--product-reveal-progress'],
          ['/our-approach', '#approach', '--approach-progress'],
        ]) {
          for (const input of width === 390
            ? ['keyboard', ...(engine === 'chromium' ? ['touch'] : [])]
            : ['mouse-wheel', 'keyboard']) {
            try {
              await page.goto(base + route)
              await settle(page)
              await page.locator(selector).evaluate((el) => {
                document.documentElement.style.scrollBehavior = 'auto'
                scrollTo(0, el.getBoundingClientRect().top + scrollY - 150)
              })
              await frame(page)
              const before = await state(page, selector, variable)
              if (input === 'mouse-wheel') {
                await page.mouse.move(width - 30, 500)
                for (let i = 0; i < 5; i++) {
                  await page.mouse.wheel(0, 600)
                  await frame(page)
                }
              } else if (input === 'keyboard') {
                await page.evaluate(() => {
                  document.body.tabIndex = -1
                  document.body.focus({ preventScroll: true })
                })
                for (let i = 0; i < 5; i++) {
                  await page.keyboard.press('PageDown')
                  await frame(page)
                }
              } else {
                const session = await context.newCDPSession(page)
                for (let i = 0; i < 4; i++) {
                  await touchSwipe(session, 340, 740, 220)
                  await frame(page)
                }
                await session.detach()
              }
              await frame(page)
              results.push({
                engine,
                width,
                route,
                mode: 'scroll-input',
                input,
                before,
                after: await state(page, selector, variable),
                screenshot: await screenshot(
                  page,
                  route,
                  `${engine}-${input}-${width}`,
                  width < 768 ? 'portrait' : 'landscape',
                  'expanded',
                  false,
                ),
              })
            } catch (error) {
              errors.push({ engine, width, route, input, error: String(error) })
            }
          }
        }
        for (const mode of ['text-spacing', 'long-labels', 'rtl'])
          for (const route of [
            '/',
            '/services',
            '/our-approach',
            '/products',
            '/location',
            '/privacy-policy',
          ]) {
            try {
              await page.goto(base + route)
              await settle(page)
              if (mode === 'text-spacing')
                await page.addStyleTag({
                  content:
                    '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}',
                })
              if (mode === 'rtl') await page.evaluate(() => (document.documentElement.dir = 'rtl'))
              if (mode === 'long-labels')
                await page.evaluate(() => {
                  for (const a of document.querySelectorAll('.primary-nav>a'))
                    a.textContent = 'Immobilienrecherche und Prozessunterstützung'
                  const email = document.querySelector('[name="email"]')
                  if (email) email.value = 'qa.' + 'long'.repeat(40) + '@example.invalid'
                  const name = document.querySelector('[name="name"]')
                  if (name) name.value = 'Synthetic long-name '.repeat(20)
                })
              await frame(page)
              const layout = await inspectLayout(page)
              results.push({
                engine,
                width,
                route,
                mode,
                horizontalOverflow: layout.horizontalOverflow,
                overflowElements: layout.overflow.slice(0, 20),
                screenshot: await screenshot(
                  page,
                  route,
                  `${engine}-${mode}-${width}`,
                  width < 768 ? 'portrait' : 'landscape',
                  mode,
                  false,
                ),
                note: 'Test-only browser DOM/style mutation. No translation or product copy change; RTL/long-label observations are resilience probes for this English-only site.',
              })
            } catch (error) {
              errors.push({ engine, width, route, mode, error: String(error) })
            }
          }
        if (engine === 'chromium' && width === 390) {
          await page.emulateMedia({ reducedMotion: 'reduce' })
          await page.goto(base + '/location')
          await settle(page)
          const canvas = page.locator('.locations-globe canvas')
          await canvas.scrollIntoViewIfNeeded()
          await frame(page)
          const rect = await canvas.boundingBox(),
            startX = Math.max(60, rect.x + rect.width * 0.4),
            y = Math.min(650, Math.max(200, rect.y + rect.height * 0.45))
          const before = await canvas.evaluate((el) => el.toDataURL()),
            session = await context.newCDPSession(page)
          await session.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x: startX, y }],
          })
          const pointerHandlerActive = await page
            .locator('.locations-globe')
            .evaluate((el) => el.classList.contains('is-dragging'))
          for (let i = 1; i <= 10; i++)
            await session.send('Input.dispatchTouchEvent', {
              type: 'touchMove',
              touchPoints: [{ x: startX + i * 7, y: y - i * 3 }],
            })
          await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
          await frame(page)
          results.push({
            engine,
            width,
            route: '/location',
            mode: 'globe-touch-drag',
            pointerHandlerActive,
            canvasChanged: before !== (await canvas.evaluate((el) => el.toDataURL())),
            note: 'Chromium CDP native touch input, reduced motion disables auto-spin. Physical touch and other-engine swipes remain manual.',
          })
          await session.send('Emulation.setEmulatedMedia', {
            features: [{ name: 'prefers-reduced-data', value: 'reduce' }],
          })
          results.push({
            engine,
            width,
            mode: 'reduced-data',
            matches: await page.evaluate(
              () => matchMedia('(prefers-reduced-data: reduce)').matches,
            ),
            note: 'Protocol media emulation only; real data-saver behavior unverified.',
          })
          await session.detach()
        }
        await context.close()
      }
    } finally {
      await browser.close()
    }
  }
  await json('input-stress.json', { results, errors })
  return {
    cases: results.length,
    errors: errors.length,
    stressOverflow: results.filter((r) => r.horizontalOverflow).length,
    failures: errors.length,
  }
}
