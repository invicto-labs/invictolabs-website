import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
// Later reruns must not overwrite the retained Phase 1 baseline by default.
export const output = path.resolve(process.env.QA_OUTPUT || 'qa/after-phase2')
export const slug = (value) =>
  value === '/' ? 'home' : value.replace(/^\//, '').replace(/[^a-z0-9.-]+/gi, '_')
export async function json(file, value) {
  const destination = path.join(output, file)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, JSON.stringify(value, null, 2) + '\n')
  return path.relative(process.cwd(), destination).replaceAll('\\', '/')
}
export async function screenshot(page, route, device, orientation, state, fullPage = true) {
  const file = `screenshots/${slug(route)}_${slug(device)}_${orientation}_${state}.png`
  await mkdir(path.join(output, 'screenshots'), { recursive: true })
  await page.screenshot({
    path: path.join(output, file),
    fullPage,
    animations: 'disabled',
    scale: 'css',
    timeout: 30000,
  })
  return path.relative(process.cwd(), path.join(output, file)).replaceAll('\\', '/')
}
export function collectErrors(page) {
  const events = { console: [], pageerrors: [], failedRequests: [], httpErrors: [] }
  page.on('console', (m) => {
    if (['error', 'warning', 'warn'].includes(m.type()))
      events.console.push({ type: m.type(), text: m.text(), location: m.location() })
  })
  page.on('pageerror', (e) => events.pageerrors.push(e.message))
  page.on('requestfailed', (r) =>
    events.failedRequests.push({ url: r.url(), failure: r.failure() }),
  )
  page.on('response', (r) => {
    if (r.status() >= 400) events.httpErrors.push({ url: r.url(), status: r.status() })
  })
  return events
}
export async function settle(page) {
  // axe uses a temporary page to aggregate results. Explicitly reactivate the
  // target tab before waiting for React effects in headless WebKit.
  await page.bringToFront()
  await page.locator('main').waitFor({ state: 'attached', timeout: 15000 })
  // Pre-rendered lazy routes can briefly contain a hidden streamed copy.
  // Wait for the route effect, not just the server-rendered main element.
  await page.waitForFunction(
    () =>
      document.querySelectorAll('.site-header').length === 1 &&
      document.querySelectorAll('main').length === 1 &&
      !document.querySelector('.route-loading') &&
      history.scrollRestoration === 'manual',
    null,
    { timeout: 30000 },
  ).catch(async error => {
    const state = await page.evaluate(() => ({url:location.href,headers:document.querySelectorAll('.site-header').length,mains:document.querySelectorAll('main').length,loading:document.querySelectorAll('.route-loading').length,restoration:history.scrollRestoration,visibility:document.visibilityState,ready:document.readyState,reactRoot:Object.keys(document.getElementById('root')??{}).some(k=>k.startsWith('__reactContainer')),reactHeader:Object.keys(document.querySelector('.site-header')??{}).some(k=>k.startsWith('__reactFiber')),fieldsetDisabled:document.querySelector('fieldset')?.disabled})).catch(()=>null)
    throw new Error(`${error}; page state: ${JSON.stringify(state)}`)
  })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )
}
export async function scrollToFraction(page, fraction) {
  await page.evaluate((f) => {
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, Math.max(0, (document.documentElement.scrollHeight - innerHeight) * f))
  }, fraction)
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )
  return page.evaluate(() => scrollY)
}
