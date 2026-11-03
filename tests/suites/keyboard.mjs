import { json, settle } from '../helpers/evidence.mjs'

export async function run({ base, routes, engines, engineNames }) {
  const results = [],
    errors = []
  await Promise.all(
    engineNames.map(async (engine) => {
      const browser = await engines[engine].launch()
      try {
        for (const width of [390, 1440]) {
          const context = await browser.newContext({ viewport: { width, height: 900 } })
          const page = await context.newPage()
          for (const route of routes) {
            try {
              await page.goto(base + route)
              await settle(page)
              await page.keyboard.press('Tab')
              const nativeFirstTab = await page.evaluate(() => ({
                tag: document.activeElement.tagName,
                text: document.activeElement.textContent.trim().slice(0, 80),
                href: document.activeElement.getAttribute('href'),
              }))
              // WebKit's observed native Tab policy skips links in this host. Focus
              // explicitly to test the site's handler separately; never label
              // that as a successful native Tab-reachability test.
              await page.locator('.skip-link').focus()
              await page.keyboard.press('Enter')
              let focusError
              try {
                await page.waitForFunction(() => document.activeElement?.tagName === 'MAIN', null, {
                  timeout: 3000,
                })
              } catch (error) {
                focusError = String(error)
              }
              results.push({
                engine,
                width,
                route,
                nativeFirstTab,
                explicitSkipActivation: true,
                mainFocused: await page.evaluate(() => document.activeElement.tagName === 'MAIN'),
                focusError,
              })
            } catch (error) {
              errors.push({ engine, width, route, error: String(error) })
            }
          }
          await context.close()
        }
      } finally {
        await browser.close()
      }
    }),
  )
  await json('keyboard.json', {
    results,
    errors,
    note: 'Native first-Tab behavior and explicitly focused Enter activation are separate observations. Real OS full-keyboard access and assistive technology remain manual checks.',
  })
  return {
    cases: results.length,
    skipActivationFailures: results.filter((row) => !row.mainFocused).length,
    nativeFirstTabSkippedLink: results.filter((row) => row.nativeFirstTab.href === null).length,
    errors: errors.length,
    failures: errors.length + results.filter((row) => !row.mainFocused).length,
  }
}
