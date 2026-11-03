import { readFile } from 'node:fs/promises'
import { json } from './evidence.mjs'
export async function discoverRoutes(base) {
  const built = await readFile('dist/sitemap.xml', 'utf8')
  const sitemap = [...built.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  const queue = [...new Set(['/', ...sitemap])],
    seen = new Set(),
    edges = [],
    pages = []
  while (queue.length) {
    const route = queue.shift()
    if (seen.has(route)) continue
    seen.add(route)
    const response = await fetch(new URL(route, base))
    const html = await response.text()
    pages.push({ route, status: response.status, htmlBytes: Buffer.byteLength(html) })
    for (const m of html.matchAll(/<a\b([^>]*?)href="([^"]*)"([^>]*)>/gi)) {
      const raw = m[2].replaceAll('&amp;', '&')
      if (!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) continue
      let u
      try {
        u = new URL(raw, base + route)
      } catch {
        continue
      }
      const internal = u.origin === base || u.origin === 'https://invictolabs.com'
      const path = u.pathname.replace(/\/$/, '') || '/'
      edges.push({
        from: route,
        href: raw,
        internal,
        path,
        hash: u.hash,
        target: ((m[1] + m[3]).match(/target="([^"]*)"/) || [])[1],
        rel: ((m[1] + m[3]).match(/rel="([^"]*)"/) || [])[1],
      })
      if (internal && !/\.[a-z0-9]+$/i.test(path) && !seen.has(path) && !queue.includes(path))
        queue.push(path)
    }
    if (seen.size > 100) throw new Error('Route-discovery limit exceeded; inspect link graph')
  }
  const result = {
    sitemap,
    routes: [...seen],
    pages,
    edges,
    orphans: sitemap.filter(
      (route) => route !== '/' && !edges.some((e) => e.internal && e.path === route),
    ),
    ghosts: pages.filter((p) => p.status >= 400),
    external: [...new Set(edges.filter((e) => !e.internal).map((e) => e.href))],
  }
  await json('routes.json', result)
  return result
}
