import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
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
import './styles.css'
import './refinements.css'
import './site-polish.css'
import { syncMetadata } from './seo'
export { structuredData, SITE_URL, SITE_NAME, SHARE_IMAGE } from './seo'

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
  if (path !== normalized) return <Navigate replace to={path + location.search} state={{ ...location.state, scrollTarget: hash.slice(1) }} />
  // Keep the same route mounted when opening an anchor on a prerendered page.
  const scrollTarget = location.hash ? hash.slice(1) : location.state?.scrollTarget ?? ''
  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading Invicto…</div>}><RouteScrollManager behavior="auto" locationKey={location.key} target={scrollTarget}>
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
  const app = <StrictMode><BrowserRouter><SiteRoutes /><Analytics /><SpeedInsights /></BrowserRouter></StrictMode>
  if (root.hasChildNodes()) hydrateRoot(root, app)
  else createRoot(root).render(app)
}
