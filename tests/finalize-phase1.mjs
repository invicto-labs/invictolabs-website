import { readFile, writeFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = process.cwd()
const readJSON = async (file) => JSON.parse(await readFile(file, 'utf8'))
const hash = async (file) =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex')
    .toUpperCase()
const source = await readJSON('qa/phase0/source-inventory.json')
const before = await readJSON('qa/baseline/setup/prephase-files.json')
const allowed = [
  'AGENTS.md',
  'CONTENT_TODO.md',
  'package.json',
  'package-lock.json',
  'tests/README.md',
  'qa/README.md',
]
const generated = new Set([
  '.git',
  'node_modules',
  'dist',
  '.ssr',
  '.npm-cache',
  '.agents',
  '.codex',
  '.aws',
])
async function walk(directory = '') {
  const rows = []
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (entry.isDirectory() && generated.has(entry.name)) continue
    const relative = path.posix.join(directory, entry.name)
    if (entry.isDirectory()) rows.push(...(await walk(relative)))
    else if (entry.isFile() && !relative.endsWith('.tsbuildinfo')) rows.push({ Path: relative })
  }
  return rows
}
const originalResults = []
for (const row of source) {
  let currentHash = null,
    backupHash = null
  try {
    currentHash = await hash(row.Path)
  } catch {}
  try {
    backupHash = await hash('qa/backups/phase0/' + row.Path)
  } catch {}
  originalResults.push({
    Path: row.Path,
    unchanged: currentHash === row.SHA256,
    allowedToolingFile: ['package.json', 'package-lock.json'].includes(row.Path),
    phase0BackupIntact: backupHash === row.SHA256,
  })
}
const backupResults = []
for (const file of allowed) {
  const original = before.find((row) => row.Path === file)
  backupResults.push({
    Path: file,
    intact: original && (await hash('qa/backups/phase1/' + file)) === original.SHA256,
  })
}
const oldLock = await readJSON('qa/backups/phase1/package-lock.json')
const newLock = await readJSON('package-lock.json')
const oldPackage = await readJSON('qa/backups/phase1/package.json')
const newPackage = await readJSON('package.json')
const runtimeChanges = Object.entries(oldLock.packages)
  .filter(([name, value]) => name && !value.dev)
  .filter(([name, value]) => newLock.packages[name]?.version !== value.version)
  .map(([name, value]) => ({ name, before: value.version, after: newLock.packages[name]?.version }))
const integrity = {
  originalResults,
  backupResults,
  runtimeDependencyManifestUnchanged:
    JSON.stringify(oldPackage.dependencies) === JSON.stringify(newPackage.dependencies),
  runtimeVersionChanges: runtimeChanges,
  unexpectedProductChanges: originalResults.filter(
    (row) => !row.unchanged && !row.allowedToolingFile,
  ),
  originalBackupFailures: originalResults.filter((row) => !row.phase0BackupIntact),
}
await writeFile(
  'qa/baseline/setup/source-integrity.json',
  JSON.stringify(integrity, null, 2) + '\n',
)
// Seed the two self-referencing inventory paths before enumeration.
await writeFile('qa/FILES_PHASE1.md', '')
await writeFile('qa/baseline/setup/file-changes.json', '{}\n')
const current = await walk()
const byPath = new Map(current.map((row) => [row.Path, row]))
const previous = new Map(before.map((row) => [row.Path, row]))
const created = current
  .filter((row) => !previous.has(row.Path))
  .sort((a, b) => a.Path.localeCompare(b.Path))
const modified = [],
  deleted = []
for (const row of before) {
  if (!byPath.has(row.Path)) deleted.push(row.Path)
  else if ((await hash(row.Path)) !== row.SHA256) modified.push(row.Path)
}
const unexpectedChanges = modified.filter((file) => !allowed.includes(file))
const changes = {
  created,
  modified,
  deleted,
  unexpectedChanges,
  exclusions: [...generated, '*.tsbuildinfo'],
  note: 'Dependency/browser caches and regenerated build output are excluded; no source files were deleted. All authored files, backups, screenshots, traces, videos, reports and logs are individually listed.',
}
await writeFile('qa/baseline/setup/file-changes.json', JSON.stringify(changes, null, 2) + '\n')
let report =
  '# Phase 1 — exhaustive local file changes\n\nCompared with the pre-phase inventory in `baseline/setup/prephase-files.json`. No git commands that modify the repo were run. All changes are local and uncommitted.\n\n'
report += `Created: ${created.length}. Modified: ${modified.length}. Deleted: ${deleted.length}. Unexpected existing-file changes: ${unexpectedChanges.length}.\n\n`
report +=
  'Existing-file backups: `backups/phase1/MANIFEST.md`. Product-source and backup hash verification: `baseline/setup/source-integrity.json`. Generated `node_modules/` (including browsers), `dist/`, `.ssr/`, npm caches and TypeScript caches are excluded. No source deletions or hosting/CI changes were made.\n\n'
report +=
  '## Modified\n\n' +
  modified.map((file) => ' - `' + file + '`').join('\n') +
  '\n\n## Deleted\n\n' +
  (deleted.length ? deleted.map((file) => ' - `' + file + '`').join('\n') : 'None.') +
  '\n\n## Created\n\n'
report += created.map((row) => ' - `' + row.Path + '`').join('\n') + '\n'
await writeFile('qa/FILES_PHASE1.md', report)
console.log(
  JSON.stringify({
    created: created.length,
    modified,
    deleted,
    unexpectedChanges,
    originalProductFilesUnchanged: originalResults.filter((row) => row.unchanged).length,
    originalBackupFailures: integrity.originalBackupFailures.length,
    phase1BackupFailures: backupResults.filter((row) => !row.intact).length,
    runtimeVersionChanges: runtimeChanges,
  }),
)
if (
  deleted.length ||
  unexpectedChanges.length ||
  integrity.unexpectedProductChanges.length ||
  integrity.originalBackupFailures.length ||
  backupResults.some((row) => !row.intact) ||
  runtimeChanges.length ||
  !integrity.runtimeDependencyManifestUnchanged
)
  process.exitCode = 1
