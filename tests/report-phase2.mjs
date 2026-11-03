import { readFile, writeFile } from 'node:fs/promises'
const root = 'qa/after-phase2/'
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const table = (headers, rows) => `| ${headers.join(' | ')} |\n| ${headers.map(()=>'---').join(' | ')} |\n${rows.map(row=>`| ${row.map(v=>String(v??'—').replaceAll('|','\\|').replaceAll('\n',' ')).join(' | ')} |`).join('\n')}\n`
const [runs,responsive,menu,axe,perf,baselinePerf,issues,links,security,html,css,eslint,priority,hash,form,csp,playwright,globe,keyboard,robustness,menuSummary] = await Promise.all([
  'runs/all.json','responsive-index.json','menu.json','axe-index.json','lighthouse-index.json','../baseline/lighthouse-index.json','../baseline/issue-register.json','links.json','security.json','html-index.json','css.json','eslint.json','priority.json','hash-diagnostic.json','nojs-form.json','csp.json','playwright-menu.json','globe-profile.json','keyboard.json','robustness.json','menu-regression-summary.json',
].map(file=>read(root+file)))
const menuRows = menu.results.flatMap(r=>r.rows)
const menuExceptions = menu.results.flatMap(context => context.rows
  .filter(row => !row.opened.visible || !row.noOpenJump || !row.noCloseJump || !row.scrollLocked || !row.physicalTrigger)
  .map(row => [context.engine, context.device, context.orientation, row.route, row.fraction, row.before, row.opened.scrollY, row.closed.scrollY, row.scrollLocked]))
