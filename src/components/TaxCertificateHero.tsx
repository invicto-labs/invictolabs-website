import { ArrowDown, FileText } from 'lucide-react'
import './tax-certificate-hero.css'

export function TaxCertificateHero() {
  return <figure className="tax-certificate-hero">
    <div className="tax-certificate-hero__input"><span>START WITH</span><strong>Parcel number <i>+</i> State <i>+</i> County</strong><ArrowDown size={18} aria-hidden="true" /></div>
    <div className="tax-certificate-hero__paper">
      <div className="tax-certificate-hero__masthead"><span><FileText size={21} aria-hidden="true" /> TAX FLOW</span><small>FICTIONAL SAMPLE</small></div>
      <div className="tax-certificate-hero__title"><span>PROPERTY TAX CERTIFICATE</span><h2>100 Example Lane</h2><p>Sample City · Sample County</p></div>
      <dl className="tax-certificate-hero__identity"><div><dt>Order reference</dt><dd>DEMO-TF-0001</dd></div><div><dt>Parcel reference</dt><dd>DEMO-PARCEL-0001</dd></div></dl>
      <div className="tax-certificate-hero__assessment"><span>ASSESSMENT SUMMARY</span><dl><div><dt>Land</dt><dd>$60,000</dd></div><div><dt>Improvements</dt><dd>$140,000</dd></div><div><dt>Total assessed</dt><dd>$200,000</dd></div></dl></div>
      <div className="tax-certificate-hero__totals"><div><span>Annual tax · sample</span><strong>$2,400<span>.00</span></strong></div><div><span>Balance · sample</span><strong>$0<span>.00</span></strong></div></div>
      <div className="tax-certificate-hero__footer"><span>Property context</span><i /><span>Tax summary</span><i /><span>Team review</span></div>
    </div>
    <figcaption>Recreated certificate preview with invented values.<br />Not an official certificate or a live lookup.</figcaption>
  </figure>
}
