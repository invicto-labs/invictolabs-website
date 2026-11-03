import { inspectLayout } from '../helpers/layout.mjs'
import { json, settle } from '../helpers/evidence.mjs'
export async function run({ base, routes, engines, engineNames }) {
  const results=[], errors=[]
  for(const engine of engineNames) {
    const browser=await engines[engine].launch()
    try {
      const page=await browser.newPage({viewport:{width:320,height:568}})
      for(const route of routes)try {
        await page.goto(base+route);await settle(page)
        const layout=await inspectLayout(page)
        results.push({engine,route,horizontalOverflow:layout.horizontalOverflow,smallTargets:layout.smallTargets,smallInputs:layout.smallInputs})
      }catch(error){errors.push({engine,route,error:String(error)})}
    }finally{await browser.close()}
  }
  await json('layout-smoke.json',{results,errors})
  return {cases:results.length,errors:errors.length,smallTargets:results.reduce((n,r)=>n+r.smallTargets.length,0),smallInputs:results.reduce((n,r)=>n+r.smallInputs.length,0),failures:errors.length+results.filter(r=>r.horizontalOverflow||r.smallTargets.length||r.smallInputs.length).length}
}
