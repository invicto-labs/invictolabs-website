import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
const HomePage = lazy(() => import('./App'))
const OperationsPage = lazy(() => import('./OperationsPage'))
const ServiceDetailPage = lazy(() => import('./ServiceDetailPage'))
import { routeMetadata } from './data/routeMetadata'
export { routeMetadata } from './data/routeMetadata'
const AboutPage = lazy(() => import('./AboutPage'))
const FaqPage = lazy(() => import('./FaqPage'))
const PrivacyPage = lazy(() => import('./PrivacyPage'))
const InsightsPage = lazy(() => import('./InsightsPage'))
import NotFoundPage from './NotFoundPage'
const ProductsPage = lazy(() => import('./ProductsPage'))
const TraceQPage = lazy(() => import('./ProductsPage').then(module => ({ default: module.TraceQPage })))
const TitleFlowPage = lazy(() => import('./ProductsPage').then(module => ({ default: module.TitleFlowPage })))
const TaxFlowPage = lazy(() => import('./ProductsPage').then(module => ({ default: module.TaxFlowPage })))
import { RouteScrollManager } from './components/RouteScrollManager'
import { homeTargets } from './data/homeNavigation'
import './styles.css'
import './refinements.css'
import './site-polish.css'
import './accessibility.css'
import { syncMetadata } from './seo'
export { structuredData, SITE_URL, SHARE_IMAGE } from './seo'

const cleanRouteAliases: Record<string, string> = {
  '/locations': '/location',
  '/approach': '/our-approach',
  '/': '/',
  '/index.html': '/',
  '/home': '/',
  '/homepage': '/',
  '/home/index.html': '/',
  '/homepage/index.html': '/',
  '/about.html': '/our-company',
  '/company': '/our-company',
  '/ourcompany': '/our-company',
  '/company/index.html': '/our-company',
  '/ourcompany/index.html': '/our-company',
  '/our-company/index.html': '/our-company',
  '/faq.html': '/faq',
  '/faq/index.html': '/faq',
  '/product': '/products',
  '/product/index.html': '/products',
  '/products/index.html': '/products',
}



export function SiteRoutes() {
  const location = useLocation()
  const normalized = location.pathname.replace(/\/+$/, '').toLowerCase() || '/'
  let path = cleanRouteAliases[normalized] ?? normalized
  let hash = location.hash === '#top' ? '' : location.hash
  const sectionRoutes: Record<string, string> = { '#services': '/services', '#locations': '/location', '#approach': '/our-approach' }
  if (path === '/' && sectionRoutes[hash]) {
    path = sectionRoutes[hash]
    hash = ''
  }
  const legacyProducts: Record<string, string> = { '#traceq': 'traceq', '#ai-quality': 'titleflow-ai', '#tax-flow': 'tax-flow' }
  if (path === '/products' && legacyProducts[hash]) {
    path = '/products/' + legacyProducts[hash]
    hash = ''
  }
  useEffect(() => {
    const metadata = routeMetadata[path] ?? { title: 'Page not found | Invicto', description: 'Explore Invicto services and products.' }
    syncMetadata(path, metadata, Boolean(routeMetadata[path]))
  }, [path])
  if (path !== location.pathname) return <Navigate replace to={path + location.search} state={{ ...location.state, scrollTarget: hash.slice(1) }} />
  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading Invicto…</div>}><RouteScrollManager behavior="auto" locationKey={location.key} target={hash ? hash.slice(1) : location.state?.scrollTarget ?? ''}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<OperationsPage key="services" kind="services" />} />
        {Object.keys(routeMetadata).filter(route => route.startsWith('/services/')).map(route => <Route key={route} path={route} element={<ServiceDetailPage key={route} slug={route.split('/').pop()!} />} />)}
        <Route path="/location" element={<OperationsPage key="location" kind="location" />} />
        <Route path="/our-approach" element={<OperationsPage key="our-approach" kind="our-approach" />} />
        <Route path="/our-company" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/blogs" element={<InsightsPage key="blogs" kind="blogs" />} />
        <Route path="/case-studies" element={<InsightsPage key="case-studies" kind="case-studies" />} />
        <Route path="/blogs/:slug" element={<InsightsPage key={location.pathname} kind="blogs" />} />
        <Route path="/case-studies/:slug" element={<InsightsPage key={location.pathname} kind="case-studies" />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/traceq" element={<TraceQPage />} />
        <Route path="/products/titleflow-ai" element={<TitleFlowPage />} />
        <Route path="/products/tax-flow" element={<TaxFlowPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RouteScrollManager></Suspense>
  )
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('root')!
  // A redirect as the first hydrated tree leaves the streamed SSR tree orphaned.
  // Normalize entry fragments before React starts, retaining router state/query.
  const originalPath = window.location.pathname
  const normalized = originalPath.replace(/\/+$/, '').toLowerCase() || '/'
  let entryPath = cleanRouteAliases[normalized] ?? normalized
  let target = window.location.hash === '#top' ? '' : window.location.hash.slice(1)
  const sections: Record<string, string> = { services: '/services', locations: '/location', approach: '/our-approach' }
  const products: Record<string, string> = { traceq: 'traceq', 'ai-quality': 'titleflow-ai', 'tax-flow': 'tax-flow' }
  if (entryPath === '/' && sections[target]) { entryPath = sections[target]; target = '' }
  if (entryPath === '/products' && products[target]) { entryPath += '/' + products[target]; target = '' }
  const keepHomeAnchor = entryPath === '/' && Object.values(homeTargets).some(item => item.anchor === target)
  if (entryPath !== originalPath || (window.location.hash && !keepHomeAnchor)) {
    const previous = window.history.state ?? {}
    window.history.replaceState({ ...previous, usr: { ...previous.usr, scrollTarget: target } }, '', entryPath + window.location.search + (keepHomeAnchor ? `#${target}` : ''))
  }
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const serverPath = canonical ? new URL(canonical.href).pathname.replace(/\/+$/, '') || '/' : originalPath
  const canHydrate = serverPath === entryPath
  const app = <StrictMode><BrowserRouter><SiteRoutes /></BrowserRouter></StrictMode>
  const start = () => {
    if (root.hasChildNodes() && canHydrate) hydrateRoot(root, app)
    else createRoot(root).render(app)
  }
  // Attach handlers immediately; background tabs may suspend animation frames.
  start()
}
