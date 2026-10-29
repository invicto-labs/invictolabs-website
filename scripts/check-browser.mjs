import puppeteer from 'puppeteer-core'
import { readFile } from 'node:fs/promises'

const base = process.argv[2] || 'http://127.0.0.1:4176'
const paths = process.argv.length > 3 ? process.argv.slice(3) : [...(await readFile('dist/sitemap.xml', 'utf8')).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname)
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
let failures = 0
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage()
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
    let errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (['error', 'warn'].includes(message.type())) errors.push(message.text()) })
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
    for (const path of paths) {
      errors = []
      await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 60000 })
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
      await new Promise(resolve => setTimeout(resolve, 700))
      const state = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src),
      }))
      if (state.h1 !== 1 || state.overflow || state.brokenImages.length) errors.push(JSON.stringify(state))
      if (errors.length) failures++
      console.log(JSON.stringify({ width, path, errors: [...new Set(errors)] }))
    }
    await page.close()
  }
} finally { await browser.close() }
if (failures) process.exitCode = 1
