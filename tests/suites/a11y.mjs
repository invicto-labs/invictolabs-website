import AxeBuilder from '@axe-core/playwright'
import { json, settle, screenshot, collectErrors } from '../helpers/evidence.mjs'
export async function run({ base, routes, engines, engineNames }) {
  const index = [],
    errors = []
  await Promise.all(
    engineNames.map(async (engine) => {
      const browser = await engines[engine].launch()
      try {
        for (const viewport of [
          { width: 390, height: 844 },
          { width: 1440, height: 900 },
        ]) {
          for (const route of routes) {
            // axe creates helper pages and mutates the test realm. Isolate each
            // route, including its modal states, from the preceding page's scan.
            const context = await browser.newContext({ viewport })
            const page = await context.newPage()
            const events = collectErrors(page)
            try {
              await page.goto(base + route, { waitUntil: 'load' })
              await settle(page)
              const states = [
                'default',
                ...(viewport.width < 768 ? ['menu-open'] : []),
                ...(route === '/faq' || route.startsWith('/services/') ? ['answers-open'] : []),
              ]
              for (const state of states) {
                await page.bringToFront()
                if (state === 'menu-open') {
                  await page.locator('.menu-toggle').click()
                  await page.getByRole('dialog',{name:'Main navigation'}).waitFor({state:'visible'})
                }
                if (state === 'answers-open') {
                  await page.keyboard.press('Escape')
                  await page.evaluate(() => {
                    document.querySelectorAll('details').forEach((el) => (el.open = true))
                  })
                  if (route === '/faq') {
                    const buttons = page.locator('.faq-list button[aria-expanded="false"]')
                    if (await buttons.count()) await buttons.last().click()
                  }
                }
                const result = await new AxeBuilder({ page })
                  .withTags([
                    'wcag2a',
                    'wcag2aa',
                    'wcag21a',
                    'wcag21aa',
                    'wcag22aa',
                    'best-practice',
                  ])
                  .analyze()
                await page.bringToFront()
                const file = await json(
                  `axe/${engine}/${route === '/' ? 'home' : route.replaceAll('/', '_')}_${viewport.width}_${state}.json`,
                  { route, engine, viewport, state, ...result },
                )
                const impacts = { critical: 0, serious: 0, moderate: 0, minor: 0 }
                result.violations.forEach((v) => (impacts[v.impact] = (impacts[v.impact] || 0) + 1))
                let shot = null
                if (result.violations.length)
                  shot = await screenshot(
                    page,
                    route,
                    `${engine}-axe-${viewport.width}`,
                    viewport.width > viewport.height ? 'landscape' : 'portrait',
                    state,
                  )
                index.push({
                  route,
                  engine,
                  width: viewport.width,
                  state,
                  violations: result.violations.length,
                  impacts,
                  rules: result.violations.map((v) => ({
                    id: v.id,
                    impact: v.impact,
                    nodes: v.nodes.length,
                  })),
                  incomplete: result.incomplete.length,
                  evidence: file,
                  screenshot: shot,
                })
                if (state === 'menu-open') await page.keyboard.press('Escape')
              }
            } catch (error) {
              errors.push({ route, engine, width: viewport.width, error: String(error), events })
            } finally { await context.close() }
            await json('axe-index.json', { index, errors })
          }
          console.log(`AXE ${engine} ${viewport.width} complete`)
        }
      } finally {
        await browser.close()
      }
    }),
  )
  await json('axe-index.json', { index, errors })
  return {
    scans: index.length,
    seriousOrCritical: index.reduce((n, r) => n + r.impacts.serious + r.impacts.critical, 0),
    violations: index.reduce((n, r) => n + r.violations, 0),
    errors: errors.length,
    failures:
      errors.length + index.filter((r) => r.impacts.serious + r.impacts.critical > 0).length,
  }
}
