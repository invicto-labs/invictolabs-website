import { readdir,readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
export async function candidateFingerprint() {
  const files=['index.html','package.json','package-lock.json','vite.config.ts','vercel.json']
  async function walk(dir) {
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const file=path.posix.join(dir,entry.name)
      if(entry.isDirectory())await walk(file)
      else if(entry.isFile()&&!file.endsWith('.tsbuildinfo'))files.push(file)
    }
  }
  for(const dir of ['src','public','scripts','dist'])await walk(dir)
  const digest=createHash('sha256')
  for(const file of files.sort())digest.update(file+'\0'+createHash('sha256').update(await readFile(file)).digest('hex')+'\n')
  return {sha256:digest.digest('hex'),files:files.length,note:'Product source, assets, build inputs, dependency lock and served build; test harness and QA documents excluded.'}
}
