import { serviceDetails } from '../data/serviceDetails'
import { SiteLink } from './SiteLink'
import './delivery-content.css'

const scope = [
  ['Property identifiers, jurisdiction, and agreed search instructions', 'Organized findings, source references, and exceptions for examination'],
  ['File inventory, workflow instructions, and authorized access', 'Prepared documents or indexed file information with outstanding items flagged'],
  ['Parcel identifiers, jurisdictions, and required fields', 'Structured tax or property findings with source and availability notes'],
  ['Workflow map, system constraints, and acceptance criteria', 'Agreed workflow output or configuration for your team to validate'],
]

const questions = [
  ['How do we establish coverage and turnaround?', 'Specify the jurisdiction, record types, search scope, and delivery requirements. Confirm coverage and timing before assigning work.'],
  ['How do we start a pilot?', 'Agree the scope, sample batch, delivery format, and review checklist. Review the pilot output and resolve exceptions before deciding whether to expand.'],
  ['Who makes the final title determination?', 'The client’s examiner or authorized professional retains final title determinations. Invicto prepares information for review.'],
]

function DeliveryFaq() {
  return <section aria-labelledby="delivery-faq">
    <h2 id="delivery-faq">Questions before you begin</h2>
    {questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
  </section>
}

export function ServiceDelivery({ slug }: { slug?: string }) {
  return <div className="container delivery-content">
    {!slug && <section aria-labelledby="delivery-audiences">
      <h2 id="delivery-audiences">Start with the work your team needs</h2>
      <div className="delivery-grid">
        <article><h3>Title agents and underwriters</h3><p><SiteLink href="/services/title">Title research and production support</SiteLink> for files moving toward examination or settlement.</p></article>
        <article><h3>Lenders and servicers</h3><p><SiteLink href="/services/mortgage">Mortgage operations support</SiteLink> for agreed origination, post-close, and valuation workflows.</p></article>
        <article><h3>Property operations teams</h3><p><SiteLink href="/services/tax-property">Tax and property data support</SiteLink> for parcel research and structured file inputs.</p></article>
      </div>
      <p>[TBD: confirmed geographic coverage and delivery capacity]</p>
    </section>}
    <section aria-labelledby="delivery-catalogue">
      <h2 id="delivery-catalogue">{slug ? 'What to send and what to expect' : 'Find the right operational support'}</h2>
      <div className="delivery-grid">
        {serviceDetails.map((service, index) => (!slug || slug === service.slug) && (
          <article key={service.slug}>
            <h3>{slug ? service.name : <SiteLink href={`/services/${service.slug}`}>{service.name}</SiteLink>}</h3>
            <dl>
              <dt>Who we support</dt><dd>{service.audience}</dd>
              <dt>Scope</dt><dd>{service.capabilities.map(([name]) => name).join(', ')}</dd>
              <dt>What you send</dt><dd>{scope[index][0]}</dd>
              <dt>What you receive</dt><dd>{scope[index][1]}</dd>
              <dt>Turnaround</dt><dd>[TBD: confirmed turnaround tiers]</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
    {!slug && <section aria-labelledby="delivery-tools">
      <h2 id="delivery-tools">Tools and delivery</h2>
      <p><SiteLink href="/products/traceq">TraceQ</SiteLink> supports order visibility, <SiteLink href="/products/titleflow-ai">TitleFlow AI</SiteLink> supports title review, and <SiteLink href="/products/tax-flow">Tax Flow</SiteLink> supports tax research workflows. Your team reviews the outputs.</p>
      <p>[TBD: supported integrations and delivery channels]</p>
      <p>[TBD: approved security summary and vendor due diligence pack]</p>
      <p>[TBD: approved delivery leadership contact and redacted sample report]</p>
      <p><SiteLink href="/our-approach">Review our delivery approach</SiteLink> · <SiteLink href="/blogs">Read operational insights</SiteLink> · <SiteLink href="/case-studies">Explore workflow walkthroughs</SiteLink></p>
    </section>}
    <DeliveryFaq />
    <section aria-labelledby="delivery-inquiry">
      <h2 id="delivery-inquiry">Discuss a sample or pilot</h2>
      <p>Tell us the workflow, scope, and deliverable you want to review. The form prepares an email draft for you to send.</p>
      <SiteLink className="button" href="#contact">Discuss a sample or pilot</SiteLink>
    </section>
  </div>
}

export function ApproachDelivery() {
  return <div className="container delivery-content">
    <section aria-labelledby="pilot-review">
      <h2 id="pilot-review">Agree the pilot before work begins</h2>
      <p>Confirm authorized access, sample inputs, delivery format, and the client reviewer before intake. Review the pilot against the agreed checklist and record open exceptions before the client approves expansion.</p>
      <p>[TBD: pilot batch size and stage durations]</p>
    </section>
    <section aria-labelledby="quality-review">
      <h2 id="quality-review">Review, rework, and decision rights</h2>
      <div className="delivery-grid">
        <article><h3>Invicto delivery team</h3><p>Prepare the agreed output, surface exceptions, and record feedback and rework against the brief.</p></article>
        <article><h3>Client reviewer</h3><p>Set acceptance criteria, decide how to handle unresolved exceptions, and approve changes to scope. The client’s examiner or authorized professional retains final title determinations.</p></article>
        <article><h3>Automation</h3><p>Assist with organizing and reviewing information. Assign a person to validate the output and resolve discrepancies.</p></article>
      </div>
      <p>[TBD: confirmed QC stages and rework policy]</p>
    </section>
    <section aria-labelledby="governance-review">
      <h2 id="governance-review">Access, reporting, and continuity</h2>
      <p>Agree authorized access, points of contact, reporting cadence, and escalation owners during onboarding. Review volume changes with the delivery lead before revising scope or priorities.</p>
      <ul><li>[TBD: approved data handling, access controls, confidentiality, and due diligence pack]</li>
        <li>[TBD: approved SLA, reporting cadence, and escalation matrix]</li>
        <li>[TBD: approved capacity and continuity arrangements]</li></ul>
    </section>
    <DeliveryFaq />
    <SiteLink className="button" href="#contact">Discuss a pilot</SiteLink>
  </div>
}
