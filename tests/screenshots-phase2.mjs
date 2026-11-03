import { readFile, writeFile } from 'node:fs/promises'
const read=async file=>JSON.parse(await readFile(file,'utf8'))
const before=await read('qa/baseline/e2e/responsive-index.json'),after=await read('qa/after-phase2/responsive-index.json')
const menuBefore=await read('qa/baseline/e2e/menu.json'),menuAfter=await read('qa/after-phase2/menu.json')
const table=(heads,rows)=>`| ${heads.join(' | ')} |\n| ${heads.map(()=>'---').join(' | ')} |\n${rows.map(r=>'| '+r.join(' | ')+' |').join('\n')}\n`
const link=row=>row?`[${row.screenshotScope??'viewport'}](${row.screenshot.replace(/^qa\//,'')})`:'Unavailable'
const rows=[]
for(const route of ['/','/services','/our-approach','/location','/products/traceq','/products/titleflow-ai','/products/tax-flow'])for(const width of [320,360,390,430,768,1024,1440]) {
  const find=d=>d.index.find(r=>r.engine==='chromium'&&r.route===route&&r.scenario.startsWith(width+'x')&&r.orientation==='portrait')??d.index.find(r=>r.engine==='chromium'&&r.route===route&&r.scenario.startsWith(width+'x'))
  rows.push([route,width,link(find(before)),link(find(after))])
}
const menuRows=[]
for(const route of ['/','/services','/our-approach','/products','/location'])for(const fraction of [.4,.8,1]) {
  const find=d=>d.results.find(r=>r.engine==='chromium'&&r.device==='iPhone 13'&&r.orientation==='portrait')?.rows.find(r=>r.route===route&&r.fraction===fraction)
  menuRows.push([route,Math.round(fraction*100)+'%',link(find(menuBefore)),link(find(menuAfter))])
}
await writeFile('qa/SCREENSHOTS_PHASE2.md',`# Phase 2 screenshot comparison index\n\nAll screenshots are local production-browser captures. Fixed-size viewport captures show the first-screen decoration; 390px and 1440px anchors include the full page. Layout JSON also inventories off-screen decorative bounds and scroll-width checks at 40%, 80% and footer. Clipped decorative geometry is distinguished from document overflow.\n\n## Footer priority\n\nBefore: [user-supplied reference](baseline/user-footer-reference.png). After: [320px](after-phase2/screenshots/footer_chromium-320_portrait_after.png), [360px](after-phase2/screenshots/footer_chromium-360_portrait_after.png), [390px](after-phase2/screenshots/footer_chromium-390_portrait_after.png), [430px](after-phase2/screenshots/footer_chromium-430_portrait_after.png), [768px](after-phase2/screenshots/footer_chromium-768_portrait_after.png). The final priority index includes Firefox/WebKit and 1024/1440px captures too.\n\n## Blobs, backgrounds and key pages\n\n${table(['Route','Width','Before','After'],rows)}\n\n## Scrolled menu, iPhone 13 / Chromium\n\n${table(['Route','Scroll','Before','After'],menuRows)}\n\nThe complete named-device matrix includes all three engines, portrait/landscape, iPhone SE/13/15 Pro Max, Pixel 7, custom Galaxy S23 and iPad. Inspect [menu.json](after-phase2/menu.json), [responsive-index.json](after-phase2/responsive-index.json), [priority.json](after-phase2/priority.json) and their evidence paths for the full set. Before and after are separately retained; attempt folders document interrupted/failed iterations and are not final pass evidence.\n`)
