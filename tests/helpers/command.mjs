import { spawn } from 'node:child_process'
export function command(executable, args, options = {}) {
  return new Promise((resolve) => {
    const process = spawn(executable, args, { windowsHide: true, ...options })
    let stdout = '',
      stderr = ''
    process.stdout?.on('data', (d) => (stdout += d))
    process.stderr?.on('data', (d) => (stderr += d))
    process.on('error', (error) => resolve({ exitCode: -1, stdout, stderr, error: String(error) }))
    process.on('close', (exitCode) => resolve({ exitCode, stdout, stderr }))
  })
}
