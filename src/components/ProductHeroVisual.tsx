import { SiteLink } from './SiteLink'
import { TaxCertificateHero } from './TaxCertificateHero'
import { TitleFlowConcept } from './TitleFlowConcept'
export function ProductHeroVisual({ product }: { product: 'traceq' | 'titleflow-ai' | 'tax-flow' }) {
  if (product === 'tax-flow') return <TaxCertificateHero />
  if (product === 'titleflow-ai') return <TitleFlowConcept />

  const traceq = product === 'traceq'
  return <figure className={`product-window ${traceq ? 'product-window--traceq' : 'product-window--title'}`}>
    <div className="product-window__bar"><span><i /><i /><i /></span><small>{traceq ? 'TRACEQ LABS / OPERATIONS OVERVIEW' : 'TITLEFLOW AI / WORKSPACE WALKTHROUGH'}</small></div>
    <img src="/images/traceq/01-operations-overview.png" alt="TraceQ operations overview showing orders needing attention, order distribution, and revenue with fictional sample data" width="3200" height="2100" decoding="async" fetchPriority="high" />
    <figcaption><span>{traceq ? 'One view of orders, exceptions, and business activity. Fictional demonstration data.' : 'Actual interface · fictional sample order. Source and editable fields appear side by side.'}</span><SiteLink href={traceq ? '#traceq-client-view' : '#ai-quality'}>{traceq ? 'Explore the workspace' : 'Explore the workflow'} ↗</SiteLink></figcaption>
  </figure>
}
