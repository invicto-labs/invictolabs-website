import { json, settle, screenshot, scrollToFraction, collectErrors } from '../helpers/evidence.mjs'
export async function run({ inventory, engines }) {
  const documents = [],
    browserCases = []
  for (const route of [
    ...inventory.sitemap,
    '/SERVICES',
    '/services/',
    '/home',
    '/locations',
    '/approach',
    '/blogs/does-not-exist',
  ]) {
    try {
      const r = await fetch('https://invictolabs.com' + route, {
        redirect: 'manual',
        signal: AbortSignal.timeout(15000),
      })
      const html = await r.text()
      documents.push({
        route,
        status: r.status,
        location: r.headers.get('location'),
        title: html.match(/<title>(.*?)<\/title>/s)?.[1],
        canonical: html.match(/rel="canonical"[^>]*href="([^"]*)"/)?.[1],
        robots: html.match(/name="robots"[^>]*content="([^"]*)"/)?.[1],
        h1Count: [...html.matchAll(/<h1(?:\s|>)/g)].length,
        description: html.match(/name="description"[^>]*content="([^"]*)"/)?.[1],
      })
    } catch (error) {
      documents.push({ route, error: String(error) })
    }
  }
  const home = await (await fetch('https://invictolabs.com/')).text()
  const resources = [
    ...new Set(
      [...home.matchAll(/(?:src|href)="(\/(?:assets|fonts|images)\/[^"?#]+)"/g)].map((m) => m[1]),
    ),
  ]
  const resourceHeaders = []
  for (const resource of resources) {
    const r = await fetch('https://invictolabs.com' + resource, { method: 'HEAD' })
    resourceHeaders.push({
      resource,
      status: r.status,
      cache: r.headers.get('cache-control'),
      encoding: r.headers.get('content-encoding'),
      contentType: r.headers.get('content-type'),
    })
  }
  const sourceMapProbes = []
  for (const resource of resources.filter((r) => r.endsWith('.js')).slice(0, 3)) {
    const url = 'https://invictolabs.com' + resource + '.map'
    const r = await fetch(url, { method: 'HEAD' })
    sourceMapProbes.push({ url, status: r.status })
  }
  const browser = await engines.chromium.launch()
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      const page = await context.newPage()
      const requests = []
      page.on('request', (r) => requests.push({ url: r.url(), type: r.resourceType() }))
      for (const route of [
        '/',
        '/services',
        '/our-approach',
        '/products/tax-flow',
        '/privacy-policy',
      ]) {
        const start = requests.length,
          events = collectErrors(page)
        try {
          const response = await page.goto('https://invictolabs.com' + route, {
            waitUntil: 'load',
            timeout: 45000,
          })
          await settle(page)
          const state = await page.evaluate(() => ({
            title: document.title,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            h1: [...document.querySelectorAll('h1')].map((e) => e.textContent),
            localStorageKeys: Object.keys(localStorage),
            sessionStorageKeys: Object.keys(sessionStorage),
            scrollWidth: document.documentElement.scrollWidth,
            viewport: innerWidth,
            cookie: document.cookie,
          }))
          let menu
          if (width === 390) {
            await scrollToFraction(page, 0.8)
            const trigger = await page.locator('.menu-toggle').boundingBox()
            await page.mouse.click(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2)
            menu = await page.evaluate(() => ({
              scrollY,
              menuTop: document.querySelector('#header-menu').getBoundingClientRect().top,
              headerTop: document.querySelector('.site-header').getBoundingClientRect().top,
              bodyOverflow: getComputedStyle(document.body).overflow,
            }))
            await page.keyboard.press('Escape')
          }
          browserCases.push({
            route,
            width,
            status: response.status(),
            state,
            menu,
            events,
            requests: requests.slice(start),
            cookies: await context.cookies(),
            screenshot: await screenshot(
              page,
              route,
              `live-chromium-${width}`,
              width < 900 ? 'portrait' : 'landscape',
              'live',
            ),
          })
        } catch (error) {
          browserCases.push({ route, width, error: String(error) })
        }
        page.removeAllListeners('console')
        page.removeAllListeners('pageerror')
        page.removeAllListeners('requestfailed')
        page.removeAllListeners('response')
      }
      await context.close()
    }
  } finally {
    await browser.close()
  }
  await json('live.json', {
    documents,
    resourceHeaders,
    sourceMapProbes,
    browserCases,
    note: 'Public GET/HEAD and read-only browser visits only. No live form inputs, mail handlers, messages or settings were changed.',
  })
  return {
    documents: documents.length,
    browserCases: browserCases.length,
    unverified:
      documents.filter((d) => d.error).length + browserCases.filter((c) => c.error).length,
    failures: 0,
  }
}
