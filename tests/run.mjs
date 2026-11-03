import path from 'node:path'
import { preview } from 'vite'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { candidateFingerprint } from './helpers/candidate.mjs'
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve('node_modules/.cache/ms-playwright')
const { chromium, firefox, webkit, devices } = await import('@playwright/test')
const { output, json } = await import('./helpers/evidence.mjs')
const { discoverRoutes } = await import('./helpers/routes.mjs')
const requested = process.argv[2] || 'e2e'
const suites =
  requested === 'all'
    ? [
        'hash',
        'functional',
        'keyboard',
        'input-stress',
        'nojs-form',
        'a11y',
        'robustness',
        'links',
        'seo',
        'security',
        'maintenance',
        'html',
        'css',
        'spell',
        'placeholders',
        'quality',
        'content',
        'responsive',
        'menu',
        'priority',
        'csp',
        'globe-profile',
        'perf',
      ]
    : requested === 'e2e'
      ? [
          'responsive',
          'menu',
          'hash',
          'functional',
          'keyboard',
          'input-stress',
          'nojs-form',
          'robustness',
        ]
      : requested === 'checks'
        ? [
            'links',
            'seo',
            'security',
            'maintenance',
            'html',
            'css',
            'spell',
            'placeholders',
            'quality',
          ]
        : requested === 'phase2-smoke'
          ? ['priority','hash','nojs-form','html','css','quality']
        : requested === 'followups'
          ? ['input-stress', 'globe-profile']
          : [requested]
await mkdir(output, { recursive: true })
const server = await preview({
  preview: { host: '127.0.0.1', port: Number(process.env.QA_PORT || 4187), strictPort: true },
})
const base = `http://127.0.0.1:${server.config.preview.port}`
let summary = []
if (requested === 'all') {
  const candidate = await candidateFingerprint()
  if (process.env.QA_RESUME === '1') {
    const previous = JSON.parse(await readFile(path.join(output,'runs/candidate.json'),'utf8'))
    if (previous.sha256 !== candidate.sha256) throw new Error('Cannot resume: product/build inputs changed. Use a fresh output folder.')
    summary = JSON.parse(await readFile(path.join(output,'runs/all.json'),'utf8')).filter(row=>!row.error&&row.failures===0)
    await json('runs/resume.json',{candidate,completedSuites:summary.map(r=>r.suite),note:'Passed suites retained only on the identical candidate; unfinished/failed suites rerun.'})
  } else await json('runs/candidate.json',candidate)
}
const completedSuites = new Set(summary.map(row=>row.suite))
try {
  const inventory = await discoverRoutes(base)
  const allRoutes = [...inventory.routes, '/__qa_missing_page__']
  const routes = process.env.QA_ROUTES ? process.env.QA_ROUTES.split(',') : allRoutes
  const engines = { chromium, firefox, webkit }
  const context = {
    base,
    routes,
    inventory,
    engines,
    devices,
    output,
    json,
    engineNames: (process.env.QA_BROWSERS || 'chromium,firefox,webkit').split(','),
  }
  for (const suite of suites) {
    if (completedSuites.has(suite)) { console.log(`RESUME ${suite}: retained passing evidence on identical candidate`); continue }
    const start = Date.now()
    console.log(`START ${suite}: ${routes.length} routes`)
    try {
      const module = await import(`./suites/${suite}.mjs`)
      const result = await module.run(context)
      summary.push({ suite, elapsedSeconds: (Date.now() - start) / 1000, ...result })
      console.log(`DONE ${suite}: ${JSON.stringify(result)}`)
    } catch (error) {
      summary.push({ suite, error: error.stack })
      console.error(`ERROR ${suite}: ${error.stack}`)
    }
    await json(`runs/${requested}.json`, summary)
  }
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve))
}
await writeFile(
  path.join(output, `runs/${requested}.html`),
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Invicto ${requested} QA results</title><style>body{font:16px system-ui;max-width:1100px;margin:3rem auto}pre{white-space:pre-wrap}</style><h1>Invicto ${requested} audit run</h1><pre>${JSON.stringify(summary, null, 2).replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</pre></html>`,
)
if (summary.some((result) => result.error || result.failures > 0)) process.exitCode = 1