const impacts = Object.fromEntries(['critical','serious','moderate','minor'].map(k=>[k,axe.index.reduce((n,r)=>n+(r.impacts[k]||0),0)]))
const scores = row => row ? ['performance','accessibility','best-practices','seo'].map(k=>row.scores[k]).join(' / ') : '—'
const fmt = (n,d=0) => Number.isFinite(n)?Number(n).toFixed(d):'—'
const mobile = perf.rows.filter(r=>r.mode==='mobile')
const baselineGlobe = await read('qa/baseline/globe-profile.json')
const baselineSecurity = await read('qa/baseline/security.json')
const low = mobile.filter(r=>Object.values(r.scores).some(v=>v<90))
const lowDetails = await Promise.all(low.map(async row => {
  const run = row.runs.find(item => item.scores.performance === row.scores.performance) ?? row.runs[0]
  const audits = run ? (await read(run.evidence)).audits : {}
  const layout = audits['mainthread-work-breakdown']?.details?.items?.find(item => item.group === 'styleLayout')
  const work = audits['mainthread-work-breakdown']?.numericValue
  const diagnosis = `Median LCP ${fmt(row.medians.lcpMs)} ms and TBT ${fmt(row.medians.tbtMs)} ms. The representative run recorded ${fmt(work)} ms of main-thread work, including ${fmt(layout?.duration)} ms for style and layout.`
  const plan = row.route === '/'
    ? 'Profile hero effects and below-fold layout separately. Test containing below-fold sections and splitting hydration while preserving anchor positions and desktop presentation.'
    : 'Use the linked trace diagnostics to isolate the largest render or script cost. Test a narrower route-specific split and verify the server-rendered content before repeating the three mobile measurements.'
  return [row.route, scores(row), `${diagnosis} ${plan}`]
}))
const consoleObservations = await Promise.all(responsive.index.map(async row => ({ row, events: JSON.parse(await readFile(row.evidence,'utf8')).events })))
const warningCases = consoleObservations.filter(({events})=>events.console.some(c=>c.type!=='error'))
const unexpectedConsoleErrors = consoleObservations.filter(({row,events})=>row.route!=='/__qa_missing_page__'&&events.console.some(c=>c.type==='error'))
const status = {
  'PERF-003':['Fixed','Responsive WebP variants for the same TraceQ screens and leadership portraits; full-resolution originals remain available.'],
  'PERF-001':['Fixed','Removed the unused service hero import; service detail entry no longer pulls in Three.js.'],
  'PERF-002':['Fixed','Phone/reduced-motion globe draws on demand; desktop animation is capped and visibility-gated. Rotate/reset buttons added.'],
  'RESP-005':['Fixed','Phone brand/Explore/contact span full width; 13.5px nav, 13px description, 11px labels; 44px link targets; desktop column design retained.'],
  'ROBUST-001':['Fixed','Print overrides expand/present interactive cards and reveal content; native print preview still requires owner review.'],
  'SEC-004':['Fixed','SSR-disabled fieldset prevents input/submission until the handler attaches; direct email/phone and no-JS fallback remain. No backend added.'],
  'FUNC-003':['Fixed','Normalize the first URL before hydration; hash-only navigation no longer replaces the React tree. Static render resolves nested lazy modules before serialization.'],
  'CODE-005':['Needs my input','Unused source candidates retained: deleting any file requires explicit approval. Removed only unused exports/imports causing measured payload cost.'],
  'FORM-001':['Fixed','Required instructions, fieldset legend, native validation plus inline errors, clear draft confirmation and existing copy fallback. Native mail apps remain unverified.'],
  'RESP-004':['Fixed','Constrained globe labels; low-cost static phone/reduced-motion decoration; existing clipped decorative layers retained where aligned. Matrix/screenshots provide geometry evidence.'],
  'MENU-001':['Fixed','Body portal fixed to the viewport, outside the sticky header’s backdrop-filter containing block.'],
  'MENU-002':[menuExceptions.length || menu.errors.length ? 'Partially fixed' : 'Fixed','The portal saves and restores scroll around the lock. Remaining browser evidence is listed below. Real iOS rubber-banding remains a manual check.'],
  'MENU-003':['Fixed','Modal semantics, background inertness, initial/returned focus, explicit visible Tab cycling, Escape/outside/link close and resize cleanup.'],
  'A11Y-001':['Fixed','Selected Tax Flow step number uses white on the existing dark selected background.'],
  'A11Y-002':['Fixed','Products scroll control accessible name includes its visible “Scroll to open” wording.'],
  'RESP-001':['Fixed','16px fields, semantic input types/autocomplete/inputmode/enterkeyhint and 44px controls. Physical keyboard occlusion remains manual.'],
  'RESP-002':['Fixed','Enlarged shared navigation, buttons, CTA/detail links, footer and contact targets; geometry results retained.'],
  'RESP-003':['Fixed','viewport-fit=cover, safe-area padding on header/menu/containers and dynamic viewport menu sizing. Real notches remain manual.'],
  'A11Y-003':['Fixed','Native #main-content skip link and focusable main landmarks; Enter focuses the real main.'],
  'A11Y-004':['Fixed','Globe rotate/reset buttons and textual office list; touch pan-y; existing service controls tested with keyboard/touch and reduced motion.'],
  'FUNC-001':['Fixed','Header CTA uses a real local contact target only on supported pages; other routes link to /#contact with focus management. Native href retains fragment.'],
  'SEO-001':['Fixed','Local preview Privacy rewrite now serves its generated HTML on the clean path. No live routing change.'],
  'SEO-002':['Needs my input','Unique metadata/canonicals/schema remain verified; shared social image and editorial ownership need approved assets/data (CONTENT-024/025).'],
  'SEC-001':['Partially fixed','Local CSP candidate tested in report-only terms and then compatibility-tested in enforcement; live headers unchanged until separately authorized owner deployment. See docs/SECURITY_HEADERS.md.'],
  'SEC-002':['Partially fixed','Local X-Frame-Options DENY and CSP frame-ancestors none; owner must review embedding needs and deploy separately.'],
  'SEC-003':['Partially fixed','Local restrictive Permissions-Policy; no remote setting changed.'],
  'LEGAL-001':['Needs my input','Existing Privacy draft and trust/legal approvals require Legal; no legal copy rewritten in this technical phase.'],
  'CONTENT-001':['Needs my input','Existing claims, including Tax Flow county count, require dated owner evidence; retained in CONTENT_TODO rather than invented or silently rewritten.'],
  'CONTENT-002':['Needs my input','Services rebuild is Phase 3 and has not started.'],
  'CONTENT-003':['Needs my input','Delivery/governance Approach rebuild is Phase 3 and has not started.'],
  'CONTENT-004':['Needs my input','Product maturity, biographies, operational specifics and evidence remain owner-supplied.'],
  'CODE-001':['Fixed','TraceQ paragraph wrappers are divs; fieldset has a legend; semantic HTML validator results retained separately from serialization conventions.'],
  'CODE-002':['Fixed','Named generic wrappers use group semantics; dialog/ARIA/form associations tested.'],
  'CODE-003':['Partially fixed','Project CSS syntax/conflict checks plus raw strict report retained. Existing duplicate-selector warnings remain for a scoped future cascade cleanup. No broad restyling.'],
  'CODE-004':['Partially fixed','TypeScript and ESLint errors corrected without runtime dependencies; default Prettier differences remain advisory to avoid a repository-wide formatting diff.'],
  'FUNC-002':['Fixed','Store positions by history entry and restore on POP; reapply manual restoration for each entry, including native hash navigation in WebKit. Explicit anchors retain their focus/scroll behavior.'],
  'PERF-004':['Partially fixed','Route/product splitting, reduced phone effects, responsive images and batched layout improve measured budgets. Remaining sub-90 scores and next actions are listed below; no score is hidden.'],
}
const issueRows = issues.map(i=>({ ...i, status:status[i.id]?.[0]??'Needs my input', resolution:status[i.id]?.[1]??'Review retained Phase 1 evidence.' }))
if(warningCases.length)issueRows.push({id:'PERF-005',severity:'Low',category:'Browser preload timing warnings',status:'Partially fixed',resolution:`${warningCases.length} matrix cases report warnings. Review retained console events and confirm actual dependency use on real Safari before removing preloads; removing required preloads can delay hydration. These are recorded separately from application exceptions.`,evidence:warningCases.slice(0,8).map(x=>x.row.evidence)})
await writeFile(root+'issue-register.json',JSON.stringify(issueRows,null,2)+'\n')
const metrics = {
  responsiveCases:responsive.index.length,responsiveErrors:responsive.errors.length,overflowCases:responsive.index.filter(r=>r.horizontalOverflow).length,
  consoleWarningCases:warningCases.length,unexpectedConsoleErrorCases:unexpectedConsoleErrors.length,
  menuCases:menuRows.length,menuOffViewport:menuRows.filter(r=>!r.opened.visible).length,menuOpenJumps:menuRows.filter(r=>!r.noOpenJump).length,menuCloseJumps:menuRows.filter(r=>!r.noCloseJump).length,menuUnlocked:menuRows.filter(r=>!r.scrollLocked).length,
  axeScans:axe.index.length,axeImpacts:impacts,lighthouseMeasurements:perf.rows.reduce((n,r)=>n+r.runs.length,0),mobileBelow90:low.map(r=>({route:r.route,scores:r.scores})),
  playwright:playwright.stats,htmlErrors:html.reduce((n,r)=>n+r.errorCount,0),cssErrors:css.results.reduce((n,r)=>n+r.errored*1,0),eslintErrors:eslint.reduce((n,r)=>n+r.errorCount,0),
}
await writeFile(root+'scorecard.json',JSON.stringify(metrics,null,2)+'\n')
const report = `# Phase 2 — local responsive and technical fixes

The approved Phase 2 implementation prioritizes the scrolled mobile menu and phone footer. No Services/Approach content rebuild was started. Existing brand assets, typeface, palette and business copy are preserved. Backups were completed before editing: 195 source/tooling/document files, 17,885,495 bytes, SHA-256 verified, in [backups/phase2/MANIFEST.md](backups/phase2/MANIFEST.md).

No git commands that modify the repo were run. All changes are local and uncommitted. No deployment, hosting dashboard, remote, backend, runtime dependency, tracking service or message sending was performed. No source file was deleted.

The final campaign retained five completed passing suites across a harness-only resume guarded by a SHA-256 fingerprint of 313 product/build files. Axe uses isolated route contexts plus foreground restoration after its temporary aggregation pages; original reused-context WebKit timeouts are retained under iterations/axe-foreground-before and iterations/axe-reused-context. This did not change product code or relax audit assertions.

## Verification scorecard

${table(['Check','Phase 1','Phase 2'],[
['Production responsive matrix','2496 cases / 0 document overflows',metrics.responsiveCases+' cases / '+metrics.overflowCases+' overflows / '+metrics.responsiveErrors+' runner errors'],
['Browser console','Baseline events retained in per-case evidence',unexpectedConsoleErrors.length+' unexpected console-error cases; '+warningCases.length+' warning cases (retained for review)'],
['Scrolled menu panel','618 of 630 off viewport',metrics.menuOffViewport+' of '+metrics.menuCases+' off viewport; '+metrics.menuOpenJumps+' open jumps; '+metrics.menuCloseJumps+' close jumps; '+metrics.menuUnlocked+' unlocked cases'],
['Standalone menu regression','Not present',`${menuSummary.distinctCases} distinct cases; ${menuSummary.initialPassed} initial passes; ${menuSummary.resolvedTimeoutCases} timeouts resolved by focused retest; ${menuSummary.unresolved.length} unresolved`],
['axe (all pages and tested states)','264 scans; 12 serious; 0 critical',metrics.axeScans+' scans; '+JSON.stringify(impacts)],
['Fresh hash loads','Duplicate trees in all engines',JSON.stringify(runs.find(r=>r.suite==='hash'))],
['No-JS / blocked-script form','9 native GET exposure cases / 12 controls',JSON.stringify(runs.find(r=>r.suite==='nojs-form'))],
['Lighthouse','100 measurements; 10 mobile performance medians below 90',metrics.lighthouseMeasurements+' measurements; '+low.length+' mobile routes below 90 in any category'],
['HTML / ESLint','Semantic violations; 1 ESLint error',metrics.htmlErrors+' project HTML errors; '+metrics.eslintErrors+' ESLint errors'],
['Local CSP','Absent',JSON.stringify(runs.find(r=>r.suite==='csp'))],
['Security / dependencies','0 advisories; live CSP/frame/permissions gaps',JSON.stringify(runs.find(r=>r.suite==='security'))],
['Links','0 internal / 0 confirmed external broken',JSON.stringify(runs.find(r=>r.suite==='links'))],
])}

The complete [run summary](after-phase2/runs/all.json) includes nonzero audit findings, not just tool crashes. Default Prettier differences and two existing Privacy US-spelling variants are retained as low-priority review items. Project HTML/CSS validation separates semantic/syntax errors from serialization and legacy style conventions; [raw strict CSS](after-phase2/css-strict.json) is preserved. See [validation policy](CODE_STYLE_PHASE2.md). No claim is made that thousands of style findings were individually repaired.

## Lighthouse by page

Mobile uses simulated 150ms RTT, 1638.4Kbps and 4× CPU, three runs/median; desktop one run. Scores are Performance / Accessibility / Best Practices / SEO. Local TTFB/cache/compression do not certify live delivery; INP requires field data and TBT is only a lab proxy.

${table(['Route','Before mobile','After mobile','After desktop','LCP ms','TBT ms','CLS','TTFB ms'],mobile.map(r=>[r.route,scores(baselinePerf.rows.find(b=>b.route===r.route&&b.mode==='mobile')),scores(r),scores(perf.rows.find(p=>p.route===r.route&&p.mode==='desktop')),fmt(r.medians.lcpMs),fmt(r.medians.tbtMs),fmt(r.medians.cls,3),fmt(r.medians.ttfbMs)]))}

### Remaining performance budget items

${low.length?table(['Route','Median scores','Measured costs and next action'],lowDetails):'All measured mobile category medians meet 90.'}

Resource-transfer budgets may still flag otherwise high-scoring pages. Every run, including outliers, remains in [lighthouse-index.json](after-phase2/lighthouse-index.json) and linked JSON/HTML. Iteration evidence is under after-phase2/iterations; it is not substituted for the final campaign.

## Menu and footer implementation

${menuExceptions.length ? `The expanded menu retry retained ${menuExceptions.length} scroll or interaction exceptions. These cases remain open for the header follow-up.\n\n${table(['Engine','Device','Orientation','Route','Scroll fraction','Before Y','Open Y','Close Y','Locked'],menuExceptions)}` : 'The expanded menu results show stable scrolling in all completed cases.'}

${menu.errors.length ? `The expanded menu run recorded ${menu.errors.length} runner errors. Review the case-level records in [menu.json](after-phase2/menu.json).` : ''}

### Phone globe CPU comparison

${table(['Mode','Before task busy %','After task busy %'],globe.results.map(r=>[r.mode,fmt((baselineGlobe.results.find(b=>b.mode===r.mode)?.taskBusyRatio??0)*100,2),fmt(r.taskBusyRatio*100,2)]))}

These are three local four-second samples at 4× CPU emulation, not device battery or field INP measurements. Locations Lighthouse medians above provide a separate page-load measurement.

### Local headers versus live delivery

${table(['Header','Before live','After local candidate','Current live'],['strict-transport-security','content-security-policy','x-frame-options','x-content-type-options','referrer-policy','permissions-policy'].map(k=>[k,baselineSecurity.live.find(r=>r.status===200)?.headers[k]??'Absent',k==='content-security-policy'?(security.local[0]?.headers[k]?'Present — exact policy in vercel.json':'Absent'):security.local[0]?.headers[k]??'Absent (HTTP loopback)',security.live.find(r=>r.status===200)?.headers[k]??'Absent']))}

No host change was made. Review [the local header configuration](../vercel.json) and [security notes](../docs/SECURITY_HEADERS.md) before a separately authorized deployment. The report-only policy campaign and enforced compatibility campaign are separate artifacts.

The menu is a body-level portal, fixed to the current dynamic viewport. It sits outside the header’s backdrop-filter containing block. The scroll lock saves/restores existing overflow and position; the inert background, modal labeling, explicit focus cycle, focus visibility, Escape/outside/link closing and return focus are handled together. The desktop nav retains its normal layout. The 135-case standalone spec complements the larger 630-case named-device/orientation suite. Its first run had 132 passes and three test/host timeouts. Six focused retests, including those three cases and matching controls, passed on the unchanged build with one worker and a 90s overall deadline. The original report/traces are retained, and [combined coverage](after-phase2/menu-regression-summary.json) distinguishes resolved timeouts from a clean first run. Behavior assertions were not relaxed.

The phone footer uses a full-width brand description, two-column Explore links, a three-item Products row and full-width email. Navigation is 13.5px with 44px targets, description 13px, labels 11px, and legal links 12px. This avoids the narrow half-column email and broken-word labels in the supplied screenshot. It follows the structural patterns documented in [BENCHMARKS.md](BENCHMARKS.md), without copying competitors’ claims or changing the brand.

## Issue register

Statuses apply to this phase’s scope, not to a claim that the entire multi-phase engagement is complete. Severity remains the original baseline priority so an owner-dependent claim does not disappear through reclassification. Original root causes, options and evidence remain in [Phase 1](QA_REPORT_PHASE1.md); machine-readable [updated register](after-phase2/issue-register.json) retains them.

${table(['ID','Severity','Issue','Status','Resolution / remaining work'],issueRows.map(i=>[i.id,i.severity,i.category,i.status,i.resolution]))}

Remaining technical work includes the documented performance budget exceptions and owner review/deployment of local security headers. High content/legal items explicitly remain owner-dependent or gated to Phase 3/4; this is not final Definition of Done sign-off.

History-entry behavior follows the [HTML history standard](https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-history-scrollrestoration). The WebKit native-link diagnostic retained one header/main but reset restoration to auto. Six final focused controls retain manual mode without application errors; preload warnings are retained. Evidence is under after-phase2/iterations/webkit-native-links and webkit-document-retest.

## Artifacts and visual comparison

See [before/after screenshot index](SCREENSHOTS_PHASE2.md). Final screenshots/geometry cover all matrix routes in after-phase2/screenshots and after-phase2/layout. Priority footer/menu captures are indexed in [priority.json](after-phase2/priority.json). Menu traces/videos and standalone failure artifacts are retained. The original phone-footer reference is [baseline/user-footer-reference.png](baseline/user-footer-reference.png).

Additional evidence: [hash](after-phase2/hash-diagnostic.json), [form fallback](after-phase2/nojs-form.json), [functional](after-phase2/functional.json), [keyboard](after-phase2/keyboard.json), [input stress](after-phase2/input-stress.json), [robustness](after-phase2/robustness.json), [axe](after-phase2/axe-index.json), [globe CPU](after-phase2/globe-profile.json), [headers/audit](after-phase2/security.json), [CSP](after-phase2/csp.json), [SEO](after-phase2/seo.json), [links](after-phase2/links.json), [build](after-phase2/setup/build-final.txt).

## Cannot verify and owner checks

Real iOS/Android/iPad hardware, Safari URL-bar/rubber-band behavior, physical safe areas, OS zoom/text settings, on-screen keyboards, VoiceOver/TalkBack/NVDA/JAWS, native mail/clipboard permissions, genuine extension-based ad blocking and real 4G are not certified by emulation. Firefox runtime resize acknowledgement was unavailable on this host (including blank controls); fixed portrait/landscape dimensions remain covered. The reduced-data protocol probe was unmatched. Read [the manual checklist](MANUAL_PHASE2.md).

No live deployment was authorized. Live headers retain their prior state. Local preview cannot verify Vercel edge behavior, real production 404/redirect/cache rollout or field Core Web Vitals. Four external link checks were anti-bot/unverified at baseline; current detailed outcomes remain in links.json. No production form input or message was sent. Claims, legal approval, county coverage, product availability and real security certifications require the owners listed in CONTENT_TODO.md. A short accessibility statement draft is recorded for review and has not been published.

## Re-run

Run from the repo root with the documented Node/tool versions. Build first, set QA_OUTPUT to a fresh folder, and leave performance tests free of other browser workloads.

Commands: npm run build; npm run test:all; npm run test:menu:regression; node tests/run.mjs priority; node tests/run.mjs globe-profile. Focused npm run test:e2e, test:a11y, test:perf and test:links are also available. See [tests/README.md](../tests/README.md) for PowerShell examples and limitations.

## Files and gate

The exhaustive list is [FILES_PHASE2.md](FILES_PHASE2.md), with source/backup integrity in after-phase2/source-integrity.json. Generated build output and dependencies are excluded from source inventory. Existing files were backed up before editing; newly created files have no previous version.

STOP: Phase 2 report delivered for review. Phase 3 has not started and requires explicit written approval.
`
await writeFile('qa/QA_REPORT_PHASE2.md',report.replaceAll('\n\\\n','\n'))
console.log(JSON.stringify(metrics))
