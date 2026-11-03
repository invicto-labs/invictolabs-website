import { readFile } from 'node:fs/promises'
import { command } from '../helpers/command.mjs'
import { json } from '../helpers/evidence.mjs'
export async function run() {
  const pkg = JSON.parse(await readFile('package.json', 'utf8')),
    rows = []
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'))
  const names = Object.keys(pkg.dependencies)
  for (let start = 0; start < names.length; start += 3) {
    await Promise.all(
      names.slice(start, start + 3).map(async (name) => {
        const result = await command(process.execPath, [
          process.env.npm_execpath,
          'view',
          name,
          'version',
          'deprecated',
          'time.modified',
          'license',
          'repository',
          '--json',
          '--cache',
          '.npm-cache',
        ])
        let registry
        try {
          registry = JSON.parse(result.stdout)
        } catch {
          registry = { error: result.stderr || result.stdout }
        }
        rows.push({
          package: name,
          installed: lock.packages['node_modules/' + name]?.version,
          registry,
          exitCode: result.exitCode,
        })
      }),
    )
  }
  const deprecatedInstalled = Object.entries(lock.packages)
    .filter(([, p]) => p.deprecated)
    .map(([name, p]) => ({
      package: name,
      version: p.version,
      dev: Boolean(p.dev),
      deprecated: p.deprecated,
    }))
  await json('maintenance.json', {
    rows,
    deprecatedInstalled,
    note: 'Registry latest/modified/deprecation metadata is a maintenance signal, not proof of future support, security or abandonment. Installed licenses are inventoried separately from latest registry metadata.',
  })
  return {
    runtimePackages: rows.length,
    registryErrors: rows.filter((r) => r.exitCode).length,
    installedDeprecations: deprecatedInstalled.length,
    failures: rows.some((r) => r.exitCode) ? 1 : 0,
  }
}
