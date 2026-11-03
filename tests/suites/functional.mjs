import { json, settle, screenshot, scrollToFraction } from '../helpers/evidence.mjs'
export async function run({ base, routes, engines, engineNames }) {
  const pages = [],
    forms = [],
    interactions = [],
    errors = [],
    controls = []
  await Promise.all(
    engineNames.map(async (engine) => {
      const browser = await engines[engine].launch()
      try {
        for (const width of (process.env.QA_FUNCTIONAL_WIDTHS || '390,1440')
          .split(',')
          .map(Number)) {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            hasTouch: width === 390,
          })
          const page = await context.newPage()
          page.setDefaultTimeout(15000)
          page.setDefaultNavigationTimeout(45000)
          for (const route of process.env.QA_FUNCTIONAL_FOCUS === 'forms' ? [] : routes) {
            try {
              await page.goto(base + route, { waitUntil: 'load' })
              await settle(page)
              const inventory = await page.evaluate(() => ({
                links: [...document.querySelectorAll('a')].map((el) => ({
                  text: (el.getAttribute('aria-label') || el.textContent).trim(),
                  href: el.getAttribute('href'),
                  target: el.target,
                  rel: el.rel,
                })),
                buttons: [...document.querySelectorAll('button')].map((el) => ({
                  text: (el.getAttribute('aria-label') || el.textContent).trim(),
                  type: el.type,
                  controls: el.getAttribute('aria-controls'),
                  expanded: el.getAttribute('aria-expanded'),
                })),
              }))
              await page.keyboard.press('Tab')
              const firstFocus = await page.evaluate(() => ({
                tag: document.activeElement.tagName,
                text: document.activeElement.textContent.trim(),
                outline: getComputedStyle(document.activeElement).outline,
                href: document.activeElement.getAttribute('href'),
              }))
              if (firstFocus.text !== 'Skip to main content')
                await page.locator('.skip-link').focus()
              {
                await page.keyboard.press('Enter')
                await page
                  .waitForFunction(() => document.activeElement?.tagName === 'MAIN', null, {
                    timeout: 3000,
                  })
                  .catch(() => {})
              }
              const skip = await page.evaluate(() => ({
                activeId: document.activeElement.id,
                mainFocused: document.activeElement.tagName === 'MAIN',
                url: location.href,
              }))
              skip.nativeFirstTabReachedLink = firstFocus.text === 'Skip to main content'
              skip.explicitFocusUsed = !skip.nativeFirstTabReachedLink
              await scrollToFraction(page, 0)
              let cta
              if (width === 390) await page.locator('.menu-toggle').click()
              const ctaLink = page.locator('.header-actions a.button')
              if (await ctaLink.count()) {
                await ctaLink.click()
                await settle(page)
                await page
                  .waitForFunction(
                    () => {
                      const r = document.querySelector('#contact')?.getBoundingClientRect()
                      return r && r.top >= 0 && r.top < innerHeight
                    },
                    null,
                    { timeout: 3000 },
                  )
                  .catch(() => {})
                cta = await page.evaluate(() => {
                  const el = document.querySelector('#contact'),
                    r = el?.getBoundingClientRect()
                  return {
                    url: location.href,
                    scrollY,
                    hasForm: Boolean(el),
                    formTop: r?.top,
                    formVisible: Boolean(r && r.top >= 0 && r.top < innerHeight),
                    active: document.activeElement?.id,
                  }
                })
              }
              pages.push({ route, engine, width, inventory, firstFocus, skip, cta })
            } catch (error) {
              const state = await Promise.race([page.evaluate(() => ({url:location.href,headers:document.querySelectorAll('.site-header').length,mains:document.querySelectorAll('main').length,restoration:history.scrollRestoration})).catch(()=>null),new Promise(resolve=>setTimeout(()=>resolve(null),2000))])
              errors.push({ route, engine, width, error: String(error), state })
            }
          }
          // Exercise each distinct local control family; shared header/form copies
          // are inventoried on every route and tested in their dedicated checks.
          for (const [route, selector] of process.env.QA_FUNCTIONAL_FOCUS === 'forms'
            ? []
            : [
                ['/faq', '.faq-list button'],
                ['/services', '.service-atelier__selector button'],
                ...['title', 'mortgage', 'tax-property', 'technology'].map((slug) => [
                  '/services/' + slug,
                  'details summary',
                ]),
                ...['title', 'mortgage', 'tax-property', 'technology'].map((slug) => [
                  '/services/' + slug,
                  '.service-scope-tabs button',
                ]),
                ['/products/traceq', '.traceq-gallery__controls button'],
                ['/products/tax-flow', '.tax-experience__rail button'],
                ['/products/tax-flow', '.tax-cert-sample__toggle'],
                ['/blogs', '.journal-filters button'],
                ['/case-studies', '.journal-filters button'],
              ]) {
            try {
              await page.goto(base + route)
              await settle(page)
              const buttons = page.locator(selector)
              const count = await buttons.count()
              if (!count)
                controls.push({
                  engine,
                  width,
                  route,
                  selector,
                  notRendered: true,
                  note: 'No matching control was rendered; not a passing interaction test.',
                })
              for (let i = 0; i < count; i++) {
                const button = buttons.nth(i),
                  label = await button.innerText()
                await button.scrollIntoViewIfNeeded()
                await button.focus()
                await page.keyboard.press('Enter')
                controls.push({
                  engine,
                  width,
                  route,
                  selector,
                  index: i,
                  label,
                  expanded: await button.getAttribute('aria-expanded'),
                  pressed: await button.getAttribute('aria-pressed'),
                  controls: await button.getAttribute('aria-controls'),
                  nativeOpen: await button.evaluate((el) => el.closest('details')?.open ?? null),
                })
              }
              if (['/blogs', '/case-studies'].includes(route)) {
                const input = page.locator('input[type="search"]')
                await input.fill('qa-no-matching-story-<script>')
                controls.push({
                  engine,
                  width,
                  route,
                  test: 'search-empty',
                  emptyVisible: await page.locator('.journal-empty').isVisible(),
                })
                await page.locator('.journal-empty button').click()
                controls.push({
                  engine,
                  width,
                  route,
                  test: 'search-reset',
                  cards: await page.locator('.journal-card').count(),
                })
              }
            } catch (error) {
              errors.push({ engine, width, route, controlFamily: selector, error: String(error) })
            }
          }
          for (const suffix of process.env.QA_FUNCTIONAL_FOCUS === 'forms'
            ? []
            : [
                '/services?qa=%3Cscript%3Ewindow.__qaXss%3Dtrue%3C%2Fscript%3E',
                '/products?redirect=https%3A%2F%2Fexample.invalid',
                '/services//#contact',
                '/services#%E0%A4%A',
              ]) {
            try {
              await page.goto(base + suffix)
              await page.evaluate(() => document.fonts.ready)
              await page.evaluate(
                () =>
                  new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve)),
                  ),
              )
              const state = await page.evaluate(() => ({
                origin: location.origin,
                xssExecuted: Boolean(window.__qaXss),
                headers: document.querySelectorAll('.site-header').length,
                mains: document.querySelectorAll('main').length,
              }))
              interactions.push({
                engine,
                width,
                test: 'url-edge-case',
                input: suffix,
                url: page.url(),
                ...state,
                ...(state.headers > 1 || state.mains > 1
                  ? {
                      screenshot: await screenshot(
                        page,
                        suffix,
                        `${engine}-url-${width}`,
                        width < 768 ? 'portrait' : 'landscape',
                        'duplicate',
                        false,
                      ),
                    }
                  : {}),
              })
            } catch (error) {
              errors.push({
                engine,
                width,
                test: 'url-edge-case',
                input: suffix,
                error: String(error),
              })
            }
          }
          await page.goto(base + '/')
          await settle(page)
          const form = page.locator('.inquiry-form')
          await form.locator('button[type="submit"]').click()
          forms.push({
            engine,
            width,
            test: 'empty',
            invalid: await form.evaluate((el) => !el.checkValidity()),
            draftCount: await page.locator('.inquiry-draft').count(),
          })
          await form.locator('[name="name"]').fill('QA synthetic tester')
          await form.locator('[name="organization"]').fill('Example QA')
          await form.locator('[name="message"]').fill('Synthetic audit inquiry only. Do not send.')
          await form.locator('[name="email"]').fill('invalid-email')
          await form.locator('button[type="submit"]').click()
          forms.push({
            engine,
            width,
            test: 'invalid-email',
            invalid: await form.evaluate((el) => !el.checkValidity()),
            draftCount: await page.locator('.inquiry-draft').count(),
          })
          for (const [name, message] of [
            ['unicode', 'A&B + café Bengaluru 中文 🏡\nLine two: scope?'],
            [
              'xss',
              '<img src=x onerror="window.__qaXss=true"><script>window.__qaXss=true</script>',
            ],
            ['sql', "'; DROP TABLE orders; --"],
            ['long', 'x'.repeat(5000)],
            ['long-unicode', '屋'.repeat(1200)],
          ]) {
            await form.locator('[name="email"]').fill('qa@example.invalid')
            await form.locator('[name="message"]').fill(message)
            await form.locator('button[type="submit"]').click()
            const draft = await page.locator('.inquiry-draft').count()
            const state = await page.evaluate(() => ({
              xssExecuted: Boolean(window.__qaXss),
              inputLength: document.querySelector('[name="message"]').value.length,
              body: document.querySelector('.inquiry-draft textarea')?.value,
              mailto: document.querySelector('.inquiry-draft a')?.getAttribute('href'),
              status: document.querySelector('.inquiry-draft [role="status"]')?.textContent,
              requiredValid: document.querySelector('.inquiry-form').checkValidity(),
            }))
            forms.push({
              engine,
              width,
              test: name,
              draft,
              ...state,
              mailtoLength: state.mailto?.length,
              decodedBody: state.mailto ? new URL(state.mailto).searchParams.get('body') : null,
            })
          }
          await form.locator('button[type="submit"]').dblclick()
          forms.push({
            engine,
            width,
            test: 'double-submit',
            draftCount: await page.locator('.inquiry-draft').count(),
            screenshot: await screenshot(
              page,
              '/',
              `${engine}-form-${width}`,
              width < 768 ? 'portrait' : 'landscape',
              'draft',
            ),
          })
          await page.locator('.inquiry-draft button').click()
          forms.push({
            engine,
            width,
            test: 'copy-draft',
            status: await page.locator('.inquiry-draft [role="status"]').last().innerText(),
          })
          // Prevent the operating system mail handler from opening; inspect the native draft URL instead.
          await page.evaluate(() =>
            document
              .querySelector('.inquiry-draft a')
              .addEventListener('click', (e) => e.preventDefault(), { once: true }),
          )
          await page.locator('.inquiry-draft a').click()
          interactions.push({
            engine,
            width,
            test: 'draft-mailto-intercepted',
            url: page.url(),
            draftCount: await page.locator('.inquiry-draft').count(),
            note: 'OS launch intentionally suppressed. Back/Forward scroll restoration is checked independently in robustness.',
          })
          await page.goto(base + '/faq')
          await settle(page)
          const button = page.locator('.faq-list button').nth(1)
          await button.focus()
          await page.keyboard.press('Enter')
          interactions.push({
            engine,
            width,
            test: 'faq-keyboard',
            expanded: await button.getAttribute('aria-expanded'),
          })
          await page.emulateMedia({ reducedMotion: 'reduce' })
          await page.goto(base + '/location')
          await settle(page)
          const canvas = page.locator('.locations-globe canvas')
          if (await canvas.count()) {
            await canvas.scrollIntoViewIfNeeded()
            const rect = await canvas.boundingBox()
            const before = await canvas.evaluate((el) => el.toDataURL())
            if (width === 390) {
              await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2)
            }
            await page.mouse.move(rect.x + rect.width * 0.4, rect.y + rect.height * 0.5)
            await page.mouse.down()
            const pointerHandlerActive = await page
              .locator('.locations-globe')
              .evaluate((el) => el.classList.contains('is-dragging'))
            await page.mouse.move(rect.x + rect.width * 0.65, rect.y + rect.height * 0.4, {
              steps: 8,
            })
            await page.mouse.up()
            const after = await canvas.evaluate((el) => el.toDataURL())
            interactions.push({
              engine,
              width,
              test: 'network-drag',
              reducedMotion: true,
              pointerHandlerActive,
              canvasChanges: before !== after,
              semantics: await canvas.evaluate((el) => ({
                role: el.getAttribute('role'),
                label: el.getAttribute('aria-label'),
                tabIndex: el.tabIndex,
                touchAction: getComputedStyle(el).touchAction,
                keyboardHandler: el.getAttribute('onkeydown'),
              })),
              screenshot: await screenshot(
                page,
                '/location',
                `${engine}-network-${width}`,
                width < 768 ? 'portrait' : 'landscape',
                'drag',
                false,
              ),
            })
          }
          await page.emulateMedia({ reducedMotion: 'no-preference' })
          for (const route of ['/', '/products', '/our-approach']) {
            await page.goto(base + route)
            await settle(page)
            for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
              await scrollToFraction(page, fraction)
              interactions.push({
                engine,
                width,
                test: 'scroll-expand',
                route,
                fraction,
                state: await page.evaluate(() =>
                  [...document.querySelectorAll('#services,#approach,.product-reveal-v3')].map(
                    (el) => ({
                      id: el.id,
                      className: el.className,
                      deck: getComputedStyle(el).getPropertyValue('--deck-progress'),
                      approach: getComputedStyle(el).getPropertyValue('--approach-progress'),
                      product: getComputedStyle(el).getPropertyValue('--product-reveal-progress'),
                      height: el.getBoundingClientRect().height,
                    }),
                  ),
                ),
              })
            }
          }
          await context.close()
        }
      } catch (error) {
        errors.push({ engine, error: String(error) })
      } finally {
        await browser.close()
      }
      await json('functional.json', { pages, forms, interactions, controls, errors })
    }),
  )
  await json('functional.json', { pages, forms, interactions, controls, errors })
  const formFailures = forms.filter(
    (f) =>
      f.xssExecuted ||
      (['empty', 'invalid-email'].includes(f.test) && (!f.invalid || f.draftCount !== 0)) ||
      (['unicode', 'xss', 'sql', 'long', 'long-unicode'].includes(f.test) &&
        (f.draft !== 1 || !f.requiredValid || f.decodedBody !== f.body)),
  ).length
  const missingTargets = pages.filter((p) => p.cta && !p.cta.hasForm).length,
    skipFailures = pages.filter((p) => !p.skip.mainFocused).length,
    duplicateTrees = interactions.filter(
      (r) => r.test === 'url-edge-case' && (r.headers > 1 || r.mains > 1),
    ).length
  return {
    pages: pages.length,
    forms: forms.length,
    skipFailures,
    ctaMissingTargets: missingTargets,
    duplicateTrees,
    formFailures,
    errors: errors.length,
    failures: errors.length + formFailures + missingTargets + skipFailures + duplicateTrees,
  }
}
