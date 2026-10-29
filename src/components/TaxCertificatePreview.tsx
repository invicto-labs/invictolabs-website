import { useState } from 'react'
import { ChevronDown, FileText } from 'lucide-react'

export function TaxCertificatePreview() {
  const [expanded, setExpanded] = useState(false)
  return <section className="tax-cert-showcase" aria-labelledby="tax-cert-heading">
    <header><p className="eyebrow"><span /> From lookup to handoff</p><h2 id="tax-cert-heading">The details,<br />brought together.</h2><p>Property identifiers, assessed values, and a tax summary in a structured format your team can review.</p><div className="tax-cert-showcase__legend"><span>01 <b>Property context</b></span><span>02 <b>Assessment breakdown</b></span><span>03 <b>Payment summary</b></span></div><p className="tax-cert-showcase__note">Recreated layout · Fictional sample values.<br />Not an official tax certificate.</p></header>
    <div className="tax-cert-sample">
      <div className="tax-cert-sample__heading"><strong><FileText size={20} aria-hidden="true" /> Tax Certificate</strong><span>FICTIONAL SAMPLE</span></div>
      <div className="tax-cert-sample__summary"><span>DEMO-TF-0001</span><h3>100 Example Lane</h3><p>Sample City · Sample County</p><div><span>Illustrative annual tax<strong>$2,400.00</strong></span><span>Illustrative balance<strong>$0.00</strong></span></div></div>
      <button className="tax-cert-sample__toggle" aria-expanded={expanded} aria-controls="tax-cert-details" onClick={() => setExpanded(!expanded)}> {expanded ? 'Hide' : 'Explore'} sample certificate details <ChevronDown size={18} aria-hidden="true" /></button>
      <div id="tax-cert-details" hidden={!expanded}>
      <dl>{[['Processed date', 'October 2, 2026'], ['Order number', 'DEMO-TF-0001'], ['Borrower / owner', 'Sample Property Owner'], ['Property address', '100 Example Lane · Sample City'], ['Parcel number', 'DEMO-PARCEL-0001']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="tax-cert-sample__values">{[['Land value','$60,000'],['Improvements','$140,000'],['Assessed value','$200,000'],['Exemption','$0'],['Taxable value','$200,000']].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className="tax-cert-sample__table"><table><caption>Illustrative tax summary</caption><thead><tr><th>Jurisdiction</th><th>Tax year</th><th>Payment type</th><th>Base amount</th><th>Amount paid</th><th>Amount due</th></tr></thead><tbody><tr><td>Sample County</td><td>2025</td><td>Annual</td><td>$2,400.00</td><td>$2,400.00</td><td>$0.00</td></tr></tbody></table></div>
      </div>
      <p><strong>Demo only.</strong> All values are invented. Not for lending, payment, or legal reliance.</p>
    </div>
  </section>
}
