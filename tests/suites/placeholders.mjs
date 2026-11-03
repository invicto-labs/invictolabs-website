import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { json } from '../helpers/evidence.mjs'
export async function run({ inventory }) {
  const matches = []
  for (const route of inventory.sitemap) {
    const file = route === '/' ? 'dist/index.html' : path.join('dist', route.slice(1), 'index.html')
    const html = await readFile(file, 'utf8')
    for (const m of html.matchAll(/\[TBD[^\]]*\]/g))
      matches.push({ route, file, offset: m.index, text: m[0] })
  }
  const strict = process.env.QA_STRICT_PLACEHOLDERS === '1'
  await json('placeholders.json', { strict, matches })
  return { placeholders: matches.length, strict, failures: strict && matches.length ? 1 : 0 }
}
