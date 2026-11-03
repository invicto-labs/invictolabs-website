import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const base = process.argv.slice(2).find(argument => !argument.startsWith('--')) || 'http://127.0.0.1:4173'
const checkRedirects = process.argv.includes('--redirects')
const sitemapResponse = await fetch(new URL('/sitemap.xml', base))
assert.equal(sitemapResponse.status, 200, 'Sitemap: HTTP status')
const sitemap = await sitemapResponse.text()
assert.match(sitemap, /<urlset\b/, 'Sitemap must be XML, not an app fallback')
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname)
assert.ok(routes.length > 0, 'Sitemap must list pages')
const checkedAssets = new Set()
for (const route of routes) {
  const response = await fetch(new URL(route, base))
  assert.equal(response.status, 200, `${route}: HTTP status`)
  const html = await response.text()
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') ?? ''), `${route}: indexing blocked by HTTP header`)
  assert.ok(!/<meta\b[^>]*content="[^"]*noindex/i.test(html), `${route}: indexing blocked by metadata`)
  assert.ok(html.includes('<h1'), `${route}: rendered page heading`)
  assert.ok(html.includes(`href="https://invictolabs.com${route}"`), `${route}: absolute canonical`)
  assert.ok(!html.includes('<div id="root"></div>'), `${route}: pre-rendered content`)
  const schema = JSON.parse(html.match(/id="site-schema" type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? '{}')
  assert.ok(schema['@graph']?.some(node => node['@type'] === 'WebSite' && node.name === 'Invicto Labs'), `${route}: branded site schema`)
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) {
    if (checkedAssets.has(match[1])) continue
    const asset = await fetch(new URL(match[1], base), { method: 'HEAD' })
    assert.equal(asset.status, 200, `${route}: missing ${match[1]}`)
    checkedAssets.add(match[1])
  }
  console.log(`PASS ${route}: HTML, canonical and bundles`)
}
assert.match(await (await fetch(`${base}/robots.txt`)).text(), /^User-agent:/)
assert.match(await (await fetch(`${base}/llms.txt`)).text(), /^# Invicto/)
assert.equal((await fetch(`${base}/.well-known/ai-catalog.json`)).status, 404)
const missing = await fetch(new URL('/__seo_missing_page_check__', base))
assert.equal(missing.status, 404, 'Unknown pages must return HTTP 404')
assert.match(await missing.text(), /content="noindex, follow"/, 'Missing pages must be noindex')
if (checkRedirects) {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'))
  for (const rule of config.redirects.filter(rule => !rule.source.includes(':'))) {
    const response = await fetch(new URL(rule.source, base), { redirect: 'manual' })
    assert.ok([301, 308].includes(response.status), `${rule.source}: expected permanent redirect, got ${response.status}`)
    assert.ok(response.headers.get('location'), `${rule.source}: missing redirect destination`)
    assert.equal(new URL(response.headers.get('location'), base).href, new URL(rule.destination, base).href, `${rule.source}: redirect destination`)
    console.log(`PASS redirect ${rule.source} → ${rule.destination}`)
  }
}
console.log('PASS discovery resources and absent optional catalog')
