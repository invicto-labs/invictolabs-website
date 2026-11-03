import { json } from '../helpers/evidence.mjs'
export async function run({base,engines}) {
  const browser=await engines.webkit.launch(),results=[]
  try {
    for(const hasTouch of [true,false]) for(const route of ['/','/services','/privacy-policy']) {
      const context=await browser.newContext({viewport:{width:390,height:900},hasTouch}),page=await context.newPage(),events=[]
      page.on('console',m=>events.push({type:m.type(),text:m.text()}))
      page.on('pageerror',e=>events.push({type:'pageerror',text:e.message}))
      page.on('requestfailed',r=>events.push({type:'failed',url:r.url(),error:r.failure()}))
      const response=await page.goto(base+route)
      await page.waitForFunction(()=>history.scrollRestoration==='manual')
      await page.evaluate(()=>document.fonts.ready)
      await page.keyboard.press('Tab')
      await page.locator('.skip-link').focus()
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
      await page.locator('.menu-toggle').click()
      await page.locator('.header-actions a.button').click()
      await page.waitForTimeout(3000)
      results.push({route,hasTouch,headers:response.headers(),state:await page.evaluate(()=>({url:location.href,headers:document.querySelectorAll('.site-header').length,mains:document.querySelectorAll('main').length,restoration:history.scrollRestoration,loading:document.querySelectorAll('.route-loading').length,html:document.querySelector('#root').innerHTML.slice(0,100),visibility:document.visibilityState})),events})
      await context.close()
    }
  }finally{await browser.close()}
  await json('functional-diagnostic.json',results)
  return {cases:results.length,failures:results.filter(r=>r.state.headers!==1||r.state.mains!==1||r.state.restoration!=='manual').length}
}
