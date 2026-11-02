import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]))
assert.ok(urls.length > 0, 'Sitemap must contain canonical pages')
assert.equal(new Set(urls.map(url => url.href)).size, urls.length, 'Duplicate sitemap entries')
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
  const organization = schema['@graph'].find(node => node['@type'] === 'Organization')
  const website = schema['@graph'].find(node => node['@type'] === 'WebSite')
  assert.equal(organization?.name, 'Invicto Labs', `${url.pathname}: organization identity`)
  assert.equal(website?.name, 'Invicto Labs', `${url.pathname}: site name`)
  assert.equal(website.url, 'https://invictolabs.com/')
  assert.ok(website.alternateName.includes('Invicto'))
  assert.ok(website.alternateName.includes('invictolabs.com'))
  assert.ok(html.includes('property="og:site_name" content="Invicto Labs"'))
  if (url.pathname === '/') {
    assert.match(title, /^Invicto Labs \|/)
    assert.match(html, /<p class="hero-lede">Invicto Labs/)
  }
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
const paths = new Set(urls.map(url => url.pathname))
for (const rule of config.redirects.filter(rule => !rule.source.includes(':'))) {
  assert.equal(rule.permanent, true, `${rule.source}: migration redirects must be permanent`)
  const target = new URL(rule.destination, 'https://invictolabs.com')
  assert.ok(paths.has(target.pathname), `${rule.source}: redirect target must be a canonical page`)
  if (target.hash) {
    const html = await readFile(join('dist', target.pathname, 'index.html'), 'utf8')
    assert.ok(html.includes(`id="${target.hash.slice(1)}"`), `${rule.source}: missing target section`)
  }
}
for (const source of ['/Origination.html', '/contact-us.html', '/Web-and-Mobile-Applications.html', '/AI-and-ML.html', '/Attorney-Services.html', '/title-production-simplified']) {
  assert.ok(config.redirects.some(rule => rule.source === source), `${source}: indexed legacy URL needs a redirect`)
}
const robots = await readFile('dist/robots.txt', 'utf8')
assert.match(robots, /User-agent: \*\s+Allow: \/\s+Sitemap: https:\/\/invictolabs\.com\/sitemap\.xml/)
console.log(`PASS ${urls.length} pages: metadata, schema, internal links, media and 404 configuration`)
