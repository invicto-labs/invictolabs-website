import { readFile, writeFile, access } from 'node:fs/promises'
const read = async (name) => JSON.parse(await readFile('qa/baseline/' + name, 'utf8'))
const results = [],
  missing = []
const check = (name, pass, detail) => results.push({ name, pass, detail })
const required = async (file) => {
  try {
    await access(file)
  } catch {
    missing.push(file)
  }
}
const matrix = await read('e2e/responsive-index.json')
check(
  'Complete unchanged-build matrix',
  matrix.index.length === 2496 &&
    !matrix.errors.length &&
    new Set(matrix.index.map((r) => [r.engine, r.scenario, r.orientation, r.route].join('|')))
      .size === 2496,
  { cases: matrix.index.length, errors: matrix.errors.length },
)
for (const row of matrix.index) {
  await required(row.evidence)
  await required(row.screenshot)
}
const axe = await read('axe-index.json')
check('Complete axe evidence', axe.index.length === 264 && !axe.errors.length, {
  scans: axe.index.length,
  errors: axe.errors.length,
})
for (const row of axe.index) {
  await required(row.evidence)
  await required(row.screenshot)
}
const perf = await read('lighthouse-index.json')
check(
  'Complete Lighthouse measurements',
  perf.rows.length === 50 &&
    perf.rows.reduce((n, r) => n + r.runs.length, 0) === 100 &&
    !perf.errors.length &&
    perf.rows.every((r) => r.runs.length === (r.mode === 'mobile' ? 3 : 1)),
  {
    rows: perf.rows.length,
    runs: perf.rows.reduce((n, r) => n + r.runs.length, 0),
    errors: perf.errors.length,
  },
)
for (const row of perf.rows)
  for (const run of row.runs) {
    await required(run.evidence)
    await required(run.html)
  }
const menu = await read('e2e/menu.json')
check(
  'Complete menu observations',
  menu.results.length === 42 &&
    menu.results.flatMap((r) => r.rows).length === 630 &&
    !menu.errors.length,
  {
    contexts: menu.results.length,
    cases: menu.results.flatMap((r) => r.rows).length,
    resizeUnverified: menu.results.filter((r) => r.runtimeResizeLimitation).length,
  },
)
const functional = await read('e2e/functional.json')
check(
  'Functional retry completed',
  functional.pages.length === 156 && functional.forms.length === 54 && !functional.errors.length,
  {
    pages: functional.pages.length,
    forms: functional.forms.length,
    remainingHarnessErrors: functional.errors,
  },
)
const keyboard = await read('keyboard.json')
check(
  'Focused skip activation verified separately',
  keyboard.results.length === 156 &&
    !keyboard.errors.length &&
    keyboard.results.every((r) => r.mainFocused),
  {
    cases: keyboard.results.length,
    nativeTabPolicySkippedLinks: keyboard.results.filter((r) => r.nativeFirstTab.href === null)
      .length,
  },
)
const robustness = await read('e2e/robustness.json'),
  stress = await read('input-stress.json'),
  fallback = await read('nojs-form.json'),
  profile = await read('globe-profile.json')
check(
  'Robustness / input evidence complete',
  robustness.results.length === 282 &&
    !robustness.errors.length &&
    stress.results.length === 212 &&
    !stress.errors.length,
  {
    robustness: robustness.results.length,
    stress: stress.results.length,
    reducedDataMatched: stress.results.find((r) => r.mode === 'reduced-data')?.matches,
  },
)
check(
  'Form fallback evidence complete',
  fallback.results.length === 12 &&
    fallback.results.filter((r) => r.attempted?.length).length === 9,
  {
    cases: fallback.results.length,
    affectedCases: fallback.results.filter((r) => r.attempted?.length).length,
    note: 'Expected baseline defect; not a passing product assertion.',
  },
)
check(
  'Globe profile captured',
  profile.results.length === 3 && profile.results.every((r) => Number.isFinite(r.taskBusyRatio)),
  profile.results.map((r) => ({ mode: r.mode, busy: r.taskBusyRatio })),
)
const issues = await read('issue-register.json')
check(
  'Issue options complete',
  new Set(issues.map((i) => i.id)).size === issues.length &&
    issues.every(
      (i) =>
        i.options.length >= 2 &&
        i.options.length <= 3 &&
        i.recommended >= 1 &&
        i.recommended <= i.options.length,
    ),
  { issues: issues.length },
)
// Evidence may name a source section as well as a numeric line.
for (const issue of issues)
  for (const evidence of issue.evidence) await required(evidence.replace(/:[^/\\]*$/, ''))
for (const file of [
  'qa/QA_REPORT_PHASE1.md',
  'qa/FILES_PHASE1.md',
  'qa/AUDIT_COVERAGE_PHASE1.md',
  'qa/BENCHMARKS.md',
  'qa/MANUAL_PHASE1.md',
  'qa/PERFORMANCE_BUDGETS_PHASE1.md',
  'qa/SECURITY_AND_MEASUREMENT_OPTIONS.md',
  'CONTENT_TODO.md',
  'qa/backups/phase1/MANIFEST.md',
])
  await required(file)
const integrity = await read('setup/source-integrity.json'),
  build = await read('setup/build-integrity.json')
check(
  'Product / runtime / backups intact',
  !integrity.unexpectedProductChanges.length &&
    !integrity.originalBackupFailures.length &&
    integrity.backupResults.every((r) => r.intact) &&
    integrity.runtimeDependencyManifestUnchanged &&
    !integrity.runtimeVersionChanges.length &&
    build.identical,
  {
    sourceFilesUnchanged: integrity.originalResults.filter((r) => r.unchanged).length,
    buildFiles: build.after,
  },
)
check('Referenced evidence files exist', !missing.length, missing)
const result = {
  results,
  missing,
  pass: results.every((r) => r.pass),
  note: 'This verifies audit completeness and evidence integrity, not that the unfixed website passes its baseline checks.',
}
await writeFile('qa/baseline/setup/final-verification.json', JSON.stringify(result, null, 2) + '\n')
console.log(
  JSON.stringify({
    pass: result.pass,
    checks: results.length,
    failed: results.filter((r) => !r.pass),
    missing,
  }),
)
if (!result.pass) process.exitCode = 1
