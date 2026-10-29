import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const width of [1440, 390]) {
    await page.setViewport({ width, height: 900 })
    await page.goto((process.argv[2] || 'http://127.0.0.1:5174') + '/products/traceq', { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => document.querySelector('.product-window img').naturalWidth === 3200)
    const count = await page.$$eval('.traceq-gallery__controls button', buttons => buttons.length)
    assert.equal(count, 4)
    for (let index = 0; index < count; index++) {
      const buttons = await page.$$('.traceq-gallery__controls button')
      await buttons[index].evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await buttons[index].click()
      await page.waitForFunction(() => {
        const image = document.querySelector('#traceq-screen img')
        return image.complete && image.naturalWidth === 3200
      })
      assert.equal(await buttons[index].evaluate(el => el.getAttribute('aria-pressed')), 'true')
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false)
    console.log(`PASS TraceQ hero and ${count} gallery views at ${width}px`)
  }
  assert.deepEqual(errors, [])
} finally { await browser.close() }
