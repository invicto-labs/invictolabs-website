// Derive modeled TTFB from the saved complete Lighthouse reports. This does not
// rerun or alter a measurement and preserves local server timings separately.
import { readFile, writeFile } from 'node:fs/promises'
const file = 'qa/baseline/lighthouse-index.json'
const index = JSON.parse(await readFile(file, 'utf8'))
const median = (values) => {
  const rows = values.filter(Number.isFinite).sort((a, b) => a - b)
  return rows.length ? rows[Math.floor(rows.length / 2)] : null
}
for (const row of index.rows) {
  for (const run of row.runs) {
    const lhr = JSON.parse(await readFile(run.evidence, 'utf8'))
    run.localServerTtfbMs = lhr.audits['server-response-time']?.numericValue ?? null
    run.ttfbMs = lhr.audits.metrics?.details?.items?.[0]?.timeToFirstByte ?? run.localServerTtfbMs
  }
  row.medians.ttfbMs = median(row.runs.map((run) => run.ttfbMs))
  row.medians.localServerTtfbMs = median(row.runs.map((run) => run.localServerTtfbMs))
  row.budgetFailures = row.budgetFailures.filter((b) => b.metric !== 'ttfbMs')
  if (row.mode === 'mobile' && row.medians.ttfbMs > index.budgets.mobile.ttfbMs)
    row.budgetFailures.push({
      metric: 'ttfbMs',
      value: row.medians.ttfbMs,
      target: index.budgets.mobile.ttfbMs,
    })
}
index.metricNotes =
  'ttfbMs is Lighthouse metrics.timeToFirstByte (modeled in simulate mode); localServerTtfbMs is the unthrottled local server-response-time audit. INP is not measured.'
await writeFile(file, JSON.stringify(index, null, 2) + '\n')
console.log(
  JSON.stringify({
    rows: index.rows.length,
    runs: index.rows.reduce((n, r) => n + r.runs.length, 0),
    belowBudget: index.rows.filter((r) => r.budgetFailures.length).length,
    errors: index.errors.length,
  }),
)
