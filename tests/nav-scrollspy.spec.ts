import { chromium, devices, expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'

const output = path.resolve(process.env.QA_OUTPUT || 'qa/after-phase2-nav')
const labels = ['Home', 'Services', 'Our Approach', 'Locations', 'Products', 'Our Company', 'Resources']
const sections = [
  { key: '/services', anchor: 'home-services', heading: 'services-heading' },
  { key: '/our-approach', anchor: 'home-approach', heading: 'approach-heading' },
  { key: '/location', anchor: 'home-locations', heading: 'locations-heading' },
]
const viewports = [
  { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 430, height: 932 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 },
  { width: 844, height: 390 },
]

async function ready(page: Page) {
  await page.bringToFront()
  await page.waitForFunction(() => history.scrollRestoration === 'manual' && document.querySelectorAll('main').length === 1, null, { polling: 100 })
  await page.evaluate(() => document.fonts.ready)
  await settleScroll(page)
}

async function settleScroll(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
}

async function openMenu(page: Page) {
  const trigger = page.getByRole('button', { name: 'Open navigation menu' })
  const before = await page.evaluate(() => scrollY)
  const triggerBounds = (await trigger.boundingBox())!
  await page.mouse.click(triggerBounds.x + triggerBounds.width / 2, triggerBounds.y + triggerBounds.height / 2)
  const dialog = page.getByRole('dialog', { name: 'Main navigation' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close navigation menu' })).toBeFocused()
  expect(await page.evaluate(y => Math.abs(scrollY - y), before), 'Scroll position after opening').toBeLessThan(2)
  const bounds = (await dialog.boundingBox())!
  expect(bounds.y).toBeGreaterThanOrEqual(-1)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight + 1))
  const nav = dialog.getByRole('navigation', { name: 'Primary navigation' })
  expect(await nav.locator('[data-nav-item]').evaluateAll(items =>
    Math.min(...items.map(item => item.getBoundingClientRect().height))
  )).toBeGreaterThanOrEqual(44)
  return nav
}

async function checkActive(page: Page, key: string, mobile: boolean, current: 'location' | 'page') {
  const nav = mobile ? await openMenu(page) : page.getByRole('navigation', { name: 'Primary navigation' })
  const item = nav.locator(`[data-nav-item="${key}"]`)
  await expect(item).toHaveAttribute('aria-current', current)
  await expect(nav.locator('[aria-current]')).toHaveCount(1)
  if (!mobile) {
    const indicator = nav.locator('.primary-nav__indicator')
    await expect(indicator).toBeVisible()
    await expect.poll(async () => {
      const [line, active] = await Promise.all([indicator.boundingBox(), item.boundingBox()])
      return line && active ? Math.max(Math.abs(line.x - active.x), Math.abs(line.width - active.width)) : 100
    }).toBeLessThan(1.5)
  }
  return nav
}

for (const viewport of viewports) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })
    test('Home scroll-spy and section links', async ({ page, browserName }) => {
      const mobile = viewport.width <= 1280
      await page.goto('/')
      await ready(page)
      let nav = await checkActive(page, '/', mobile, 'location')
      expect((await nav.locator('[data-nav-item]').allTextContents()).map(value => value.trim())).toEqual(labels)
      if (!mobile) await page.screenshot({ path: path.join(output, 'frames', `${browserName}-1440-home-top.png`) })
      if (mobile) await page.keyboard.press('Escape')
      const footer = page.getByRole('navigation', { name: 'Footer navigation' })
      expect(await footer.getByRole('link').allTextContents()).toEqual([
        ...labels.slice(0, -1), 'Blogs', 'Workflow Walkthroughs', 'FAQ',
      ])
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThan(2)
      const initialHistoryLength = await page.evaluate(() => history.length)
      for (const section of sections) {
        // Test actual scroll position changes without using the link handler.
        await expect(page.locator('.mobile-menu-layer')).toHaveCount(0)
        await page.locator(`#${section.anchor}`).evaluate(anchor => {
          const header = document.querySelector('header')!.getBoundingClientRect().height
          window.scrollTo({ top: scrollY + anchor.getBoundingClientRect().top - header - 8, behavior: 'instant' })
        })
        await settleScroll(page)
        nav = await checkActive(page, section.key, mobile, 'location')
        if (!mobile || viewport.width === 390) await page.screenshot({ path: path.join(output, 'frames', `${browserName}-${viewport.width}-${section.anchor}.png`) })
        await nav.locator(`[data-nav-item="${section.key}"]`).click()
        await expect(page).toHaveURL(new RegExp(`#${section.anchor}$`))
        await expect(page.locator(`#${section.heading}`)).toBeFocused()
        await expect.poll(() => page.locator(`#${section.heading}`).evaluate(heading => heading.getBoundingClientRect().top - document.querySelector('header')!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(-1)
        await expect(page.locator(`#${section.heading}`)).toBeInViewport()
        await expect.poll(() => page.locator(`#${section.anchor}`).evaluate(anchor =>
          Math.abs(anchor.getBoundingClientRect().top - document.querySelector('header')!.getBoundingClientRect().bottom - 8)
        )).toBeLessThan(2)
        expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength)
        await expect(page.locator('.mobile-menu-layer')).toHaveCount(0)
      }
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await settleScroll(page)
      if (viewport.width === 390) await page.locator('.site-footer').screenshot({ path: path.join(output, 'frames', `${browserName}-390-footer.png`) })
      nav = await checkActive(page, '/location', mobile, 'location')
      await nav.locator('[data-nav-item="/"]').press('Space')
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2)
      await expect(page.locator('#hero-heading')).toBeFocused()

      await page.goto('/#home-approach')
      await page.reload()
      await ready(page)
      await expect(page.locator('#approach-heading')).toBeFocused()
      nav = await checkActive(page, '/our-approach', mobile, 'location')
      const products = (await nav.locator('[data-nav-item="/products"]').boundingBox())!
      await page.mouse.click(products.x + products.width / 2, products.y + products.height / 2)
      await expect(page).toHaveURL(/\/products$/)
      await ready(page)
      await page.goBack()
      await expect(page).toHaveURL(/#home-approach$/)
      await ready(page)
      await checkActive(page, '/our-approach', mobile, 'location')
      if (mobile) await page.keyboard.press('Escape')
      await page.goForward()
      await expect(page).toHaveURL(/\/products$/)
      await ready(page)
      await checkActive(page, '/products', mobile, 'page')
    })
  })
}

