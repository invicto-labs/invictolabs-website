import path from 'node:path'
import { defineConfig } from '@playwright/test'

process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve('node_modules/.cache/ms-playwright')
const output = path.resolve(process.env.QA_OUTPUT || 'qa/after-phase2-nav')
const port = Number(process.env.QA_PORT || 4188)

export default defineConfig({
  testDir: '.',
  testMatch: 'nav-scrollspy.spec.ts',
  timeout: 90_000,
  workers: 1,
  outputDir: `${output}/test-artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/playwright-nav.json` }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: { mode: 'retain-on-failure', screenshots: true, snapshots: false },
    screenshot: 'only-on-failure',
  },
  projects: (['chromium', 'firefox', 'webkit'] as const).map(browserName => ({ name: browserName, use: { browserName } })),
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
