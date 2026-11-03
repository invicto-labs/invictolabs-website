import { SiteLink } from './SiteLink'
import { lazy, Suspense } from 'react'
import './product-insights.css'
const TaxCertificateHero = lazy(() => import('./TaxCertificateHero').then(module => ({ default: module.TaxCertificateHero })))
const TitleFlowConcept = lazy(() => import('./TitleFlowConcept').then(module => ({ default: module.TitleFlowConcept })))
export function ProductHeroVisual({ product }: { product: 'traceq' | 'titleflow-ai' | 'tax-flow' }) {
  if (product === 'tax-flow') return <Suspense fallback={null}><TaxCertificateHero /></Suspense>
  if (product === 'titleflow-ai') return <Suspense fallback={null}><TitleFlowConcept /></Suspense>

  const traceq = product === 'traceq'
  return <figure className={`product-window ${traceq ? 'product-window--traceq' : 'product-window--title'}`}>
    <div className="product-window__bar"><span><i /><i /><i /></span><small>{traceq ? 'TRACEQ LABS / OPERATIONS OVERVIEW' : 'TITLEFLOW AI / WORKSPACE WALKTHROUGH'}</small></div>
    <img src="/images/traceq/responsive/01-operations-overview-960.webp" srcSet={[640,960,1440,1920].map(width => `/images/traceq/responsive/01-operations-overview-${width}.webp ${width}w`).join(', ')} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1100px) 85vw, 700px" alt="TraceQ operations overview showing orders needing attention, order distribution, and revenue with fictional sample data" width="3200" height="2100" decoding="async" fetchPriority="high" />
    <figcaption><span>{traceq ? 'One view of orders, exceptions, and business activity. Fictional demonstration data.' : 'Actual interface · fictional sample order. Source and editable fields appear side by side.'}</span><SiteLink href={traceq ? '#traceq-client-view' : '#ai-quality'}>{traceq ? 'Explore the workspace' : 'Explore the workflow'} ↗</SiteLink></figcaption>
  </figure>
}
