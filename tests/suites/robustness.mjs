import { json, settle, screenshot, collectErrors, scrollToFraction } from '../helpers/evidence.mjs'
import { inspectLayout } from '../helpers/layout.mjs'
export async function run({ base, routes, engines, engineNames }) {
  const results = [],
    errors = []
  await Promise.all(
    engineNames.map(async (engine) => {
      const browser = await engines[engine].launch()
      try {
        for (const mode of [
          'no-js',
          'reduced-motion',
          'forced-colors',
          'text-150',
          'text-200',
          'reflow-200',
          'reflow-400',
          'print',
        ]) {
          const selected = ['no-js', 'reduced-motion'].includes(mode)
            ? routes
            : [
                '/',
                '/services',
                '/our-approach',
                '/products/traceq',
                '/location',
                '/privacy-policy',
              ]
          const width =
            mode === 'reflow-400'
              ? 320
              : mode === 'reflow-200'
                ? 640
                : mode === 'no-js'
                  ? 390
                  : 1440
          const context = await browser.newContext({
            viewport: { width, height: mode === 'reflow-400' ? 225 : 900 },
            javaScriptEnabled: mode !== 'no-js',
            reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
            forcedColors: mode === 'forced-colors' ? 'active' : 'none',
          })
          const page = await context.newPage()
          for (const route of selected) {
            try {
              const events = collectErrors(page)
              const response = await page.goto(base + route, { waitUntil: 'load' })
              if (mode !== 'no-js') await settle(page)
              if (mode.startsWith('text-'))
                await page.addStyleTag({ content: `html{font-size:${mode.slice(5)}%!important}` })
              if (mode === 'print') await page.emulateMedia({ media: 'print' })
              const layout = await inspectLayout(page)
              const state = await page.evaluate(() => ({
                title: document.title,
                mainText: document.querySelector('main')?.innerText.length,
                h1: document.querySelector('h1')?.textContent,
                navLinks: document.querySelectorAll('header a').length,
                navVisible: [...document.querySelectorAll('header a')].filter((el) => {
                  const r = el.getBoundingClientRect()
                  return r.width && r.height
                }).length,
                animations: [...document.querySelectorAll('*')]
                  .filter((el) => {
                    const c = getComputedStyle(el)
                    return c.animationName !== 'none' && c.animationDuration !== '0s'
                  })
                  .slice(0, 40)
                  .map((el) => ({
                    tag: el.tagName,
                    className: String(el.className),
                    duration: getComputedStyle(el).animationDuration,
                  })),
                favicon: document.querySelector('link[rel*="icon"]')?.getAttribute('href'),
                manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
                themeColor: document.querySelector('meta[name="theme-color"]')?.content,
                colorScheme: getComputedStyle(document.documentElement).colorScheme,
              }))
              results.push({
                engine,
                mode,
                route,
                width,
                status: response.status(),
                state,
                horizontalOverflow: layout.horizontalOverflow,
                smallTargets: layout.smallTargets.length,
                events,
                screenshot: await screenshot(
                  page,
                  route,
                  `${engine}-${mode}`,
                  width < 900 ? 'portrait' : 'landscape',
                  mode,
                ),
              })
              page.removeAllListeners('console')
              page.removeAllListeners('pageerror')
              page.removeAllListeners('requestfailed')
              page.removeAllListeners('response')
            } catch (error) {
              errors.push({ engine, mode, route, error: String(error) })
            }
          }
          await context.close()
          console.log(`ROBUST ${engine} ${mode} complete`)
          await json('robustness.json', { results, errors })
        }
        const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
        const page = await context.newPage()
        await page.goto(base + '/')
        await settle(page)
        await scrollToFraction(page, 0.4)
        await page.locator('footer a[href="/services"]').click()
        await page.waitForURL('**/services')
        await page.goBack()
        await settle(page)
        results.push({
          engine,
          mode: 'back-scroll-restoration',
          scrollY: await page.evaluate(() => scrollY),
        })
        await context.setOffline(true)
        let offlineError
        try {
          await page.reload({ timeout: 8000 })
        } catch (e) {
          offlineError = String(e)
        }
        results.push({
          engine,
          mode: 'offline',
          error: offlineError,
          content: await page
            .locator('body')
            .innerText()
            .catch(() => '(browser offline error)'),
        })
        await context.setOffline(false)
        for (const mode of ['failed-fonts', 'failed-images', 'adblock-simulation']) {
          await page.unrouteAll()
          await page.route(
            mode === 'failed-fonts'
              ? '**/*.woff2'
              : mode === 'failed-images'
                ? '**/*.{webp,png,jpg}'
                : '**/*',
            (route) => {
              const u = route.request().url()
              if (
                mode === 'adblock-simulation' &&
                !/google-analytics|googletagmanager|doubleclick|hotjar|facebook.*tr/.test(u)
              )
                return route.continue()
              return route.abort()
            },
          )
          await page.goto(base + '/')
          await settle(page)
          results.push({
            engine,
            mode,
            heading: await page.locator('h1').innerText(),
            screenshot: await screenshot(page, '/', `${engine}-${mode}`, 'portrait', mode),
          })
        }
        if (engine === 'chromium') {
          await page.unrouteAll()
          const session = await context.newCDPSession(page)
          for (const rate of [4, 6]) {
            await session.send('Emulation.setCPUThrottlingRate', { rate })
            await session.send('Network.enable')
            await session.send('Network.emulateNetworkConditions', {
              offline: false,
              latency: 400,
              downloadThroughput: 50000,
              uploadThroughput: 20000,
            })
            const start = Date.now()
            await page.goto(base + '/', { waitUntil: 'load', timeout: 60000 })
            await settle(page)
            await scrollToFraction(page, 1)
            results.push({
              engine,
              mode: 'slow-network-cpu',
              cpuRate: rate,
              elapsedMs: Date.now() - start,
              metrics: await page.evaluate(() => ({
                navigation: performance.getEntriesByType('navigation')[0].toJSON(),
                memory: performance.memory
                  ? {
                      used: performance.memory.usedJSHeapSize,
                      total: performance.memory.totalJSHeapSize,
                    }
                  : null,
              })),
            })
          }
          await session.send('Emulation.setCPUThrottlingRate', { rate: 1 })
          await session.send('Network.emulateNetworkConditions', {
            offline: false,
            latency: 0,
            downloadThroughput: -1,
            uploadThroughput: -1,
          })
          await session.send('Performance.enable')
          const trend = []
          for (let cycle = 0; cycle < 5; cycle++) {
            for (const route of ['/services', '/products', '/location', '/our-company', '/']) {
              await page.locator(`.footer-nav--explore a[href="${route}"]`).click()
              await page.waitForURL(base + route)
              await settle(page)
              await scrollToFraction(page, 0.6)
            }
            await session.send('HeapProfiler.collectGarbage')
            trend.push({
              cycle,
              dom: await session.send('Memory.getDOMCounters'),
              metrics: (await session.send('Performance.getMetrics')).metrics.filter((m) =>
                [
                  'JSHeapUsedSize',
                  'JSHeapTotalSize',
                  'Nodes',
                  'JSEventListeners',
                  'Documents',
                ].includes(m.name),
              ),
            })
          }
          results.push({
            engine,
            mode: 'memory-trend',
            spaTransitions: 25,
            trend,
            note: 'Short warmed route-cycle sample after GC; bounded growth is not proof of absence of long-session leaks. Review retained nodes/listeners if growth persists.',
          })
          await session.detach()
        }
        await context.close()
      } catch (error) {
        errors.push({ engine, error: String(error) })
      } finally {
        await browser.close()
      }
      await json('robustness.json', { results, errors })
    }),
  )
  return {
    cases: results.length,
    overflowIncidents: results.filter((r) => r.horizontalOverflow).length,
    errors: errors.length,
    failures: errors.length + results.filter((r) => r.horizontalOverflow).length,
    limitations:
      'Reflow is modeled with reduced CSS viewport; root-font scaling approximates text increase. Real browser zoom, OS font scaling, real ad blockers and device network conditions need manual checks.',
  }
}
