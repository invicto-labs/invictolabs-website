import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { preview } from 'vite'

process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve('node_modules/.cache/ms-playwright')
const { chromium, firefox, webkit, expect } = await import('@playwright/test')
const output = path.resolve(process.env.QA_OUTPUT || 'qa/after-phase5', 'journeys')
const port = Number(process.env.QA_PORT || 4189)
await mkdir(output, { recursive: true })
const server = await preview({ preview: { host: '127.0.0.1', port, strictPort: true } })
const base = `http://127.0.0.1:${port}`

try {
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await engine.launch()
    try {
      for (const width of [360, 390, 768, 1440, 430]) {
        const page = await browser.newPage({ viewport: { width, height: width === 430 ? 932 : 900 }, reducedMotion: 'reduce' })
        try {
          for (const route of ['/services', '/our-approach', '/services/tax-property']) {
            await page.goto(base + route)
            await page.waitForFunction(() => history.scrollRestoration === 'manual')
            await expect(page.getByRole('main')).toHaveCount(1)
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
            expect(overflow).toBeLessThan(2)
            if (route === '/our-approach') {
              const discover = page.getByRole('tab', { name: /discover/i })
              await discover.press('ArrowRight')
              await expect(page.getByRole('tab', { name: /align/i })).toBeFocused()
              await expect(page.getByRole('tabpanel')).toBeVisible()
            } else if (route === '/services') {
              const selector = page.getByRole('group', { name: 'Choose a service' })
              const tax = selector.getByRole('button', { name: /tax.*property/i })
              await tax.click()
              await expect(tax).toHaveAttribute('aria-pressed', 'true')
            } else {
              const switcher = page.getByRole('navigation', { name: 'Explore Invicto services' })
              await expect(switcher.locator('[aria-current="page"]')).toHaveCount(1)
            }
            if (name === 'chromium' && width !== 430) {
              await page.screenshot({ path: path.join(output, `${width}-${route.slice(1).replaceAll('/', '-')}.png`), fullPage: true })
            }
            console.log(`PASS ${name} ${width} ${route}`)
          }
          if (width === 390) {
            await page.goto(base + '/location')
            await expect(page.getByRole('link', { name: /view directions to dallas/i })).toBeVisible()
            await expect(page.getByRole('link', { name: /view directions to bengaluru/i })).toBeVisible()
            await page.goto(base + '/__qa_missing_page__')
            await expect(page.getByRole('main').getByRole('link', { name: 'Explore Invicto services' })).toHaveAttribute('href', '/services')
          }
        } finally {
          await page.close()
        }
      }
    } finally {
      await browser.close()
    }
  }
} finally {
  await new Promise(resolve => server.httpServer.close(resolve))
}
