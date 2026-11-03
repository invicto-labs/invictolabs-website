import { json } from '../helpers/evidence.mjs'
export async function run({ base, inventory }) {
  const pages = []
  for (const route of inventory.routes) {
    const response = await fetch(base + route)
    const html = await response.text()
    const meta = Object.fromEntries(
      [...html.matchAll(/<meta\b[^>]*(?:name|property)="([^"]+)"[^>]*content="([^"]*)"/g)].map(
        (m) => [m[1], m[2]],
      ),
    )
    const schemas = [
      ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs),
    ].map((m) => {
      try {
        return { validJSON: true, data: JSON.parse(m[1]) }
      } catch (e) {
        return { validJSON: false, error: String(e) }
      }
    })
    const types = schemas.flatMap((s) => s.data?.['@graph']?.map((n) => n['@type']) || [])
    const headings = [...html.matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/gs)].map((m) => ({
      level: Number(m[1]),
      text: m[2].replace(/<[^>]*>/g, '').replace(/<!--.*?-->/g, ''),
    }))
    pages.push({
      route,
      status: response.status,
      title: html.match(/<title>(.*?)<\/title>/s)?.[1],
      meta,
      canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
      headings,
      schemas,
      types,
      missingImageAlt: [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !m[0].includes('alt='))
        .length,
      sourceMapURLs: [...html.matchAll(/sourceMappingURL=([^\s]+)/g)].map((m) => m[1]),
    })
  }
  const duplicates = (field) =>
    pages
      .filter((p) => pages.some((q) => q.route !== p.route && field(q) === field(p)))
      .map((p) => p.route)
  const variants = []
  for (const route of [
    '/services/',
    '/SERVICES',
    '/services?qa=1',
    '/services#contact',
    '/privacy-policy',
    '/privacy-policy/',
    '/blogs/not-a-real-post',
    '/not-a-page',
    '/404.html',
    '/home',
    '/locations',
    '/approach',
  ]) {
    const response = await fetch(base + route, { redirect: 'manual' })
    const html = await response.text()
    variants.push({
      route,
      status: response.status,
      location: response.headers.get('location'),
      title: html.match(/<title>(.*?)<\/title>/s)?.[1],
      canonical: html.match(/rel="canonical"[^>]*href="([^"]*)"/)?.[1],
      robots: html.match(/name="robots"[^>]*content="([^"]*)"/)?.[1],
    })
  }
  await json('seo.json', {
    pages,
    duplicateTitles: duplicates((p) => p.title),
    duplicateDescriptions: duplicates((p) => p.meta.description),
    sharedSocialImage: pages.map((p) => ({ route: p.route, image: p.meta['og:image'] })),
    variants,
    sitemap: await (await fetch(base + '/sitemap.xml')).text(),
    robots: await (await fetch(base + '/robots.txt')).text(),
    validationScope:
      'JSON syntax and local graph presence/reference checks; no claim of Google rich-results eligibility or externally validated Schema.org conformance.',
  })
  return {
    pages: pages.length,
    duplicateTitles: duplicates((p) => p.title).length,
    missingTitles: pages.filter((p) => !p.title).length,
    missingDescriptions: pages.filter((p) => !p.meta.description).length,
    invalidSchemaJSON: pages.filter((p) => p.schemas.some((s) => !s.validJSON)).length,
    failures: pages.filter((p) => p.status >= 400).length,
  }
}
