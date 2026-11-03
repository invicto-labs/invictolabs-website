import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { json, output, slug } from '../helpers/evidence.mjs'
const median = (values) => {
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b)
  return finite.length ? finite[Math.floor(finite.length / 2)] : null
}
export async function run({ base, inventory, engines }) {
  const budgets = JSON.parse(await readFile('tests/performance-budgets.json', 'utf8'))
  const selected = process.env.QA_PERF_ROUTES
    ? process.env.QA_PERF_ROUTES.split(',')
    : inventory.sitemap
  const rows = [],
    errors = []
  await mkdir(path.join(output, 'lighthouse'), { recursive: true })
  const chrome = await chromeLauncher.launch({
    chromePath: engines.chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-first-run', '--no-default-browser-check'],
    logLevel: 'silent',
  })
  try {
    for (const route of selected) {
      for (const mode of (process.env.QA_PERF_MODES || 'mobile,desktop').split(',')) {
        // The existing Vite preview omits the privacy clean-path rewrite. Use the
        // built directory URL for this measurement; raw clean-path parity is audited separately.
        const testedURL = base + route + (route === '/privacy-policy' ? '/' : '')
        const runs = []
        for (let run = 1; run <= (mode === 'mobile' ? 3 : 1); run++) {
          const stem = `lighthouse/${slug(route)}_${mode}_${run}`
          try {
            const settings = {
              port: chrome.port,
              logLevel: 'error',
              output: ['json', 'html'],
              onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
              maxWaitForLoad: 45000,
              throttlingMethod: 'simulate',
              ...(mode === 'desktop'
                ? {
                    formFactor: 'desktop',
                    screenEmulation: {
                      mobile: false,
                      width: 1440,
                      height: 900,
                      deviceScaleFactor: 1,
                      disabled: false,
                    },
                    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
                  }
                : {
                    formFactor: 'mobile',
                    screenEmulation: {
                      mobile: true,
                      width: 390,
                      height: 844,
                      deviceScaleFactor: 1,
                      disabled: false,
                    },
                    throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
                  }),
            }
            const result = await lighthouse(testedURL, settings)
            if (!result) throw new Error('Lighthouse returned no result')
            await writeFile(path.join(output, stem + '.json'), result.report[0])
            await writeFile(path.join(output, stem + '.html'), result.report[1])
            const lhr = result.lhr
            const metric = (id) => lhr.audits[id]?.numericValue ?? null
            if (lhr.runtimeError) errors.push({ route, mode, run, runtimeError: lhr.runtimeError })
            const resources = lhr.audits['resource-summary']?.details?.items || []
            const transfers = Object.fromEntries(
              resources.map((r) => [r.resourceType, r.transferSize]),
            )
            const scores = Object.fromEntries(
              Object.entries(lhr.categories).map(([name, c]) => [
                name,
                c.score == null ? null : Math.round(c.score * 100),
              ]),
            )
            runs.push({
              run,
              testedURL,
              scores,
              lcpMs: metric('largest-contentful-paint'),
              tbtMs: metric('total-blocking-time'),
              cls: metric('cumulative-layout-shift'),
              ttfbMs:
                lhr.audits.metrics?.details?.items?.[0]?.timeToFirstByte ??
                metric('server-response-time'),
              localServerTtfbMs: metric('server-response-time'),
              fcpMs: metric('first-contentful-paint'),
              speedIndexMs: metric('speed-index'),
              transfers,
              runWarnings: lhr.runWarnings,
              runtimeError: lhr.runtimeError,
              evidence: path
                .relative(process.cwd(), path.join(output, stem + '.json'))
                .replaceAll('\\', '/'),
              html: path
                .relative(process.cwd(), path.join(output, stem + '.html'))
                .replaceAll('\\', '/'),
              failingAudits: Object.entries(lhr.audits)
                .filter(([, a]) => a.score !== null && a.score < 1)
                .map(([id, a]) => ({
                  id,
                  title: a.title,
                  score: a.score,
                  numericValue: a.numericValue,
                  displayValue: a.displayValue,
                })),
            })
            console.log(`LH ${route} ${mode} ${run}: ${JSON.stringify(scores)}`)
          } catch (error) {
            errors.push({ route, mode, run, error: String(error) })
          }
        }
        const medians = Object.fromEntries(
          ['lcpMs', 'tbtMs', 'cls', 'ttfbMs', 'fcpMs'].map((key) => [
            key,
            median(runs.map((r) => r[key])),
          ]),
        )
        const scores = Object.fromEntries(
          ['performance', 'accessibility', 'best-practices', 'seo'].map((key) => [
            key,
            median(runs.map((r) => r.scores[key])),
          ]),
        )
        const budgetFailures =
          mode === 'mobile'
            ? [
                ...Object.entries(scores)
                  .filter(([k, v]) => v !== null && v < budgets.mobile[k])
                  .map(([k, v]) => ({ metric: k, value: v, target: budgets.mobile[k] })),
                ...Object.entries(medians)
                  .filter(([k, v]) => v !== null && v > budgets.mobile[k])
                  .map(([k, v]) => ({ metric: k, value: v, target: budgets.mobile[k] })),
              ]
            : []
        const transferMedians = Object.fromEntries(
          ['script', 'stylesheet', 'image', 'total'].map((type) => [
            type,
            median(runs.map((r) => r.transfers[type])),
          ]),
        )
        for (const [type, value] of Object.entries(transferMedians)) {
          const threshold = budgets.resources[type + 'TransferBytes']
          if (value !== null && value > threshold)
            budgetFailures.push({ metric: type + 'TransferBytes', value, target: threshold })
        }
        rows.push({ route, mode, scores, medians, transferMedians, budgetFailures, runs })
        await json('lighthouse-index.json', {
          settings:
            'Mobile: simulated 150 ms RTT, 1638.4 Kbps, 4× CPU; 3 runs and median. Desktop: 40 ms, 10240 Kbps, 1× CPU; 1 run. Local preview headers differ from hosting. INP requires field data; TBT is a lab proxy.',
          budgets,
          rows,
          errors,
        })
      }
    }
  } finally {
    await chrome.kill()
  }
  return {
    pages: selected.length,
    measurements: rows.reduce((n, r) => n + r.runs.length, 0),
    belowBudget: rows.filter((r) => r.budgetFailures.length).length,
    errors: errors.length,
    failures: errors.length + rows.filter((r) => r.budgetFailures.length).length,
  }
}
