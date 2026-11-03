import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { output, json } from '../helpers/evidence.mjs'
import { command } from '../helpers/command.mjs'
export async function run() {
  const pkg = JSON.parse(await readFile('node_modules/cspell/package.json', 'utf8'))
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.cspell
  const result = await command(process.execPath, [
    path.resolve('node_modules/cspell', bin),
    'lint',
    'src/**/*.{ts,tsx}',
    '--config',
    'tests/cspell.json',
    '--no-progress',
    '--show-context',
  ])
  await writeFile(path.join(output, 'spell.txt'), result.stdout + '\n' + result.stderr)
  await json('spell.json', result)
  return {
    exitCode: result.exitCode,
    failures: result.exitCode === 0 ? 0 : 1,
    note: 'Dictionary findings require human review; identifiers are not automatically copy defects.',
  }
}