test.describe('Desktop navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test('route and parent selection, Resources keyboard controls, and reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [route, active] of [
      ['/services/title', '/services'], ['/our-approach', '/our-approach'], ['/location', '/location'],
      ['/products/traceq', '/products'], ['/our-company', '/our-company'], ['/blogs', 'resources'],
      ['/case-studies', 'resources'], ['/faq', 'resources'],
    ]) {
      await page.goto(route)
      await ready(page)
      const nav = await checkActive(page, active, false, 'page')
      expect(await nav.locator('.primary-nav__indicator').evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001)
    }
    const resources = page.getByRole('button', { name: 'Resources' })
    await resources.press('Space')
    await expect(resources).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('link', { name: /Blogs/ }).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(resources).toHaveAttribute('aria-expanded', 'false')
    await page.goto('/')
    await ready(page)
    await page.locator('[data-nav-item="/services"]').press('Enter')
    await expect(page.locator('#services-heading')).toBeFocused()
    await expect(page.locator('#services-heading')).toBeInViewport()
    await checkActive(page, '/services', false, 'location')
  })
})

test('Products menu at 80% on landscape iPhone SE', async ({ browser, browserName, baseURL }) => {
  test.skip(browserName !== 'webkit')
  const context = await browser.newContext({ ...devices['iPhone SE'], viewport: { width: 568, height: 320 } })
  try {
    const page = await context.newPage()
    await page.goto(`${baseURL}/products`)
    await ready(page)
    await page.evaluate(() => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * .8, behavior: 'instant' }))
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100)
    await settleScroll(page)
    const before = await page.evaluate(() => scrollY)
    await checkActive(page, '/products', true, 'page')
    await page.keyboard.press('Escape')
    await expect(page.locator('.mobile-menu-layer')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()
    expect(await page.evaluate(y => Math.abs(scrollY - y), before)).toBeLessThan(2)
  } finally {
    await context.close()
  }
})

test('native Chromium browser zoom at 200%', async ({ browserName, baseURL }) => {
  test.skip(browserName !== 'chromium')
  await mkdir(output, { recursive: true })
  const extension = await mkdtemp(path.join(output, 'zoom-extension-'))
  await writeFile(path.join(extension, 'manifest.json'), JSON.stringify({
    manifest_version: 3, name: 'Local QA Zoom', version: '1.0', background: { service_worker: 'worker.js' },
  }))
  await writeFile(path.join(extension, 'worker.js'), 'chrome.runtime.onInstalled.addListener(() => {});\n')
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', viewport: null,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--window-size=1440,900'],
  })
  try {
    const page = context.pages()[0]
    await page.goto(`${baseURL}/`)
    await ready(page)
    const originalWidth = await page.evaluate(() => innerWidth)
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker')
    const zoom = await worker.evaluate(async () => {
      const tabs = (globalThis as unknown as { chrome: { tabs: {
        query: (options: { active: boolean }) => Promise<{ id: number }[]>,
        setZoom: (id: number, zoom: number) => Promise<void>,
        getZoom: (id: number) => Promise<number>,
      } } }).chrome.tabs
      const [tab] = await tabs.query({ active: true })
      await tabs.setZoom(tab.id, 2)
      return tabs.getZoom(tab.id)
    })
    expect(zoom).toBe(2)
    await expect.poll(() => page.evaluate(() => innerWidth)).toBeLessThan(originalWidth)
    const nav = await openMenu(page)
    await expect(nav.locator('[aria-current]')).toHaveText('Home')
    await nav.locator('[data-nav-item="/services"]').click()
    await expect(page.locator('#services-heading')).toBeFocused()
    await expect(page.locator('#services-heading')).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThan(2)
    await page.screenshot({ path: path.join(output, 'frames', 'chromium-native-zoom-200.png') })
  } finally {
    await context.close()
  }
})
