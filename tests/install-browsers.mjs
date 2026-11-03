import path from 'node:path'
import { spawn } from 'node:child_process'
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve('node_modules/.cache/ms-playwright')
const child = spawn(
  process.execPath,
  [
    path.resolve('node_modules/@playwright/test/cli.js'),
    'install',
    'chromium',
    'firefox',
    'webkit',
  ],
  { stdio: 'inherit', windowsHide: true, env: process.env },
)
child.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
child.on('close', (code) => {
  process.exitCode = code ?? 1
})
