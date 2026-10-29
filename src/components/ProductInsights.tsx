import { SiteLink } from './SiteLink'
import { ArrowRight, ShieldCheck, ReceiptText } from 'lucide-react'
import { GridBoxBackground } from './ui/GridBoxBackground'
import './product-insights.css'
import { TitleFlowExample } from './TitleFlowConcept'

const titleCapabilities = [
  { title: 'Prepare the file', text: 'Organize source information into a working record for the requested title service. Keep the source available for verification.', output: 'Structured information' },
  { title: 'Review the findings', text: 'Focus attention on information that needs checking. Your reviewer compares the working record with the source and resolves discrepancies.', output: 'Human-reviewed findings' },
  { title: 'Finalize with oversight', text: 'Complete the final review and prepare the agreed deliverables. Responsibility for approval remains with the reviewing team.', output: 'Reviewer-led completion' },
]

export function ProductInsights({ kind }: { kind: 'title' | 'title-workflow' | 'tax' }) {
  if (kind === 'title') return (
    <TitleFlowExample />
  )

  if (kind === 'title-workflow') return (
      <section className="titleflow-editorial" aria-labelledby="titleflow-workflow-heading">
        <GridBoxBackground className="titleflow-editorial__grid" cellCount={600} />
        <div className="container titleflow-editorial__workflow">
          <header>
            <p className="titleflow-kicker">THE WORKING PROCESS</p>
            <h2 id="titleflow-workflow-heading">The document is just<br />the beginning.</h2>
            <p>From the first document to the final review, each stage has a practical purpose.</p>
          </header>
          <ol className="titleflow-workflow">
            {titleCapabilities.map(({ title, text, output }, index) => <li key={title}>
              <span className="titleflow-workflow__number" aria-hidden="true">0{index + 1}</span>
              <div><h3>{title}</h3><p>{text}</p><small>{output}</small></div>
            </li>)}
          </ol>
        </div>
        <div className="titleflow-review-band"><div className="container titleflow-review-note">
          <div><p className="titleflow-kicker">BUILT AROUND THE ENGAGEMENT</p><h3>Start with the work you need.</h3><p>Discuss your search types, source documents, review responsibilities, and required deliverables with our team. We’ll explain the applicable scope in a private conversation.</p></div>
          <div><p className="titleflow-kicker">REVIEWER CONTROL</p><h3>Evidence first. Judgment stays with you.</h3><p>AI-assisted preparation does not replace source verification or professional review. Your team evaluates the findings and controls the final approval.</p><SiteLink href="#contact">Request a private walkthrough <ArrowRight size={17} aria-hidden="true" /></SiteLink></div>
        </div></div>
        <p className="container titleflow-roadmap"><strong>A public overview, not a product disclosure.</strong> Interface screens and internal implementation details are not shown here. Contact our team to discuss an appropriate walkthrough.</p>
      </section>
  )

  return (
    <section className="section taxflow-section" id="tax-flow" aria-labelledby="taxflow-heading">
      <div className="container">
        <div className="product-heading-v2">
          <div><p className="eyebrow"><span /> Product 03 · Tax Flow</p><h2 id="taxflow-heading">Three details.<br />A clearer tax picture.</h2></div>
          <div><p>A property-tax retrieval application built for U.S. mortgage operations. Supply the parcel number, state, and county, and Tax Flow automates the lookup of available property-tax information from supported sources.</p><SiteLink href="#contact">Discuss your county coverage <ArrowRight size={17} aria-hidden="true" /></SiteLink></div>
        </div>
        <div className="taxflow-workspace">
          <div className="taxflow-lookup" aria-label="Illustration of the Tax Flow lookup process">
            <div className="taxflow-lookup__head"><ReceiptText size={23} aria-hidden="true" /><strong>Tax Flow</strong><span>WORKFLOW PREVIEW</span></div>
            <p className="taxflow-overline">START WITH THE PROPERTY</p>
            <div className="taxflow-fields"><div><small>Parcel number</small><strong>Your property’s parcel ID</strong></div><div><small>State</small><strong>Select state</strong></div><div><small>County</small><strong>Select county</strong></div></div>
            <div className="taxflow-transfer" aria-hidden="true"><i /><span>Automated source lookup</span><i /></div>
            <div className="taxflow-result"><ShieldCheck size={24} aria-hidden="true" /><div><strong>Property-tax information</strong><p>Available source records, ready for your team to review.</p></div></div>
            <small className="taxflow-preview-note">Illustrative workflow. This website does not run a live property search.</small>
          </div>
          <div className="taxflow-steps">
            {[
              ['01', 'Identify the right property', 'The parcel number identifies the property; state and county establish the jurisdiction for the lookup.'],
              ['02', 'Let retrieval do the repetitive work', 'Automated browser-based lookup handles the search on supported tax sources, reducing the need to navigate each source manually.'],
              ['03', 'Review with the source in mind', 'Your team checks the returned information for the mortgage file. Available fields and freshness depend on the underlying source.'],
            ].map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </div>
        <p className="taxflow-coverage">Planning a rollout? Share your states, counties, and required tax fields so we can confirm source support and the right workflow for your team.</p>
      </div>
    </section>
  )
}
