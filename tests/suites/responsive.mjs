import { viewports, deviceMatrix } from '../helpers/matrix.mjs'
import {
  json,
  collectErrors,
  screenshot,
  settle,
  scrollToFraction,
  slug,
} from '../helpers/evidence.mjs'
import { inspectLayout } from '../helpers/layout.mjs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { output } from '../helpers/evidence.mjs'
export async function run({ base, routes, engines, engineNames, devices }) {
  let index = [],
    errors = []
  const resolvedErrors = []
  if (process.env.QA_RESUME === '1') {
    try {
      const previous = JSON.parse(
        await readFile(path.join(output, 'responsive-index.json'), 'utf8'),
      )
      index = previous.index || []
      errors = previous.errors || []
      resolvedErrors.push(...(previous.resolvedErrors || []))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  const completed = new Set(
    index.map((r) => `${r.engine}|${r.scenario}|${r.orientation}|${r.route}`),
  )
  await Promise.all(
    engineNames.map(async (engine) => {
      let browser
      try {
        const named = deviceMatrix(devices)
        const scenarios = [
          ...viewports.map((v) => ({
            ...v,
            options: { viewport: v.viewport, deviceScaleFactor: 1 },
          })),
          ...named,
        ]
        if (
          scenarios.every((s) =>
            routes.every((route) => completed.has(`${engine}|${s.name}|${s.orientation}|${route}`)),
          )
        )
          return
        browser = await engines[engine].launch({ headless: true })
        for (const scenario of scenarios) {
          if (
            routes.every((route) =>
              completed.has(`${engine}|${scenario.name}|${scenario.orientation}|${route}`),
            )
          )
            continue
          const options = { ...scenario.options }
          if (engine === 'firefox') delete options.isMobile
          const context = await browser.newContext(options)
          const page = await context.newPage()
          page.setDefaultTimeout(12000)
          for (const route of routes) {
            if (completed.has(`${engine}|${scenario.name}|${scenario.orientation}|${route}`))
              continue
            const events = collectErrors(page)
            try {
              const response = await page.goto(base + route, { waitUntil: 'load', timeout: 25000 })
              await settle(page)
              const layout = await inspectLayout(page)
              const scrollStates = []
              for (const fraction of [0.4, 0.8, 1]) {
                await scrollToFraction(page, fraction)
                scrollStates.push(
                  await page.evaluate(
                    (f) => ({
                      fraction: f,
                      scrollY,
                      scrollWidth: document.documentElement.scrollWidth,
                      viewportWidth: innerWidth,
                    }),
                    fraction,
                  ),
                )
              }
              await scrollToFraction(page, 0)
              const device = `${engine}-${scenario.name}`
              // Every matrix combination has a viewport baseline. The two anchor
              // widths additionally retain the entire page for visual review.
              const fullPage = [390, 1440].includes(options.viewport.width)
              const shot = await screenshot(
                page,
                route,
                device,
                scenario.orientation,
                'baseline',
                fullPage,
              )
              const evidence = await json(
                `layout/${engine}/${slug(route)}_${slug(scenario.name)}_${scenario.orientation}.json`,
                {
                  route,
                  engine,
                  scenario,
                  status: response?.status(),
                  layout,
                  scrollStates,
                  events,
                  screenshot: shot,
                },
              )
              index.push({
                route,
                engine,
                scenario: scenario.name,
                orientation: scenario.orientation,
                status: response?.status(),
                horizontalOverflow:
                  layout.horizontalOverflow ||
                  scrollStates.some((s) => s.scrollWidth > s.viewportWidth + 1),
                outOfViewport: layout.overflow.length,
                smallTargets: layout.smallTargets.length,
                smallInputs: layout.smallInputs.length,
                consoleErrors: events.console.length,
                pageErrors: events.pageerrors.length,
                failedRequests: events.failedRequests.length,
                evidence,
                screenshot: shot,
                screenshotScope: fullPage ? 'full-page' : 'viewport',
              })
              errors = errors.filter((error) => {
                const resolved = error.engine === engine && error.route === route &&
                  error.scenario === scenario.name && error.orientation === scenario.orientation
                if (resolved) resolvedErrors.push(error)
                return !resolved
              })
            } catch (error) {
              errors.push({
                route,
                engine,
                scenario: scenario.name,
                orientation: scenario.orientation,
                error: String(error),
              })
            }
            page.removeAllListeners('console')
            page.removeAllListeners('pageerror')
            page.removeAllListeners('requestfailed')
            page.removeAllListeners('response')
          }
          await context.close()
          await json('responsive-index.json', { index, errors, resolvedErrors })
          console.log(
            `RESP ${engine} ${scenario.name} ${scenario.orientation}: ${index.filter((r) => r.engine === engine).length} scenarios complete`,
          )
        }
      } catch (error) {
        errors.push({ engine, error: String(error) })
      } finally {
        if (browser) await browser.close()
      }
    }),
  )
  await json('responsive-index.json', { index, errors, resolvedErrors })
  return {
    scenarios: index.length,
    overflowIncidents: index.filter((r) => r.horizontalOverflow).length,
    errors: errors.length,
    failures: errors.length + index.filter((r) => r.horizontalOverflow).length,
  }
}
