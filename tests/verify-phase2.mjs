import { readFile, writeFile } from 'node:fs/promises'
import { candidateFingerprint } from './helpers/candidate.mjs'
const read=async file=>JSON.parse(await readFile('qa/after-phase2/'+file,'utf8'))
const [runs,responsive,menu,axe,perf,priority,csp,pw,html,css,eslint,form,integrity,changes,menuSummary] = await Promise.all(['runs/all.json','responsive-index.json','menu.json','axe-index.json','lighthouse-index.json','priority.json','csp.json','playwright-menu.json','html-index.json','css.json','eslint.json','nojs-form.json','source-integrity.json','file-changes.json','menu-regression-summary.json'].map(read))
const rows=menu.results.flatMap(r=>r.rows)
const candidate = await candidateFingerprint(), stamp = await read('runs/candidate.json')
const eventRows = await Promise.all(responsive.index.map(async r=>({route:r.route,events:JSON.parse(await readFile(r.evidence,'utf8')).events})))
const checks=[
  ['All requested suites returned',runs.length===23&&!runs.some(r=>r.error)],
  ['Full responsive coverage',responsive.index.length===2496&&responsive.errors.length===0],
  ['No document horizontal overflow',responsive.index.every(r=>!r.horizontalOverflow)],
  ['No unexpected application errors',eventRows.every(r=>!r.events.pageerrors.length&&!r.events.failedRequests.length&&(r.route==='/__qa_missing_page__'||!r.events.console.some(c=>c.type==='error')))],
  ['630 menu cases stay visible and preserve/lock scroll',rows.length===630&&rows.every(r=>r.opened.visible&&r.noOpenJump&&r.noCloseJump&&r.scrollLocked)],
  ['Menu focus and close controls',menu.results.every(r=>r.rows.filter(x=>x.focusTested).every(x=>x.trap))],
  ['135 distinct menu cases verified; original timeouts retained',menuSummary.distinctCases===135&&menuSummary.initialPassed+menuSummary.resolvedTimeoutCases===135&&!menuSummary.unresolved.length&&pw.stats.skipped===0],
  ['264 axe scans, zero serious/critical',axe.index.length===264&&axe.errors.length===0&&axe.index.every(r=>!r.impacts.serious&&!r.impacts.critical)],
  ['100 Lighthouse measurements, zero runtime failures',perf.rows.reduce((n,r)=>n+r.runs.length,0)===100&&perf.errors.length===0],
  ['21 priority captures pass',priority.results.length===21&&priority.errors.length===0],
  ['78 enforced CSP cases, zero violations',csp.results.length===78&&csp.errors.length===0&&csp.results.every(r=>r.violations.length===0)],
  ['HTML semantic checks pass',html.length===26&&html.every(r=>!r.errorCount)],
  ['CSS project syntax/conflict checks pass',!css.errored],
  ['ESLint passes',eslint.every(r=>!r.errorCount)],
  ['No native GET form attempts',form.results.length===12&&form.results.every(r=>r.attempted.length===0)],
  ['Backups, dependencies and local-only hosting scope',!integrity.backupFailures.length&&integrity.runtimeDependencyManifestUnchanged&&!integrity.runtimeVersionChanges.length&&integrity.lockfileUnchanged&&integrity.hostingChangesLimitedToLocalHeaders],
  ['No deleted existing files',changes.deleted.length===0],
  ['Product and served build unchanged during the campaign',candidate.sha256===stamp.sha256],
]
await writeFile('qa/after-phase2/verification.json',JSON.stringify({checks:checks.map(([check,pass])=>({check,pass})),note:'Performance exceptions and owner-dependent issues are separately retained in the phase report, not converted into passes by this coverage verifier.'},null,2)+'\n')
console.log(checks.map(([name,pass])=>(pass?'PASS ':'FAIL ')+name).join('\n'))
if(checks.some(([,pass])=>!pass))process.exitCode=1
