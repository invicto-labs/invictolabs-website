import { json, settle } from '../helpers/evidence.mjs'
export async function run({ base, engines, devices }) {
  const browser = await engines.firefox.launch(),
    results = []
  try {
    const { isMobile, defaultBrowserType, ...options } = devices['iPhone SE']
    for (const [kind, viewport] of [
      ['blank-short', { width: 568, height: 320 }],
      ['blank-desktop', { width: 1440, height: 900 }],
      ['site-menu', { width: 568, height: 320 }],
    ]) {
      const context = await browser.newContext(options),
        page = await context.newPage()
      await page.goto(kind === 'site-menu' ? base + '/our-company' : 'about:blank')
      if (kind === 'site-menu') {
        await settle(page)
        await page.locator('.menu-toggle').click()
        await page.emulateMedia({ reducedMotion: 'reduce' })
      }
      await json('firefox-resize-progress.json', { phase: 'before-resize', kind, viewport })
      const started = Date.now()
      let timer, error
      try {
        await Promise.race([
          page.setViewportSize(viewport),
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(new Error('Firefox resize exceeded 5s diagnostic deadline')),
              5000,
            )
          }),
        ])
      } catch (e) {
        error = String(e)
      } finally {
        clearTimeout(timer)
      }
      let state
      let stateTimer
      try {
        state = await Promise.race([
          page.evaluate(() => ({
            width: innerWidth,
            height: innerHeight,
            menu: document.querySelector('.menu-toggle')?.getAttribute('aria-expanded'),
            visibility: document.visibilityState,
          })),
          new Promise((_, reject) => {
            stateTimer = setTimeout(
              () => reject(new Error('DOM state unavailable after resize deadline')),
              3000,
            )
          }),
        ])
      } catch (e) {
        state = { error: String(e) }
      } finally {
        clearTimeout(stateTimer)
      }
      results.push({ kind, viewport, elapsedMs: Date.now() - started, error, state })
      await context.close()
    }
  } finally {
    await browser.close()
  }
  await json('firefox-resize.json', { recordedVideo: false, results })
  return { cases: results.length, failures: results.filter((r) => r.error).length }
}
