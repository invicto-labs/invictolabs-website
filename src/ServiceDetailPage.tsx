import { ArrowUpRight } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SiteLink } from './components/SiteLink'
import { serviceDetails } from './data/serviceDetails'
import './service-details.css'
import { ServiceCapabilities, ServicesHero } from './components/ServiceExperience'
import { ServicePageBackground } from './components/ServicePageBackground'
import { ServiceDetailHero, ServiceResearchArticle, ServiceSwitcher } from './components/ServiceDetailExperience'
import './service-detail-experience.css'
import { ServiceScopeEditorial, ServiceHandoff } from './components/ServiceEditorial'
export { ServicesHero }

export function ServiceDirectory() {
  return <section className="service-directory"><div className="container"><p className="eyebrow"><span /> Explore the scope</p><h2>Find the support<br />your operation needs.</h2><div className="service-directory__grid">{serviceDetails.map((service, index) => <SiteLink key={service.slug} href={`/services/${service.slug}`}><span>0{index + 1} / {service.name}</span><h3>{service.headline}</h3><p>{service.intro}</p><strong>View service details <ArrowUpRight size={19} aria-hidden="true" /></strong></SiteLink>)}</div></div></section>
}

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const service = serviceDetails.find(item => item.slug === slug)!
  return <><Header /><main id="main-content" className="service-detail">
    <ServicePageBackground />
    <ServiceDetailHero slug={slug} />
    <ServiceSwitcher slug={slug} />
    <ServiceResearchArticle slug={slug} />
    <ServiceCapabilities service={service} />
    <ServiceScopeEditorial slug={slug} />
    <section className="service-detail__process"><div className="container service-detail__process-inner"><p className="eyebrow"><span /> Working together</p><h2>From requirements to handoff.</h2><ol>{service.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><h3>{['Define', 'Prepare', 'Deliver'][index]}</h3><p>{step}</p></li>)}</ol><p className="service-detail__note">{service.note}</p><SiteLink className="service-detail__product" href={service.product}><span>Explore related technology<strong>{service.productName}</strong></span><ArrowUpRight size={26} aria-hidden="true" /></SiteLink></div></section>
    <ServiceHandoff slug={slug} />
    <ServiceSwitcher slug={slug} compact />
  </main><Footer /></>
}
