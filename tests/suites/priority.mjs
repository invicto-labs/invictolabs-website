import path from 'node:path'
import {mkdir} from 'node:fs/promises'
import {output,json,settle,scrollToFraction,screenshot} from '../helpers/evidence.mjs'
export async function run({base,engines,engineNames}){
  const results=[],errors=[]
  await mkdir(path.join(output,'screenshots'),{recursive:true})
  for(const engine of engineNames){const browser=await engines[engine].launch();try{
    for(const width of [320,360,390,430,768,1024,1440]){
      const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage()
      try {
        await page.goto(base+'/our-approach');await settle(page);await scrollToFraction(page,1)
        const file=`screenshots/footer_${engine}-${width}_portrait_after.png`
        await page.locator('.site-footer').screenshot({path:path.join(output,file),animations:'disabled',scale:'css'})
        const footer=await page.locator('.site-footer').evaluate(el=>({height:el.getBoundingClientRect().height,font:getComputedStyle(el.querySelector('.footer-nav a')).fontSize,brandFont:getComputedStyle(el.querySelector('.footer-brand>p')).fontSize,grid:getComputedStyle(el.querySelector('.footer-grid')).gridTemplateColumns,email:el.querySelector('[href^="mailto:"]').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth+1}))
        let menu
        if(width<=1280){
          const before=await scrollToFraction(page,.8),button=page.locator('.menu-toggle'),r=await button.boundingBox()
          await page.mouse.click(r.x+r.width/2,r.y+r.height/2)
          await page.getByRole('dialog',{name:'Main navigation'}).waitFor()
          menu={before,openedY:await page.evaluate(()=>scrollY),rect:await page.locator('#header-menu').boundingBox(),screenshot:await screenshot(page,'/our-approach',`${engine}-${width}-priority`,'portrait','menu-80',false)}
          await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.mobile-menu-layer'))
          menu.closedY=await page.evaluate(()=>scrollY)
        }
        results.push({engine,width,footer,menu,screenshot:path.relative(process.cwd(),path.join(output,file)).replaceAll('\\','/')})
      }catch(error){errors.push({engine,width,error:String(error)})}finally{await context.close()}
    }
  }finally{await browser.close()}}
  await json('priority.json',{results,errors})
  return {cases:results.length,errors:errors.length,failures:errors.length+results.filter(r=>r.footer.overflow||r.menu&&(Math.abs(r.menu.before-r.menu.openedY)>1||Math.abs(r.menu.before-r.menu.closedY)>1)).length}
}
