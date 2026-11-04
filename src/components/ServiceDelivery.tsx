import { ArrowRight, ArrowUpRight, Blocks, Landmark, Layers3, MapPinned, SearchCheck, Workflow } from 'lucide-react'
import { serviceDetails } from '../data/serviceDetails'
import { SiteLink } from './SiteLink'
import './delivery-content.css'

const audiences = [
  { title: 'Title agents and underwriters', description: 'Support for files moving toward examination or settlement.', link: 'Title research and production', href: '/services/title', icon: SearchCheck },
  { title: 'Lenders and servicers', description: 'Support for agreed origination, post-close, and valuation workflows.', link: 'Mortgage operations', href: '/services/mortgage', icon: Landmark },
  { title: 'Property operations teams', description: 'Parcel research and structured data for your property files.', link: 'Tax and property data', href: '/services/tax-property', icon: MapPinned },
]

const scope = [
  ['Property identifiers, jurisdiction, and agreed search instructions', 'Organized findings, source references, and exceptions for examination'],
  ['File inventory, workflow instructions, and authorized access', 'Prepared documents or indexed file information with outstanding items flagged'],
  ['Parcel identifiers, jurisdictions, and required fields', 'Structured tax or property findings with source and availability notes'],
  ['Workflow map, system constraints, and acceptance criteria', 'Agreed workflow output or configuration for your team to validate'],
]

const serviceIcons = [SearchCheck, Landmark, MapPinned, Blocks]

const products = [
  { name: 'TraceQ', href: '/products/traceq', description: 'Keep orders and handoffs visible.', icon: Workflow },
  { name: 'TitleFlow AI', href: '/products/titleflow-ai', description: 'Support title examination and review.', icon: Layers3 },
  { name: 'Tax Flow', href: '/products/tax-flow', description: 'Support property tax research.', icon: MapPinned },
]

const questions = [
  ['How do we establish coverage and turnaround?', 'Specify the jurisdiction, record types, search scope, and delivery requirements. Confirm coverage and timing before assigning work.'],
  ['How do we start a pilot?', 'Agree the scope, sample batch, delivery format, and review checklist. Review the pilot output and resolve exceptions before deciding whether to expand.'],
  ['Who makes the final title determination?', 'The client’s examiner or authorized professional retains final title determinations. Invicto prepares information for review.'],
]

export function ServiceDelivery() {
  return <div className="container delivery-content">
    <section className="delivery-section" aria-labelledby="delivery-audiences">
      <header className="delivery-heading">
        <p className="eyebrow"><span /> Who we support</p>
        <h2 id="delivery-audiences">Start with the work your team needs</h2>
      </header>
      <div className="delivery-grid delivery-grid--audiences">
        {audiences.map(({ title, description, link, href, icon: Icon }) => (
          <article className="delivery-card delivery-audience" key={href}>
            <span className="delivery-icon"><Icon size={20} aria-hidden="true" /></span>
            <h3>{title}</h3>
            <p>{description}</p>
            <SiteLink className="delivery-link" href={href}>{link}<ArrowUpRight size={16} aria-hidden="true" /></SiteLink>
          </article>
        ))}
      </div>
    </section>
    <section className="delivery-section" aria-labelledby="delivery-catalogue">
      <header className="delivery-heading">
        <p className="eyebrow"><span /> Service catalogue</p>
        <h2 id="delivery-catalogue">Find the right operational support</h2>
      </header>
      <div className="delivery-grid delivery-grid--catalogue">
        {serviceDetails.map((service, index) => {
          const Icon = serviceIcons[index]
          const [input, output] = scope[index]
          return (
            <article className="delivery-card delivery-service" key={service.slug}>
              <div className="delivery-service__header">
                <span className="delivery-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3><SiteLink className="delivery-link" href={`/services/${service.slug}`}>{service.name}<ArrowUpRight size={18} aria-hidden="true" /></SiteLink></h3>
              </div>
              <dl>
                <div><dt>Who we support</dt><dd>{service.audience}</dd></div>
                <div><dt>Scope</dt><dd>{service.capabilities.map(([name]) => name).join(', ')}</dd></div>
                <div><dt>What you send</dt><dd>{input}</dd></div>
                <div><dt>What you receive</dt><dd>{output}</dd></div>
              </dl>
            </article>
          )
        })}
      </div>
    </section>
    <section className="delivery-section delivery-tools" aria-labelledby="delivery-tools">
      <header className="delivery-heading">
        <p className="eyebrow"><span /> Operations technology</p>
        <h2 id="delivery-tools">Tools and delivery</h2>
        <p>Explore tools that support your workflow and leave the final review with your team.</p>
      </header>
      <div className="delivery-grid delivery-grid--audiences">
        {products.map(({ name, href, description, icon: Icon }) => (
          <SiteLink className="delivery-card delivery-product" key={href} href={href}>
            <span className="delivery-icon"><Icon size={19} aria-hidden="true" /></span>
            <span><strong>{name}</strong><span>{description}</span></span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </SiteLink>
        ))}
      </div>
      <nav className="delivery-resources" aria-label="More about service delivery">
        <SiteLink className="delivery-link" href="/our-approach">Review our delivery approach <ArrowRight size={16} aria-hidden="true" /></SiteLink>
        <SiteLink className="delivery-link" href="/blogs">Read operational insights <ArrowRight size={16} aria-hidden="true" /></SiteLink>
        <SiteLink className="delivery-link" href="/case-studies">Explore workflow walkthroughs <ArrowRight size={16} aria-hidden="true" /></SiteLink>
      </nav>
    </section>
    <section className="delivery-section delivery-faq" aria-labelledby="delivery-faq">
      <header className="delivery-heading">
        <p className="eyebrow"><span /> Planning your engagement</p>
        <h2 id="delivery-faq">Questions before you begin</h2>
      </header>
      <div className="delivery-faq__list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
    <section className="delivery-inquiry" aria-labelledby="delivery-inquiry">
      <header className="delivery-heading">
        <p className="eyebrow eyebrow--light"><span /> Start a conversation</p>
        <h2 id="delivery-inquiry">Discuss a sample or pilot</h2>
        <p>Tell us the workflow, scope, and deliverable you want to review. Use the inquiry form to prepare an email draft.</p>
      </header>
      <SiteLink className="button delivery-inquiry__button" href="/#contact">Discuss a sample or pilot <ArrowUpRight size={19} aria-hidden="true" /></SiteLink>
    </section>
  </div>
}
