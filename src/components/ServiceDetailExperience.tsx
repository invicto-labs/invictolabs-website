import { ArrowDown, ArrowRight, ArrowUpRight, Blocks, Clock3, Landmark, MapPinned, SearchCheck } from 'lucide-react'
import { serviceDetails } from '../data/serviceDetails'
import { serviceResearch } from '../data/serviceResearch'
import { SectionHeading } from './SectionHeading'
import { ServiceArtwork } from './ServiceAtelier'
import { SiteLink } from './SiteLink'
import { moveServiceSpotlight } from './useServiceDeck'
import { JournalContents, JournalReadingSection } from './JournalReading'
import { serviceArticleText } from '../data/serviceArticleText'
import '../insights.css'

const icons = [SearchCheck, Landmark, MapPinned, Blocks]

export function ServiceDetailHero({ slug }: { slug: string }) {
  const index = serviceDetails.findIndex(item => item.slug === slug)
  const service = serviceDetails[index]
  const research = serviceResearch[slug]
  const Icon = icons[index]
  return <section className="service-detail__hero service-immersive-hero">
    <div className="container service-detail__hero-inner">
      <div className="service-hero-masthead"><SiteLink className="service-detail__back" href="/services">← All services</SiteLink><span>INVICTO / CAPABILITY 0{index + 1}</span></div>
      <div className="service-detail__hero-grid">
        <div className="service-hero-copy"><p className="eyebrow"><span />{service.name}</p><h1>{service.headline}</h1><p className="service-detail__intro">{service.intro}</p><ul className="service-hero-signals" aria-label="Service capabilities">{research.signals.map(signal => <li key={signal}>{signal}</li>)}</ul><div className="service-hero-actions"><SiteLink className="button" href="/#contact">Let’s talk about your workflow <ArrowRight size={18} /></SiteLink><SiteLink href="#service-expertise">Explore the service <ArrowDown size={16} /></SiteLink></div></div>
        <div className="service-hero-card service-card" onPointerMove={moveServiceSpotlight}><div className="service-card__head"><div className="icon-tile icon-tile--light"><Icon size={23} /></div><span>0{index + 1} / 04</span></div><ServiceArtwork index={index} /><div className="service-hero-card__foot"><span>THE WORK, CONNECTED</span><strong>{service.output}</strong></div></div>
      </div>
    </div>
  </section>
}

export function ServiceResearchArticle({ slug }: { slug: string }) {
  const research = serviceResearch[slug]
  const paragraphs = serviceArticleText[slug]
  const minutes = Math.max(1, Math.ceil(paragraphs.flat().join(' ').split(/\s+/).length / 200))
  const sources = [...new Map(research.cards.map(section => [section.source, section])).values()]
  return <section className="service-research-article" id="service-expertise" aria-labelledby="service-research-heading">
    <div className="container service-article-heading"><SectionHeading id="service-research-heading" eyebrow="Expertise in practice" title={research.heading} /><div className="journal-meta"><span>Service overview</span><span><Clock3 size={13} aria-hidden="true" /> {minutes} min read</span></div></div>
    <div className="journal-reader container">
      <aside className="journal-toc"><p>IN THIS OVERVIEW</p><JournalContents titles={research.cards.map(section => section.title)} prefix="service-reading" /><div className="journal-toc__related"><span>Make it work for your team</span><SiteLink href="/#contact">Discuss your requirements <ArrowUpRight size={15} aria-hidden="true" /></SiteLink></div></aside>
      <article className="journal-body" aria-labelledby="service-research-heading">
        {research.cards.map((section, index) => <JournalReadingSection key={section.title} title={section.title} paragraphs={paragraphs[index]} index={index} prefix="service-reading" headingLevel={3} />)}
        <footer className="journal-sources"><h3>From Invicto on LinkedIn</h3><p>Based on the company’s published service information and updates.</p>{sources.map(source => <a key={source.source} href={source.source} target="_blank" rel="noopener noreferrer">{source.source === 'https://www.linkedin.com/company/invictolabs/' ? 'Company services and updates' : source.sourceLabel} <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}</footer>
      </article>
    </div>
  </section>
}

export function ServiceSwitcher({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const descriptions = ['Research to review', 'Across the loan lifecycle', 'Property-level insight', 'Built around your workflow']
  return <nav className={`service-switcher ${compact ? 'service-switcher--compact' : ''}`} aria-label="Explore Invicto services"><div className="container"><div className="service-switcher__panel"><div className="service-switcher__heading"><span>Explore our services</span><p><i aria-hidden="true" /> Four capabilities. One partner.</p></div><div className="service-switcher__grid">{serviceDetails.map((service, index) => {
    const Icon = icons[index]
    const active = slug === service.slug
    return <SiteLink key={service.slug} href={`/services/${service.slug}`} aria-current={active ? 'page' : undefined}><span className="service-switcher__icon"><Icon size={20} aria-hidden="true" /></span><span className="service-switcher__copy"><strong>{service.name}</strong><small>{active ? 'Currently viewing' : descriptions[index]}</small></span><ArrowUpRight className="service-switcher__arrow" size={16} aria-hidden="true" /></SiteLink>
  })}</div></div></div></nav>
}
