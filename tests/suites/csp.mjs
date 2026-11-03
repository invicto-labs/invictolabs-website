import { json, settle } from '../helpers/evidence.mjs'
export async function run({ base, routes, engines, engineNames }) {
  const results = [], errors = []
  for (const engine of engineNames) {
    const browser = await engines[engine].launch()
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
      await page.addInitScript(() => {
        window.__policyViolations = []
        document.addEventListener('securitypolicyviolation', event => window.__policyViolations.push({
          directive: event.effectiveDirective, blockedURI: event.blockedURI,
          disposition: event.disposition, sample: event.sample,
        }))
      })
      for (const route of routes) {
        try {
          const response = await page.goto(base + route)
          await settle(page)
          await page.waitForTimeout(500)
          results.push({ engine, route, policy: response.headers()['content-security-policy'] ?? response.headers()['content-security-policy-report-only'],
            violations: await page.evaluate(() => window.__policyViolations),
            image: route === '/products/traceq' ? await page.locator('.product-window img').evaluate(img => ({ width: img.clientWidth, height: img.clientHeight, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })) : null,
          })
          await json('csp-progress.json', { engine, route, completed: results.length, errors })
        } catch (error) { errors.push({ engine, route, error: String(error) }) }
      }
      await page.close()
    } finally { await browser.close() }
  }
  await json('csp.json', { results, errors })
  return { cases: results.length, violations: results.reduce((n,r) => n+r.violations.length,0), errors: errors.length,
    failures: errors.length + results.filter(r => r.violations.length).length }
}
