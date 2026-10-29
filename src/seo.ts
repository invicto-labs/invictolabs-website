import { company } from './data/site'

export const SITE_URL = 'https://invictolabs.com'
export const SHARE_IMAGE = `${SITE_URL}/images/invicto-social.png`
export type PageMetadata = { title: string; description: string }

export function structuredData(path: string, meta: PageMetadata) {
  const url = `${SITE_URL}${path}`
  const organization = { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: company.name, url: SITE_URL, logo: `${SITE_URL}/invicto-logo-360.webp`, email: company.email, telephone: company.phone, sameAs: [company.linkedIn] }
  const page = { '@type': path.startsWith('/blogs/') ? 'Article' : 'WebPage', '@id': `${url}#page`, url, name: meta.title, headline: meta.title.replace(/ \| Invicto.*$/, ''), description: meta.description, inLanguage: 'en-US', image: SHARE_IMAGE, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': organization['@id'] }, ...(path.startsWith('/blogs/') ? { author: { '@id': organization['@id'] }, mainEntityOfPage: url } : {}) }
  const labels: Record<string, string> = { services: 'Services', products: 'Products', blogs: 'Blogs', 'case-studies': 'Workflow Walkthroughs', 'our-company': 'Our Company', location: 'Locations', 'our-approach': 'Our Approach', faq: 'FAQ' }
  const segments = path.split('/').filter(Boolean)
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }, ...segments.map((segment, i) => ({ '@type': 'ListItem', position: i + 2, name: i === segments.length - 1 ? page.headline : labels[segment] ?? segment, item: `${SITE_URL}/${segments.slice(0, i + 1).join('/')}` }))]
  const graph: object[] = [organization, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'Invicto', publisher: { '@id': organization['@id'] } }, page]
  if (segments.length) graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs })
  if (/^\/services\/[^/]+$/.test(path)) graph.push({ '@type': 'Service', name: page.headline, description: meta.description, url, provider: { '@id': organization['@id'] }, areaServed: { '@type': 'Country', name: 'United States' } })
  if (/^\/products\/[^/]+$/.test(path)) graph.push({ '@type': 'SoftwareApplication', name: path.endsWith('traceq') ? 'TraceQ' : path.endsWith('titleflow-ai') ? 'TitleFlow AI' : 'TaxFlow', description: meta.description, url, applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', publisher: { '@id': organization['@id'] } })
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function syncMetadata(path: string, meta: PageMetadata, known: boolean) {
  document.title = meta.title
  const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, key); document.head.append(tag) }
    tag.content = value
  }
  setMeta('name', 'description', meta.description)
  setMeta('name', 'robots', known ? 'index, follow, max-image-preview:large' : 'noindex, follow')
  for (const [key, value] of Object.entries({ title: meta.title, description: meta.description, url: `${SITE_URL}${path}`, image: SHARE_IMAGE, type: path.startsWith('/blogs/') ? 'article' : 'website', site_name: 'Invicto', locale: 'en_US' })) setMeta('property', `og:${key}`, value)
  for (const [key, value] of Object.entries({ card: 'summary_large_image', title: meta.title, description: meta.description, image: SHARE_IMAGE, 'image:alt': 'Invicto — title services and connected technology' })) setMeta('name', `twitter:${key}`, value)
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
  canonical.href = `${SITE_URL}${path}`
  let schema = document.getElementById('site-schema')
  if (!schema) { schema = document.createElement('script'); schema.id = 'site-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.append(schema) }
  schema.textContent = known ? JSON.stringify(structuredData(path, meta)) : '{}'
}
