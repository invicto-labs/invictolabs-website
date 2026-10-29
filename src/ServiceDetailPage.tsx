import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Contact } from './components/Contact'
import { SiteLink } from './components/SiteLink'
import { serviceDetails } from './data/serviceDetails'
import './service-details.css'
import { ServiceCapabilities, ServicesHero } from './components/ServiceExperience'
import { GridBoxBackground } from './components/ui/GridBoxBackground'
import { ServiceArtwork } from './components/ServiceAtelier'
import { ServiceScopeEditorial, ServiceHandoff } from './components/ServiceEditorial'
export { ServicesHero }

export function ServiceDirectory() {
  return <section className="service-directory"><div className="container"><p className="eyebrow"><span /> Explore the scope</p><h2>Find the support<br />your operation needs.</h2><div className="service-directory__grid">{serviceDetails.map((service, index) => <SiteLink key={service.slug} href={`/services/${service.slug}`}><span>0{index + 1} / {service.name}</span><h3>{service.headline}</h3><p>{service.intro}</p><strong>View service details <ArrowUpRight size={19} aria-hidden="true" /></strong></SiteLink>)}</div></div></section>
}

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const service = serviceDetails.find(item => item.slug === slug)!
  return <><Header /><main id="main-content" className="service-detail">
    <section className="service-detail__hero"><GridBoxBackground /><div className="container service-detail__hero-inner"><SiteLink className="service-detail__back" href="/services">← All services</SiteLink><div className="service-detail__hero-grid"><div><p className="eyebrow"><span /> {service.name}</p><h1>{service.headline}</h1><p className="service-detail__intro">{service.intro}</p><SiteLink className="button" href="#contact">Discuss your requirements <ArrowRight size={18} aria-hidden="true" /></SiteLink></div><ServiceArtwork index={serviceDetails.indexOf(service)} /></div></div></section>
    <ServiceCapabilities service={service} />
    <ServiceScopeEditorial slug={slug} />
    <section className="service-detail__process"><GridBoxBackground /><div className="container service-detail__process-inner"><p className="eyebrow"><span /> Working together</p><h2>From requirements to handoff.</h2><ol>{service.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><h3>{['Define', 'Prepare', 'Deliver'][index]}</h3><p>{step}</p></li>)}</ol><p className="service-detail__note">{service.note}</p><SiteLink className="service-detail__product" href={service.product}><span>Explore related technology<strong>{service.productName}</strong></span><ArrowUpRight size={26} aria-hidden="true" /></SiteLink></div></section>
    <ServiceHandoff slug={slug} />
    <nav className="container service-detail__related" aria-label="Other services">{serviceDetails.filter(item => item.slug !== slug).map(item => <SiteLink key={item.slug} href={`/services/${item.slug}`}>{item.name}<ArrowRight size={16} aria-hidden="true" /></SiteLink>)}</nav><Contact />
  </main><Footer /></>
}
