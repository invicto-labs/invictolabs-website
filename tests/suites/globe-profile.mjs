import { json, settle } from '../helpers/evidence.mjs'
export async function run({ base, engines }) {
  const browser = await engines.chromium.launch(),
    results = []
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } }),
      page = await context.newPage(),
      session = await context.newCDPSession(page)
    await session.send('Performance.enable')
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await page.goto(base + '/location')
    await settle(page)
    await page.locator('.locations-globe canvas').scrollIntoViewIfNeeded()
    await page.waitForFunction(
      () => document.querySelector('.locations-globe canvas')?.style.opacity === '1',
    )
    for (const mode of ['visible', 'hidden-local-diagnostic', 'visible-reduced-motion']) {
      if (mode === 'hidden-local-diagnostic')
        await page.locator('.locations-globe').evaluate((el) => (el.style.visibility = 'hidden'))
      // display:none makes the existing IntersectionObserver stop scheduling;
      // visibility:hidden alone would not, so retain both facts explicitly.
      if (mode === 'hidden-local-diagnostic')
        await page.locator('.locations-globe').evaluate((el) => (el.style.display = 'none'))
      if (mode === 'visible-reduced-motion') {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.locator('.locations-globe').evaluate((el) => {
          el.style.removeProperty('display')
          el.style.removeProperty('visibility')
        })
        await page.locator('.locations-globe canvas').scrollIntoViewIfNeeded()
      }
      await page.waitForTimeout(400)
      const before = await session.send('Performance.getMetrics'),
        started = Date.now()
      await page.waitForTimeout(4000)
      const after = await session.send('Performance.getMetrics'),
        seconds = (Date.now() - started) / 1000
      const value = (metrics, key) => metrics.metrics.find((m) => m.name === key)?.value ?? 0
      const deltas = Object.fromEntries(
        ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration'].map((key) => [
          key,
          value(after, key) - value(before, key),
        ]),
      )
      results.push({
        mode,
        seconds,
        cpuRate: 4,
        deltas,
        taskBusyRatio: deltas.TaskDuration / seconds,
        note: 'Local DOM-only visibility/display diagnostic; no product source changes. This comparison measures this host, not user-device battery or field INP.',
      })
    }
    await session.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await session.detach()
    await context.close()
  } finally {
    await browser.close()
  }
  await json('globe-profile.json', { results })
  return { samples: results.length, failures: 0 }
}
