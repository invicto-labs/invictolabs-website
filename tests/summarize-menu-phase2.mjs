import { readFile,writeFile } from 'node:fs/promises'
const read=async p=>JSON.parse(await readFile(p,'utf8'))
const initial=await read('qa/after-phase2/playwright-menu.json')
const retry=await read('qa/after-phase2/iterations/menu-retest/playwright-menu.json')
function cases(report){const rows=[];function walk(s){for(const spec of s.specs||[])for(const test of spec.tests||[])rows.push({project:test.projectName,title:spec.title,status:test.status,errors:test.results.flatMap(r=>r.errors).map(e=>e.message),attachments:test.results.flatMap(r=>r.attachments)});for(const child of s.suites||[])walk(child)}walk(report);return rows}
const first=cases(initial),retests=cases(retry)
const resolved=first.filter(r=>r.status!=='expected').map(r=>({...r,resolved:retests.some(t=>t.project===r.project&&t.title===r.title&&t.status==='expected')}))
const summary={distinctCases:first.length,initialPassed:first.filter(r=>r.status==='expected').length,initialUnexpected:first.filter(r=>r.status!=='expected').length,retestCases:retests.length,retestPassed:retests.filter(r=>r.status==='expected').length,resolvedTimeoutCases:resolved.filter(r=>r.resolved).length,unresolved:resolved.filter(r=>!r.resolved),resolved,
  initialReport:'qa/after-phase2/playwright-menu.json',retestReport:'qa/after-phase2/iterations/menu-retest/playwright-menu.json',note:'Original 135-case run is preserved verbatim. Three cases hit the 45s host/test deadline (including Firefox context teardown with SWGL errors); focused controls were repeated with one worker and a 90s deadline on the unchanged build. Assertions were not relaxed. This is combined coverage, not a claim of a clean 135-case first run.'}
await writeFile('qa/after-phase2/menu-regression-summary.json',JSON.stringify(summary,null,2)+'\n')
console.log(JSON.stringify({...summary,resolved:summary.resolved.map(r=>({project:r.project,title:r.title,resolved:r.resolved})),unresolved:summary.unresolved.length}))
if(first.length!==135||summary.unresolved.length||retests.some(r=>r.status!=='expected'))process.exitCode=1
