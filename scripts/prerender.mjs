import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import React from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { PurgeCSS } from 'purgecss'
import { SiteRoutes, routeMetadata, structuredData, SITE_URL, SHARE_IMAGE } from '../.ssr/main.js'

const template = await readFile('dist/index.html', 'utf8')
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
const escape = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
const entryFor = route => route === '/privacy-policy' ? 'src/PrivacyPage.tsx' : /^\/(blogs|case-studies)(\/|$)/.test(route) ? 'src/InsightsPage.tsx' : route.startsWith('/products') ? 'src/ProductsPage.tsx' : route.startsWith('/services/') ? 'src/ServiceDetailPage.tsx' : route === '/our-company' ? 'src/AboutPage.tsx' : route === '/faq' ? 'src/FaqPage.tsx' : route === '/' ? 'src/App.tsx' : 'src/OperationsPage.tsx'
function manifestKey(key) {
  if (manifest[key]) return key
  // Rollup may promote a dynamic entry into a shared named chunk.
  const name = key.split('/').pop().replace(/\.[^.]+$/, '')
  return Object.keys(manifest).find(candidate => manifest[candidate].isDynamicEntry && manifest[candidate].name === name) ?? key
}
function resources(key, seen = new Set()) {
  key = manifestKey(key)
  if (seen.has(key) || !manifest[key]) return []
  seen.add(key)
  const asset = manifest[key]
  return [ ...asset.css ?? [], ...(asset.imports ?? []).flatMap(child => resources(child, seen)) ]
}
function modules(key, seen = new Set()) {
  key = manifestKey(key)
  if (seen.has(key) || !manifest[key]) return []
  seen.add(key)
  return [manifest[key].file, ...(manifest[key].imports ?? []).flatMap(child => modules(child, seen))]
}
async function render(route) {
  // Finish Suspense before emitting static HTML. Streaming reveal scripts are
  // unnecessary in a prerendered site and would need separate CSP allowances.
  const tree = React.createElement(React.StrictMode, null,
    React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(SiteRoutes)))
  const { prelude } = await prerenderToNodeStream(tree)
  // Drain the async render to resolve nested lazy modules, then serialize the
  // resolved tree without streaming reveal scripts or hidden fallback copies.
  for await (const chunk of prelude) void chunk
  const html = renderToString(tree)
  if (html.includes('<!--$!-->') || html.includes('<script>')) throw new Error(`Incomplete static render: ${route}`)
  return html
}
for (const [route, meta] of Object.entries({ ...routeMetadata, '/404': { title: 'Page not found | Invicto', description: 'This page could not be found. Explore Invicto title services, mortgage operations, and products.' } })) {
  const content = await render(route)
  // Include selected lazy content's CSS in SSR so no-JS and first paint retain
  // the same presentation, without preloading other products' JavaScript.
  const selected = route === '/products/traceq' ? ['src/components/TraceQGallery.tsx'] : route === '/products/titleflow-ai' ? ['src/components/ProductInsights.tsx','src/components/TitleFlowConcept.tsx'] : route === '/products/tax-flow' ? ['src/components/TaxFlowExperience.tsx','src/components/TaxCertificateHero.tsx'] : []
  const styles = [...new Set([entryFor(route), ...selected].flatMap(key => resources(key)))].filter(file => !template.includes(file)).map(file => `<link rel="stylesheet" href="/${file}">`).join('')
  const preload = modules(entryFor(route)).filter(file => !template.includes(file)).map(file => `<link rel="modulepreload" href="/${file}">`).join('')
  let html = template.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    .replace(/<title>.*?<\/title>/s, `<title>${escape(meta.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*"/s, `$1${escape(meta.description)}"`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*"/s, `$1${escape(meta.title)}"`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/s, `$1${escape(meta.description)}"`)
    .replace('href="https://invictolabs.com/"', `href="https://invictolabs.com${route}"`)
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${route === '/404' ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">`)
    .replace('</head>', `${styles}${preload}
      <meta property="og:url" content="${SITE_URL}${route}">
      <meta property="og:site_name" content="Invicto">
      <meta property="og:locale" content="en_US">
      <meta property="og:image" content="${SHARE_IMAGE}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:alt" content="Invicto — title services and connected technology">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${escape(meta.title)}">
      <meta name="twitter:description" content="${escape(meta.description)}">
      <meta name="twitter:image" content="${SHARE_IMAGE}">
      <meta name="twitter:image:alt" content="Invicto — title services and connected technology">
      <script id="site-schema" type="application/ld+json">${JSON.stringify(route === '/404' ? {} : structuredData(route, meta)).replace(/</g, '\\u003c')}</script>
    </head>`)
    .replace('property="og:type" content="website"', `property="og:type" content="${route.startsWith('/blogs/') ? 'article' : 'website'}"`)
  // Inline only selectors used by this page. Keep full styles available for
  // interactive states and subsequent client-side routes; do not remove them.
  const stylesheetPattern = /<link\b[^>]*rel="stylesheet"[^>]*>/g
  const links = [...html.matchAll(stylesheetPattern)].map(match => match[0])
  const css = await Promise.all(links.map(async link => {
    const path = link.match(/href="\/?([^"]+)"/)[1]
    return { raw: await readFile(join('dist', path), 'utf8') }
  }))
  const critical = await new PurgeCSS().purge({ content: [{ raw: content, extension: 'html' }], css, safelist: ['html', 'body', ':root', 'header-menu--open', 'mobile-menu-layer', 'mobile-menu-sheet', 'mobile-menu-top', 'mobile-menu-close', 'mobile-menu-scroll', 'inquiry-draft'], keyframes: false, fontFace: false })
  html = html.replace(stylesheetPattern, link => `${link.replace('rel="stylesheet"', 'rel="stylesheet" media="print" onload="this.media=\'all\'"')}<noscript>${link}</noscript>`)
    .replace('</head>', `<style data-critical>${critical.map(result => result.css).join('\n')}</style></head>`)
  const file = route === '/' ? 'dist/index.html' : route === '/404' ? 'dist/404.html' : join('dist', route.slice(1), 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
  console.log(`Pre-rendered ${route}`)
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(routeMetadata).map(route => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n')}\n</urlset>\n`)
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`)
await writeFile('dist/llms.txt', `# Invicto\n\n> Title, mortgage, tax and property operations support, with TraceQ, TitleFlow AI, and TaxFlow.\n\nCanonical website: ${SITE_URL}\n\n## Pages\n${Object.entries(routeMetadata).map(([route, meta]) => `- [${meta.title}](${SITE_URL}${route}): ${meta.description}`).join('\n')}\n\n## Contact and scope\nEmail marketing@invictolabs.com for service scope, demonstrations and supported county coverage. Inquiry forms prepare an email draft; they do not send a message automatically. Workflow walkthroughs are illustrative. Sample product records do not represent client outcomes.\n`)
