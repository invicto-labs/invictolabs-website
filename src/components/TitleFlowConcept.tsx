import { FileText, Layers3, SearchCheck, UserCheck } from 'lucide-react'
import './titleflow-concept.css'

export function TitleFlowConcept() {
  return <figure className="titleflow-concept" aria-label="Illustration of document preparation and human review, not the TitleFlow interface">
    <div className="titleflow-concept__label">TITLEFLOW AI <span>WORKFLOW CONCEPT</span></div>
    <div className="titleflow-concept__papers" aria-hidden="true"><div /><div /><div><FileText size={38} /><i /><i /><i /><span>SOURCE RECORDS</span></div></div>
    <div className="titleflow-concept__line" aria-hidden="true"><i /></div>
    <div className="titleflow-concept__steps"><span><Layers3 size={22} />Prepare</span><span><SearchCheck size={22} />Review</span><span><UserCheck size={22} />Finalize</span></div>
    <figcaption><strong>Technology assists.<br />Your team makes the decision.</strong><p>Illustrative workflow—not the product interface.</p></figcaption>
  </figure>
}

export function TitleFlowExample() {
  return <figure className="titleflow-example">
    <div className="titleflow-example__header"><span>FROM SOURCE TO REVIEW</span><span>FICTIONAL EXAMPLE</span></div>
    <div className="titleflow-example__grid">
      <div className="titleflow-example__source"><FileText size={26} aria-hidden="true" /><h3>A source record</h3><p className="titleflow-example__reference">DEMO DOCUMENT · NOT A LEGAL RECORD</p><dl><div><dt>Property</dt><dd>100 Example Lane</dd></div><div><dt>Recorded reference</dt><dd>DEMO-001</dd></div><div><dt>Named party</dt><dd>Example Owner</dd></div></dl></div>
      <div className="titleflow-example__review"><p className="eyebrow"><span /> A focused review</p><h3>Clear questions.<br />Accountable decisions.</h3><ul><li><SearchCheck size={20} aria-hidden="true" /><span><strong>Check the property details</strong>Compare the working record with the source.</span></li><li><SearchCheck size={20} aria-hidden="true" /><span><strong>Resolve discrepancies</strong>Review unclear or inconsistent information.</span></li><li><UserCheck size={20} aria-hidden="true" /><span><strong>Complete the human review</strong>Keep final approval with the responsible reviewer.</span></li></ul></div>
    </div>
    <figcaption>Illustrative example—not the product interface or an actual TitleFlow output. All values are invented. No live document processing occurs on this page.</figcaption>
  </figure>
}
