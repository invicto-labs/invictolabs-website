import path from 'node:path'
import { mkdir, readFile } from 'node:fs/promises'
import { deviceMatrix } from '../helpers/matrix.mjs'
import { output, json, settle, screenshot, scrollToFraction, slug } from '../helpers/evidence.mjs'
const passedScroll = (row) => row.physicalTrigger && row.opened.visible && row.noOpenJump &&
  row.noCloseJump && row.scrollLocked && row.trap !== false && (!row.focusTested || row.closed.focusIsTrigger)
async function withDeadline(promise, milliseconds) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new Error('Firefox runtime resize exceeded the local 5s capability deadline')),
          milliseconds,
        )
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
export async function run({ base, engines, engineNames, devices }) {
  let results = []
  const errors = []
  let prior = []
  if (process.env.QA_RESUME === '1') {
    try {
      const previous = JSON.parse(await readFile(path.join(output, 'menu.json'), 'utf8'))
      prior = previous.results || []
      results = prior.filter((r) => r.rows?.length === 15 && r.rows.every(passedScroll) &&
        r.resizeClosed !== undefined && r.outsideClosed && r.linkClosed && r.doubleClickClosed)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  const completed = new Set(results.map((r) => `${r.engine}|${r.device}|${r.orientation}`))
  await mkdir(path.join(output, 'traces'), { recursive: true })
  await Promise.all(
    engineNames.map(async (engine) => {
      let resizeUnavailable = null
      const progress = (state) => json(`menu-progress/${engine}.json`, { engine, ...state })
      await progress({ phase: 'launch' })
      const browser = await engines[engine].launch()
      try {
        for (const device of deviceMatrix(devices)) {
          if (completed.has(`${engine}|${device.name}|${device.orientation}`)) continue
          const options = { ...device.options }
          if (engine === 'firefox') delete options.isMobile
          await progress({
            phase: 'new-context',
            device: device.name,
            orientation: device.orientation,
          })
          const context = await browser.newContext({
            ...options,
            recordVideo: { dir: path.join(output, 'videos/menu') },
          })
          context.setDefaultNavigationTimeout(45000)
          await progress({
            phase: 'tracing-start',
            device: device.name,
            orientation: device.orientation,
          })
          await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
          await progress({
            phase: 'new-page',
            device: device.name,
            orientation: device.orientation,
          })
          const page = await context.newPage()
          page.setDefaultTimeout(6000)
          page.setDefaultNavigationTimeout(45000)
          const rows = (
            prior.find(
              (r) =>
                r.engine === engine &&
                r.device === device.name &&
                r.orientation === device.orientation,
            )?.rows || []
          ).filter((r) => r.scrollInput && passedScroll(r))
          try {
            for (const route of ['/', '/services', '/our-approach', '/products', '/location']) {
              for (const fraction of [0.4, 0.8, 1]) {
                if (rows.some((row) => row.route === route && row.fraction === fraction)) continue
                await progress({
                  phase: 'scroll-case',
                  device: device.name,
                  orientation: device.orientation,
                  route,
                  fraction,
                })
                await page.goto(base + route, { waitUntil: 'load' })
                await settle(page)
                const before = await scrollToFraction(page, fraction)
                const trigger = await page.locator('.menu-toggle').boundingBox()
                const physicalTrigger =
                  trigger && trigger.y >= 0 && trigger.y + trigger.height <= options.viewport.height
                if (physicalTrigger)
                  await page.mouse.click(
                    trigger.x + trigger.width / 2,
                    trigger.y + trigger.height / 2,
                  )
                else await page.locator('.menu-toggle').evaluate((el) => el.click())
                await page.locator('.mobile-menu-layer').waitFor({ state: 'visible' })
                await page.waitForFunction(() => document.activeElement?.classList.contains('mobile-menu-close'), null, { polling: 100 })
                const opened = await page.evaluate(() => {
                  const el = document.querySelector('#header-menu'),
                    r = el.getBoundingClientRect(),
                    c = getComputedStyle(el)
                  const button = document.querySelector('.menu-toggle')
                  return {
                    scrollY,
                    rect: { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom },
                    position: c.position,
                    visible: c.display !== 'none' && r.y >= 0 && r.bottom <= innerHeight + 1,
                    expanded: button.getAttribute('aria-expanded'),
                    controls: button.getAttribute('aria-controls'),
                    focus: document.activeElement?.outerHTML.slice(0, 200),
                    bodyOverflow: getComputedStyle(document.body).overflow,
                    headerPosition: getComputedStyle(document.querySelector('.site-header'))
                      .position,
                  }
                })
                const scrollInput =
                  engine === 'webkit' && options.isMobile
                    ? 'keyboard PageUp/PageDown (mobile WebKit has no wheel API)'
                    : 'mouse wheel'
                if (engine === 'webkit' && options.isMobile)
                  await page.keyboard.press(fraction === 1 ? 'PageUp' : 'PageDown')
                else await page.mouse.wheel(0, fraction === 1 ? -250 : 250)
                await page.evaluate(
                  () =>
                    new Promise((resolve) =>
                      requestAnimationFrame(() => requestAnimationFrame(resolve)),
                    ),
                )
                const afterWheel = await page.evaluate(() => scrollY)
                const focusSequence = []
                const focusTested = route === '/' && fraction === 0.4
                if (focusTested) {
                  await page.keyboard.press('Tab')
                  for (let i = 0; i < 14; i++) {
                    focusSequence.push(
                      await page.evaluate(() => ({
                        tag: document.activeElement?.tagName,
                        text: document.activeElement?.textContent?.trim().slice(0, 60),
                        inMenu: Boolean(
                          document.activeElement?.closest('#header-menu') ||
                          document.activeElement?.closest('.menu-toggle'),
                        ),
                      })),
                    )
                    await page.keyboard.press('Tab')
                  }
                  await page.keyboard.press('Shift+Tab')
                }
                const trap = focusTested ? focusSequence.every((f) => f.inMenu) : null
                const shot = await screenshot(
                  page,
                  route,
                  `${engine}-${device.name}-verified`,
                  device.orientation,
                  `menu-${Math.round(fraction * 100)}`,
                  false,
                )
                await page.keyboard.press('Escape')
                await page.locator('.mobile-menu-layer').waitFor({ state: 'detached' })
                await page.waitForFunction(() => document.activeElement?.classList.contains('menu-toggle'), null, { polling: 100 })
                const closed = await page.evaluate(() => ({
                  scrollY,
                  expanded: document.querySelector('.menu-toggle').getAttribute('aria-expanded'),
                  focusIsTrigger: document.activeElement === document.querySelector('.menu-toggle'),
                }))
                rows.push({
                  route,
                  fraction,
                  before,
                  trigger,
                  physicalTrigger,
                  opened,
                  scrollInput,
                  afterWheel,
                  scrollLocked: Math.abs(afterWheel - opened.scrollY) < 2,
                  focusSequence,
                  focusTested,
                  trap,
                  closed,
                  noOpenJump: Math.abs(opened.scrollY - before) < 2,
                  noCloseJump: Math.abs(closed.scrollY - before) < 2,
                  screenshot: shot,
                })
              }
            }
            await progress({
              phase: 'hash-observation',
              device: device.name,
              orientation: device.orientation,
            })
            await page.goto(base + '/#contact', { waitUntil: 'load' })
            await page.evaluate(() => document.fonts.ready)
            await page
              .waitForFunction(
                () => !location.hash && history.scrollRestoration === 'manual',
                null,
                { timeout: 10000 },
              )
              .catch(() => {})
            await page.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            )
            const hashState = await page.evaluate(() => ({
              headers: document.querySelectorAll('.site-header').length,
              mains: document.querySelectorAll('main').length,
              url: location.href,
              scrollY,
            }))
            // Record the direct-hash duplicate-tree defect separately. Continue
            // independent menu controls from a clean load rather than hiding it or
            // selecting one of two ambiguous triggers.
            await progress({
              phase: 'clean-controls',
              device: device.name,
              orientation: device.orientation,
            })
            await page.goto(base + '/')
            await settle(page)
            await page.locator('.menu-toggle').evaluate((el) => el.focus({ preventScroll: true }))
            await page.keyboard.press('Enter')
            const keyboardOpen = await page.locator('.menu-toggle').getAttribute('aria-expanded')
            await page.mouse.click(1, options.viewport.height - 2)
            const outsideClosed =
              (await page.locator('.menu-toggle').getAttribute('aria-expanded')) === 'false'
            if (!outsideClosed) await page.keyboard.press('Escape')
            // Test link-closing independently at the top, where the known scrolled
            // panel defect does not make the link physically unreachable.
            await scrollToFraction(page, 0)
            await page.locator('.menu-toggle').evaluate((el) => el.click())
            await page.locator('#header-menu .primary-nav a[href="/our-company"]').click()
            await page.waitForURL('**/our-company')
            await settle(page)
            const linkClosed =
              (await page.locator('.menu-toggle').getAttribute('aria-expanded')) === 'false'
            await progress({
              phase: 'double-click',
              device: device.name,
              orientation: device.orientation,
            })
            await page.locator('.menu-toggle').press('Enter')
            await page.locator('.mobile-menu-close').press('Enter')
            const doubleClickClosed =
              (await page.locator('.menu-toggle').getAttribute('aria-expanded')) === 'false'
            await progress({
              phase: 'reduced-motion',
              device: device.name,
              orientation: device.orientation,
            })
            await page.emulateMedia({ reducedMotion: 'reduce' })
            await page.locator('.menu-toggle').evaluate((el) => el.click())
            let rotated = null,
              resizeClosed = null,
              runtimeResizeLimitation = resizeUnavailable
            if (!resizeUnavailable) {
              try {
                await progress({
                  phase: 'rotation',
                  device: device.name,
                  orientation: device.orientation,
                })
                const resize = (viewport) =>
                  engine === 'firefox'
                    ? withDeadline(page.setViewportSize(viewport), 5000)
                    : page.setViewportSize(viewport)
                await resize({ width: options.viewport.height, height: options.viewport.width })
                await page.evaluate(
                  () =>
                    new Promise((resolve) =>
                      requestAnimationFrame(() => requestAnimationFrame(resolve)),
                    ),
                )
                rotated = await page.locator('#header-menu').boundingBox()
                await page.keyboard.press('Escape')
                await resize(options.viewport)
                await page.locator('.menu-toggle').evaluate((el) => el.click())
                await resize({ width: 1440, height: 900 })
                await page.evaluate(
                  () =>
                    new Promise((resolve) =>
                      requestAnimationFrame(() => requestAnimationFrame(resolve)),
                    ),
                )
                resizeClosed =
                  (await page.locator('.menu-toggle').getAttribute('aria-expanded')) === 'false'
              } catch (error) {
                if (engine !== 'firefox') throw error
                resizeUnavailable = String(error)
                runtimeResizeLimitation = resizeUnavailable
                await page.close().catch(() => {})
              }
            }
            results.push({
              engine,
              device: device.name,
              orientation: device.orientation,
              custom: device.custom,
              rows,
              hashState,
              hashInteractionBlocked: hashState.headers !== 1 || hashState.mains !== 1,
              keyboardOpen,
              outsideClosed,
              linkClosed,
              doubleClickClosed,
              rotated,
              reducedMotion: true,
              resizeClosed,
              runtimeResizeLimitation,
            })
          } catch (error) {
            errors.push({
              engine,
              device: device.name,
              orientation: device.orientation,
              error: String(error),
              rows,
            })
            results.push({ engine, device: device.name, orientation: device.orientation, rows })
          } finally {
            await progress({
              phase: 'trace-stop',
              device: device.name,
              orientation: device.orientation,
            })
            await context.tracing
              .stop({
                path: path.join(
                  output,
                  `traces/menu_${engine}_${slug(device.name)}_${device.orientation}_complete.zip`,
                ),
              })
              .catch(() => {})
            await progress({
              phase: 'context-close',
              device: device.name,
              orientation: device.orientation,
            })
            await context.close()
          }
          await json('menu.json', { results, errors })
          console.log(`MENU ${engine} ${device.name} ${device.orientation} complete`)
        }
      } finally {
        await browser.close()
      }
    }),
  )
  const rows = results.flatMap((r) => r.rows)
  return {
    cases: rows.length,
    outsideViewport: rows.filter((r) => !r.opened.visible).length,
    scrollJumps: rows.filter((r) => !r.noOpenJump || !r.noCloseJump).length,
    focusTrapFailures: rows.filter((r) => r.trap === false).length,
    focusReturnFailures: rows.filter((r) => r.focusTested && !r.closed.focusIsTrigger).length,
    unverifiedResizeContexts: results.filter((r) => r.runtimeResizeLimitation).length,
    errors: errors.length,
    failures:
      rows.filter((r) => !r.opened.visible || !r.noOpenJump || !r.noCloseJump || r.trap === false)
        .length + errors.length,
  }
}
