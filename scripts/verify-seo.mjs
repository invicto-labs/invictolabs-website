import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]))
const titles = new Set()
const descriptions = new Set()
for (const url of urls) {
  assert.equal(url.origin, 'https://invictolabs.com')
  const html = await readFile(join('dist', url.pathname, 'index.html'), 'utf8')
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]
  const description = html.match(/name="description"\s+content="([^"]+)"/)?.[1]
  assert.ok(title && !titles.has(title), `${url.pathname}: missing/duplicate title`)
  assert.ok(description && !descriptions.has(description), `${url.pathname}: missing/duplicate description`)
  titles.add(title); descriptions.add(description)
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `${url.pathname}: exactly one H1`)
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1)
  assert.ok(html.includes(`href="${url.href}"`), `${url.pathname}: canonical`)
  assert.ok(!/content="noindex/.test(html))
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'))
  assert.ok(html.includes('property="og:image" content="https://invictolabs.com/images/invicto-social.png"'))
  const schema = JSON.parse(html.match(/id="site-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1])
  assert.equal(schema['@context'], 'https://schema.org')
  assert.ok(schema['@graph'].some(node => node['@type'] === 'Organization'))
  for (const match of html.matchAll(/<(?:img|video|source)\b[^>]*\bsrc="(\/[^"?#]+)"/g)) await access(join('dist', decodeURI(match[1])))
  for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"?#]*)/g)) {
    const target = match[1]
    await access(join('dist', target, target.includes('.') ? '' : 'index.html'))
  }
  console.log(`PASS SEO ${url.pathname}`)
}
const missing = await readFile('dist/404.html', 'utf8')
assert.match(missing, /content="noindex, follow"/)
assert.match(missing, /404 · Page not found/)
await access('dist/images/invicto-social.png')
const config = JSON.parse(await readFile('vercel.json', 'utf8'))
assert.ok(!config.rewrites.some(rule => rule.destination === '/index.html'), 'Do not serve homepage with HTTP 200 for unknown routes')
console.log(`PASS ${urls.length} pages: metadata, schema, internal links, media and 404 configuration`)
