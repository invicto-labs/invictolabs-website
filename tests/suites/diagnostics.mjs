import { json, settle, scrollToFraction, screenshot } from '../helpers/evidence.mjs'
export async function run({ base, engines }) {
  const browser = await engines.chromium.launch(),
    results = []
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    const measure = () =>
      page.evaluate(() => {
        const rect = (el) => {
          const r = el.getBoundingClientRect()
          return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }
        }
        const header = document.querySelector('.site-header'),
          menu = document.querySelector('#header-menu')
        const ancestors = []
        let p = header
        while (p) {
          const c = getComputedStyle(p)
          ancestors.push({
            tag: p.tagName,
            className: p.className,
            rect: rect(p),
            position: c.position,
            overflow: c.overflow,
            overflowX: c.overflowX,
            overflowY: c.overflowY,
            transform: c.transform,
            filter: c.filter,
            backdropFilter: c.backdropFilter,
            willChange: c.willChange,
            contain: c.contain,
          })
          p = p.parentElement
        }
        return {
          scrollY,
          scrollingElement: document.scrollingElement.tagName,
          header: rect(header),
          menu: rect(menu),
          trigger: rect(document.querySelector('.menu-toggle')),
          menuPosition: getComputedStyle(menu).position,
          offsetParent: menu.offsetParent?.className,
          ancestors,
        }
      })
    for (const fraction of [0.4, 0.8, 1]) {
      await page.goto(base + '/')
      await settle(page)
      await scrollToFraction(page, fraction)
      const before = await measure()
      await page.mouse.click(
        before.trigger.x + before.trigger.width / 2,
        before.trigger.y + before.trigger.height / 2,
      )
      const open = await measure()
      const screenshotPath = await screenshot(
        page,
        '/',
        'chromium-diagnostic',
        'portrait',
        `menu-open-${fraction}`,
        false,
      )
      await page.evaluate(() => (document.body.style.overflow = 'visible'))
      const bodyVisible = await measure()
      await page.evaluate(() => document.body.style.removeProperty('overflow'))
      await page.keyboard.press('Escape')
      const closed = await measure()
      // Temporary DOM-only experiments identify the causal CSS interaction; no source files change.
      await page.evaluate(() => (document.documentElement.style.overflow = 'hidden'))
      await page.locator('.menu-toggle').click()
      const htmlLocked = await measure()
      await page.keyboard.press('Escape')
      results.push({
        fraction,
        before,
        open,
        bodyVisible,
        closed,
        htmlLocked,
        screenshot: screenshotPath,
      })
    }
    await context.close()
  } finally {
    await browser.close()
  }
  await json('menu-root-cause.json', results)
  return { cases: results.length, failures: 0 }
}
