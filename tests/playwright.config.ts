import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve('node_modules/.cache/ms-playwright')
const output = path.resolve(process.env.QA_OUTPUT || 'qa/after-phase2')
const port = Number(process.env.QA_PORT || 4188)
const profiles = ['iPhone 13', 'Pixel 7', 'iPad (gen 7)'] as const
export default defineConfig({
  // Windows software-rendered engines and trace teardown compete for resources.
  // Keep behavior assertions strict; budget setup/actions/artifact teardown separately.
  testDir: '.', testMatch: 'menu.spec.ts', timeout: 90000, workers: 1,
  outputDir: `${output}/playwright-artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/playwright-menu.json` }]],
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: (['chromium','firefox','webkit'] as const).flatMap(browserName=>profiles.map(device=>({
    name: `${browserName}-${device}`, use: {...devices[device],browserName,...browserName==='firefox'?{isMobile:false}:{}}
  }))),
  webServer: { command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`, url: `http://127.0.0.1:${port}`, reuseExistingServer: false, timeout:30000 },
})
