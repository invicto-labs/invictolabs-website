import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  for (const [width, height] of [[1280, 720], [1366, 768], [1440, 900], [1920, 1080]]) {
    await page.setViewport({ width, height })
    await page.goto((process.argv[2] || 'http://127.0.0.1:5174') + '/', { waitUntil: 'networkidle0' })
    for (const [id, stageSelector, property, fraction] of [['services', '.services-stage', '--deck-progress', .8], ['approach', '.approach-stage', '--approach-progress', .82]]) {
      await page.evaluate(({ id, stageSelector, fraction }) => {
        const section = document.getElementById(id), stage = section.querySelector(stageSelector)
        const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top)
        window.scrollTo({ top: start + (section.offsetHeight - stage.offsetHeight) * fraction, behavior: 'instant' })
      }, { id, stageSelector, fraction })
      await new Promise(resolve => setTimeout(resolve, 180))
      const state = await page.evaluate(({ id, property, stageSelector }) => {
        const section = document.getElementById(id), stage = section.querySelector(stageSelector)
        return { progress: Number(section.style.getPropertyValue(property)), nextTop: section.nextElementSibling.getBoundingClientRect().top, stageBottom: stage.getBoundingClientRect().bottom }
      }, { id, property, stageSelector })
      assert.equal(state.progress, 1, `${width}: ${id} must finish opening before the transition`)
      assert.ok(state.nextTop >= height - 2, `${width}: next section overlaps ${id} before its reading interval ends`)
      assert.ok(state.stageBottom <= height + 2, `${width}: ${id} stage extends below viewport`)
    }
    for (const id of ['partnership', 'locations']) {
      await page.evaluate(id => {
        const section = document.getElementById(id)
        window.scrollTo({ top: scrollY + section.getBoundingClientRect().top - parseFloat(getComputedStyle(section).top), behavior: 'instant' })
      }, id)
      await new Promise(resolve => setTimeout(resolve, 150))
      const nextTop = await page.$eval(`#${id}`, el => el.nextElementSibling.getBoundingClientRect().top)
      assert.ok(nextTop >= height + 230, `${width}: ${id} needs a fully visible reading interval before the next panel`)
      const bottom = await page.evaluate(id => {
        const section = document.getElementById(id)
        const top = parseFloat(getComputedStyle(section).top)
        return top + section.offsetHeight
      }, id)
      assert.ok(bottom <= height + 2, `${width}: ${id} sticky content cannot fit`)
    }
    console.log(`PASS ${width}x${height}: decks finish before next section; sticky panels fit`)
  }
  await page.setViewport({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle0' })
  assert.equal(await page.$eval('#services', el => el.style.getPropertyValue('--deck-progress')), '1')
  assert.equal(await page.$eval('#approach', el => el.style.getPropertyValue('--approach-progress')), '1')
  console.log('PASS mobile: cards remain expanded in normal page flow')
  await page.setViewport({ width: 1440, height: 900 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.reload({ waitUntil: 'networkidle0' })
  assert.equal(await page.$eval('#services', el => el.style.getPropertyValue('--deck-progress')), '1')
  assert.equal(await page.$eval('#approach', el => el.style.getPropertyValue('--approach-progress')), '1')
  assert.notEqual(await page.$eval('#partnership', el => getComputedStyle(el).position), 'sticky')
  console.log('PASS reduced motion: no pinned stacking')
  assert.deepEqual(errors, [])
} finally { await browser.close() }
