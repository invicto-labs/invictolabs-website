import { json, screenshot } from '../helpers/evidence.mjs'
export async function run({ base, engines, engineNames }) {
  const results = []
  for (const engine of engineNames) {
    const browser = await engines[engine].launch()
    try {
      for (const mode of [
        'javascript-enabled',
        'javascript-disabled',
        'scripts-blocked',
        'direct-hash-hydrated',
      ]) {
        const context = await browser.newContext({
            viewport: { width: 390, height: 844 },
            javaScriptEnabled: mode !== 'javascript-disabled',
          }),
          page = await context.newPage()
        const attempted = [],
          consoleMessages = []
        page.on('console', (message) =>
          consoleMessages.push({ type: message.type(), text: message.text() }),
        )
        await context.route('**/*', (route) => {
          const request = route.request(),
            url = new URL(request.url())
          if (request.resourceType() === 'document' && url.searchParams.has('name')) {
            attempted.push({
              url: request.url(),
              method: request.method(),
              parameterNames: [...url.searchParams.keys()],
            })
            return route.abort()
          }
          if (mode === 'scripts-blocked' && request.resourceType() === 'script')
            return route.abort()
          return route.continue()
        })
        await page.goto(base + (mode === 'direct-hash-hydrated' ? '/#contact' : '/'), {
          waitUntil: 'load',
        })
        if (['javascript-enabled', 'direct-hash-hydrated'].includes(mode))
          await page.waitForFunction(
            () => !location.hash && history.scrollRestoration === 'manual',
            null,
            { timeout: 15000 },
          )
        const forms = page.locator('.inquiry-form'),
          rendered = await forms.count(),
          form = forms.first(),
          button = form.locator('button[type="submit"]')
        const interactive = rendered && (await form.isVisible()) && (await button.isEnabled())
        const attributes = rendered
          ? { action: await form.getAttribute('action'), method: await form.getAttribute('method') }
          : {}
        if (interactive) {
          await form.locator('[name="name"]').fill('Synthetic QA')
          await form.locator('[name="email"]').fill('qa@example.invalid')
          await form.locator('[name="organization"]').fill('QA Example')
          await form
            .locator('[name="message"]')
            .fill('Synthetic audit data only. No user information.')
          const before = await form.evaluate((el) => ({
            valid: el.checkValidity(),
            method: el.method,
            action: el.action,
            fields: [...el.elements]
              .filter((e) => e.name)
              .map((e) => ({
                name: e.name,
                value: e.value,
                valid: e.validity?.valid,
                message: e.validationMessage,
              })),
          }))
          await button.scrollIntoViewIfNeeded()
          await button.focus()
          const shot = await screenshot(
            page,
            '/',
            `${engine}-${mode}-form`,
            'portrait',
            'before-submit',
            false,
          )
          const request = page
            .waitForRequest(
              (r) => r.resourceType() === 'document' && new URL(r.url()).searchParams.has('name'),
              { timeout: 5000 },
            )
            .catch(() => null)
          const activeBefore = await page.evaluate(() => ({
            tag: document.activeElement.tagName,
            text: document.activeElement.textContent?.slice(0, 80),
          }))
          let activationError
          try {
            await page.keyboard.press('Enter')
          } catch (error) {
            activationError = String(error)
          }
          await request
          let directSubmit
          if (!attempted.length && (await form.count())) {
            const directRequest = page
              .waitForRequest(
                (r) => r.resourceType() === 'document' && new URL(r.url()).searchParams.has('name'),
                { timeout: 3000 },
              )
              .catch(() => null)
            try {
              directSubmit = await form.evaluate((el) => {
                window.__qaSubmitEvents = []
                el.addEventListener('submit', (event) => {
                  const record = { defaultPrevented: event.defaultPrevented }
                  window.__qaSubmitEvents.push(record)
                  queueMicrotask(() => (record.defaultPreventedAfter = event.defaultPrevented))
                })
                el.requestSubmit()
                return {
                  called: true,
                  events: window.__qaSubmitEvents,
                  tag: el.tagName,
                  target: el.target,
                  onsubmit: el.getAttribute('onsubmit'),
                }
              })
            } catch (error) {
              directSubmit = { error: String(error) }
            }
            await directRequest
          }
          results.push({
            engine,
            mode,
            attributes,
            interactive,
            renderedForms: rendered,
            before,
            activeBefore,
            activationError,
            directSubmit,
            consoleMessages,
            draftCount: await page.locator('.inquiry-draft').count(),
            attempted,
            urlAfter: page.url(),
            screenshot: shot,
          })
        } else
          results.push({
            engine,
            mode,
            attributes,
            interactive,
            attempted,
            note: 'Form unavailable/disabled without application scripts; inspect the native contact fallback separately.',
          })
        await context.close()
      }
    } finally {
      await browser.close()
    }
  }
  await json('nojs-form.json', {
    results,
    note: 'Only reserved synthetic data was used on localhost. Native document requests containing fields were intercepted and aborted before reaching the server; no live form input or message was sent.',
  })
  return {
    cases: results.length,
    nativeGETFieldExposures: results.filter((r) => r.attempted.some((a) => a.method === 'GET'))
      .length,
    failures: results.filter((r) => r.attempted.length).length,
  }
}
