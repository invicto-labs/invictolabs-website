import { json, screenshot } from '../helpers/evidence.mjs'
export async function run({ base, engines, engineNames }) {
  const results = []
  for (const engine of engineNames) {
    const browser = await engines[engine].launch()
    try {
      for (const mode of ['default', 'normalize-before-hydration']) {
        const context = await browser.newContext({
            viewport: { width: 390, height: 844 },
            hasTouch: true,
            ...(engine !== 'firefox' ? { isMobile: true } : {}),
          }),
          page = await context.newPage()
        if (mode === 'normalize-before-hydration')
          await context.addInitScript(() => {
            if (location.hash) {
              const url = new URL(location.href)
              let target
              try {
                target = decodeURIComponent(url.hash.slice(1))
              } catch {
                target = url.hash.slice(1)
              }
              url.hash = ''
              history.replaceState({ ...history.state, usr: { scrollTarget: target } }, '', url)
            }
          })
        const cases =
          mode === 'default'
            ? ['/#contact', '/services#contact', '/products#product-system', '/']
            : ['/#contact']
        for (const target of cases) {
          const events = []
          page.on('pageerror', (error) => events.push(error.message))
          await page.goto(base + target, { waitUntil: 'load' })
          await page.evaluate(() => document.fonts.ready)
          await page
            .waitForFunction(() => !location.hash && history.scrollRestoration === 'manual', null, {
              timeout: 10000,
            })
            .catch(() => {})
          await page.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          results.push({
            engine,
            mode,
            target,
            events,
            state: await page.evaluate(() => ({
              url: location.href,
              mainCount: document.querySelectorAll('main').length,
              headers: document.querySelectorAll('.site-header').length,
              restoration: history.scrollRestoration,
              historyState: history.state,
              loading: document.querySelectorAll('.route-loading').length,
              h1: [...document.querySelectorAll('h1')].map((el) => el.textContent),
              bodyChildren: [...document.body.children].map((el) => ({
                tag: el.tagName,
                id: el.id,
              })),
              scrollY,
            })),
            screenshot: await screenshot(
              page,
              target.replace('#', '-hash-'),
              `${engine}-hash-${mode}`,
              'portrait',
              'direct',
              false,
            ),
          })
          page.removeAllListeners('pageerror')
        }
        await context.close()
      }
      if (engine === 'chromium' && process.env.QA_CHECK_LIVE === '1') {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 } }),
          page = await context.newPage()
        for (const target of ['/#contact', '/services#contact', '/products#product-system']) {
          await page.goto('https://invictolabs.com' + target, { waitUntil: 'load' })
          await page.evaluate(() => document.fonts.ready)
          await page
            .waitForFunction(() => !location.hash && history.scrollRestoration === 'manual', null, {
              timeout: 15000,
            })
            .catch(() => {})
          await page.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          results.push({
            engine,
            mode: 'live-default',
            target,
            state: await page.evaluate(() => ({
              url: location.href,
              headers: document.querySelectorAll('.site-header').length,
              mainCount: document.querySelectorAll('main').length,
              h1: document.querySelectorAll('h1').length,
            })),
            screenshot: await screenshot(
              page,
              target.replace('#', '-hash-'),
              'live-hash-settled',
              'portrait',
              'direct',
              false,
            ),
          })
        }
        await context.close()
      }
    } finally {
      await browser.close()
    }
  }
  await json('hash-diagnostic.json', results)
  const duplicateTrees = results.filter(
    (r) => r.mode === 'default' && (r.state.headers !== 1 || r.state.mainCount !== 1),
  ).length
  return { cases: results.length, duplicateTrees, failures: duplicateTrees }
}
