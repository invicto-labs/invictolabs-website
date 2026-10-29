import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const base = process.argv[2] || 'http://127.0.0.1:4173'
const sitemap = await readFile('public/sitemap.xml', 'utf8')
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname)
for (const route of routes) {
  const response = await fetch(new URL(route, base))
  assert.equal(response.status, 200, `${route}: HTTP status`)
  const html = await response.text()
  assert.ok(html.includes('<h1'), `${route}: rendered page heading`)
  assert.ok(html.includes(`href="https://invictolabs.com${route}"`), `${route}: absolute canonical`)
  assert.ok(!html.includes('<div id="root"></div>'), `${route}: pre-rendered content`)
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) {
    const asset = await fetch(new URL(match[1], base), { method: 'HEAD' })
    assert.equal(asset.status, 200, `${route}: missing ${match[1]}`)
  }
  console.log(`PASS ${route}: HTML, canonical and bundles`)
}
assert.match(await (await fetch(`${base}/robots.txt`)).text(), /^User-agent:/)
assert.match(await (await fetch(`${base}/llms.txt`)).text(), /^# Invicto/)
assert.equal((await fetch(`${base}/.well-known/ai-catalog.json`)).status, 404)
console.log('PASS discovery resources and absent optional catalog')
