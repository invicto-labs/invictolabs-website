import { ESLint } from 'eslint'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { json, output } from '../helpers/evidence.mjs'
import { command } from '../helpers/command.mjs'
export async function run() {
  const eslint = new ESLint({ overrideConfigFile: 'tests/eslint.config.mjs' })
  const results = await eslint.lintFiles(['src/**/*.{ts,tsx}'])
  const format = await eslint.loadFormatter('json')
  await writeFile(path.join(output, 'eslint.json'), await format.format(results))
  const pkg = JSON.parse(await readFile('node_modules/prettier/package.json', 'utf8'))
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.prettier
  const prettier = await command(process.execPath, [
    path.resolve('node_modules/prettier', bin),
    '--check',
    'src/**/*.{ts,tsx,css}',
  ])
  await json('prettier.json', prettier)
  return {
    eslintErrors: results.reduce((n, r) => n + r.errorCount, 0),
    eslintWarnings: results.reduce((n, r) => n + r.warningCount, 0),
    prettierExitCode: prettier.exitCode,
    failures: results.some((r) => r.errorCount) || prettier.exitCode ? 1 : 0,
  }
}
