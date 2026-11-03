import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
const read = async file => JSON.parse(await readFile(file,'utf8'))
const hash = async file => createHash('sha256').update(await readFile(file)).digest('hex')
const excluded = new Set(['.git','node_modules','dist','.ssr','.npm-cache','.agents','.codex','.aws','build'])
async function walk(dir='') {
  const rows=[]
  for(const entry of await readdir(dir||'.',{withFileTypes:true})) {
    if(entry.isDirectory()&&excluded.has(entry.name))continue
    const file=path.posix.join(dir,entry.name)
    if(entry.isDirectory())rows.push(...await walk(file))
    else if(entry.isFile()&&!file.endsWith('.tsbuildinfo'))rows.push(file)
  }
  return rows
}
const source = await read('qa/backups/phase2/source-inventory.json')
const before = await read('qa/after-phase2/setup/prephase-files.json')
const integrity=[]
for(const row of source) {
  const backup=await hash('qa/backups/phase2/'+row.Path)
  let current=null
  try {current=await hash(row.Path)} catch {}
  integrity.push({Path:row.Path,backupIntact:backup===row.SHA256.toLowerCase(),changed:current!==row.SHA256.toLowerCase(),exists:current!==null})
}
const oldPackage=await read('qa/backups/phase2/package.json'),pkg=await read('package.json')
const oldLock=await read('qa/backups/phase2/package-lock.json'),lock=await read('package-lock.json')
const runtimeChanges=Object.entries(oldLock.packages).filter(([name,p])=>name&&!p.dev&&lock.packages[name]?.version!==p.version).map(([name,p])=>({name,before:p.version,after:lock.packages[name]?.version}))
const oldHost=await read('qa/backups/phase2/vercel.json'),host=await read('vercel.json')
delete oldHost.headers;delete host.headers
const checks={files:integrity,backupFailures:integrity.filter(r=>!r.backupIntact),runtimeDependencyManifestUnchanged:JSON.stringify(oldPackage.dependencies)===JSON.stringify(pkg.dependencies),runtimeVersionChanges:runtimeChanges,lockfileUnchanged:await hash('package-lock.json')===await hash('qa/backups/phase2/package-lock.json'),hostingChangesLimitedToLocalHeaders:JSON.stringify(oldHost)===JSON.stringify(host)}
await writeFile('qa/after-phase2/source-integrity.json',JSON.stringify(checks,null,2)+'\n')
await writeFile('qa/FILES_PHASE2.md','')
await writeFile('qa/after-phase2/file-changes.json','{}\n')
const current=await walk(),currentSet=new Set(current),beforeSet=new Set(before)
const created=current.filter(f=>!beforeSet.has(f)).sort()
const modified=integrity.filter(r=>r.changed&&r.exists).map(r=>r.Path).sort()
const deleted=before.filter(f=>!currentSet.has(f))
const changes={created,modified,deleted,exclusions:[...excluded,'*.tsbuildinfo'],note:'Created paths include all authored files, source backups and retained audit artifacts. Modified source/docs/tooling are compared with the 195-file pre-phase snapshot. Pre-existing baseline artifacts were not rewritten.'}
await writeFile('qa/after-phase2/file-changes.json',JSON.stringify(changes,null,2)+'\n')
await writeFile('qa/FILES_PHASE2.md',`# Phase 2 — exhaustive local file changes\n\nCreated: ${created.length}. Modified: ${modified.length}. Deleted: ${deleted.length}.\n\nNo git commands that modify the repo were run. All changes are local and uncommitted. Existing files were backed up before editing in [backups/phase2/MANIFEST.md](backups/phase2/MANIFEST.md). Hash/dependency/config verification: [after-phase2/source-integrity.json](after-phase2/source-integrity.json). Generated build output, dependency/browser/npm caches and TypeScript caches are excluded. No source deletion, deployment or remote change was performed.\n\n## Modified\n\n${modified.map(f=>'- `'+f+'`').join('\n')}\n\n## Deleted\n\n${deleted.length?deleted.map(f=>'- `'+f+'`').join('\n'):'None.'}\n\n## Created\n\n${created.map(f=>'- `'+f+'`').join('\n')}\n`)
console.log(JSON.stringify({created:created.length,modified:modified.length,deleted,backupFailures:checks.backupFailures,runtimeChanges,lockfileUnchanged:checks.lockfileUnchanged,hostingChangesLimitedToLocalHeaders:checks.hostingChangesLimitedToLocalHeaders}))
if(deleted.length||checks.backupFailures.length||!checks.runtimeDependencyManifestUnchanged||runtimeChanges.length||!checks.lockfileUnchanged||!checks.hostingChangesLimitedToLocalHeaders)process.exitCode=1
