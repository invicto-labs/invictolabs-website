import {test,expect} from '@playwright/test'

for (const route of ['/','/services','/our-approach','/products','/location']) {
  for (const fraction of [.4,.8,1]) {
    test(`${route} menu at ${fraction*100}% preserves viewport and focus`,async({page})=>{
      await page.goto(route)
      await expect(page.locator('.site-header')).toHaveCount(1)
      await page.waitForFunction(()=>history.scrollRestoration==='manual')
      await page.evaluate(()=>document.fonts.ready)
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
      await page.evaluate(f=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*f)},fraction)
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
      const before=await page.evaluate(()=>scrollY),trigger=page.locator('.menu-toggle')
      const box=await trigger.boundingBox();expect(box).toBeTruthy()
      await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2)
      const dialog=page.getByRole('dialog',{name:'Main navigation'})
      await expect(dialog).toBeVisible()
      const bounds=await dialog.boundingBox(),viewport=page.viewportSize()!
      expect(bounds!.y).toBeGreaterThanOrEqual(-1)
      expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(viewport.height+1)
      expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(2)
      await expect(trigger).toHaveAttribute('aria-expanded','true')
      await expect(dialog.locator('.mobile-menu-close')).toBeFocused()
      for(let i=0;i<20;i++){
        await page.keyboard.press(i%5===0?'Shift+Tab':'Tab')
        expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)
        const focused=await page.evaluate(()=>document.activeElement!.getBoundingClientRect().toJSON())
        expect(focused.top).toBeGreaterThanOrEqual(-1)
        expect(focused.bottom).toBeLessThanOrEqual(viewport.height+1)
      }
      // The document must stay locked even when the last content row is reached.
      await page.keyboard.press('PageDown')
      expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(2)
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
      expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(2)
      await trigger.press('Enter')
      await expect(dialog).toBeVisible()
      await page.mouse.click(1,viewport.height-2)
      await expect(dialog).toHaveCount(0)
      expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(2)
    })
  }
}
