import { useState } from 'react'
import { ArrowRight, MapPin, Search, FileCheck2 } from 'lucide-react'
import './taxflow-experience.css'

const stages = [
  { name: 'Identify', title: 'Every search starts with a property.', text: 'A parcel number identifies the property. State and county establish the jurisdiction—so the lookup starts in the right place.', icon: MapPin, label: 'PROPERTY INPUTS', fields: ['Parcel number', 'State', 'County'], result: 'A defined property and jurisdiction' },
  { name: 'Retrieve', title: 'Let the lookup do the legwork.', text: 'Tax Flow automates browser-based retrieval from supported tax sources, reducing repetitive navigation between county websites.', icon: Search, label: 'SOURCE LOOKUP', fields: ['Identify supported source', 'Navigate tax records', 'Retrieve available information'], result: 'Available property-tax information' },
  { name: 'Review', title: 'Bring the source into the decision.', text: 'Your team reviews the returned information for the mortgage file. Available fields and record freshness depend on the underlying source.', icon: FileCheck2, label: 'TEAM REVIEW', fields: ['Confirm the property', 'Check returned information', 'Review for the mortgage file'], result: 'Information ready for your team’s review' },
]

export function TaxFlowExperience() {
  const [active, setActive] = useState(0)
  const stage = stages[active]
  const Icon = stage.icon
  return <section className="tax-experience" id="tax-flow" aria-labelledby="tax-experience-title">
    <div className="container">
      <div className="tax-experience__intro"><div><p className="eyebrow"><span /> Inside Tax Flow</p><h2 id="tax-experience-title">County-level detail.<br /><span>Built for scale.</span></h2></div><p>Automated tax certificate extraction across 1,200+ county websites in U.S. states. From property identification to a structured certificate, Tax Flow brings repetitive research into one workflow.</p></div>
      <section className="tax-coverage-highlight" aria-label="Current automation coverage">
        <div className="tax-coverage-highlight__metric"><span>CURRENT AUTOMATION COVERAGE</span><strong>1,200<span>+</span></strong><p>County websites across U.S. states</p></div>
        <div className="tax-coverage-highlight__copy"><span className="tax-coverage-highlight__status"><i aria-hidden="true" /> Automated extraction</span><h3>Different county websites.<br />One certificate workflow.</h3><p>Tax Flow automates the retrieval of available property-tax information and organizes it for your team’s review.</p><div className="tax-coverage-highlight__path"><span>Locate the property</span><ArrowRight size={16} aria-hidden="true" /><span>Extract tax details</span><ArrowRight size={16} aria-hidden="true" /><span>Review the certificate</span></div><small>Availability and returned fields vary by county source. Confirm support for your target counties.</small></div>
      </section>
      <div className="tax-experience__console">
        <div className="tax-experience__rail" aria-label="Explore the Tax Flow workflow">
          <span>THE RETRIEVAL PROCESS</span>
          {stages.map((item, index) => <button key={item.name} type="button" aria-pressed={active === index} aria-controls="tax-stage" onClick={() => setActive(index)}><small>0{index + 1}</small>{item.name}<ArrowRight size={18} aria-hidden="true" /></button>)}
          <p>Interactive illustration<br />No live property search</p>
        </div>
        <div className="tax-experience__stage" id="tax-stage" aria-live="polite" aria-atomic="true">
          <div className="tax-experience__copy" key={stage.name}><span className="tax-experience__index">0{active + 1} / 03</span><Icon size={32} strokeWidth={1.3} aria-hidden="true" /><h3>{stage.title}</h3><p>{stage.text}</p></div>
          <div className="tax-experience__record" key={stage.label}><div className="tax-experience__record-head"><span>{stage.label}</span><i aria-hidden="true" /></div><ol>{stage.fields.map((field, index) => <li key={field}><span>0{index + 1}</span>{field}</li>)}</ol><div className="tax-experience__result"><span>OUTPUT</span><strong>{stage.result}</strong></div></div>
        </div>
      </div>
    </div>
  </section>
}
