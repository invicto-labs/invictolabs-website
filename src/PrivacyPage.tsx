import { ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SiteLink } from './components/SiteLink'
import { company } from './data/site'
import './privacy.css'

const sections = [
  { id: 'scope', title: 'About this notice', paragraphs: [
    'This notice describes the public Invicto website and enquiries made through its contact links. It does not describe all processing within TraceQ Labs, TitleFlow AI, Tax Flow, or contracted client services. Those activities require their own applicable notices and contractual arrangements.',
    'This website introduces business services and products. Please do not submit borrower information, property documents, account credentials, or other confidential material through public enquiry channels.',
  ] },
  { id: 'information', title: 'Information you choose to provide', paragraphs: [
    'The enquiry form asks for your name, work email, company, area of interest, and message. Preparing a draft processes these fields in your browser; it does not upload the form to an Invicto server or send an email automatically.',
    'If you choose to open your email application, the draft is passed to that application. If you choose Copy draft, the text is copied to your device’s clipboard. Your email provider and device settings govern what happens there. Invicto receives your enquiry when you send it to us.',
    'Messages you send may include your contact information, correspondence, and any attachments you choose to include. Careers links lead to an external recruitment platform; review its privacy information before submitting an application.',
  ] },
  { id: 'technical', title: 'Website delivery, cookies & analytics', paragraphs: [
    'Loading a website sends technical information, such as your IP address, requested URL, browser information, and request time, to the services delivering it. Hosting providers may process request and security logs to deliver and protect the website.',
    'The current website application does not include advertising pixels or Google Analytics, and does not use cookies or browser storage to save your enquiry draft. Hosting-level monitoring and any future analytics configuration must also be considered; this is not a statement that no technical information is processed.',
    'You can manage cookies and other site permissions in your browser. External websites have their own settings and practices. If tracking tools are introduced, this notice and any required consent controls will need to reflect them.',
  ] },
  { id: 'use', title: 'Enquiries & service providers', paragraphs: [
    'Information provided in an enquiry is intended to help our team respond, understand your requirements, arrange a discussion or demonstration, and communicate about the requested services.',
    'Website hosting and email delivery involve service providers. Information may also need to be handled in connection with a legal obligation or a security matter. The complete provider list, access arrangements, international processing locations, and business data-sharing practices are pending confirmation before this draft is finalised.',
  ] },
  { id: 'retention', title: 'Retention & security', paragraphs: [
    'Preparing a draft does not create a stored website submission. Messages you actually send are separate records in the receiving email system. Their retention period, backup handling, and deletion process must be confirmed with Invicto; this draft does not promise a fixed deletion deadline.',
    'No website or email channel can guarantee absolute security. For confidential client work, contact our team to agree an appropriate transfer method instead of sending sensitive material through this website.',
  ] },
  { id: 'choices', title: 'Your questions & choices', paragraphs: [
    'You can browse the public website without completing the enquiry form. To ask about information you have sent, request a correction or deletion, or raise a privacy concern, email marketing@invictolabs.com. Include enough context to locate your enquiry, but do not attach identity documents unless an appropriate verification method has been agreed.',
    'Depending on the law that applies to you and the processing involved, you may have additional privacy rights. Requests may require identity verification and may be subject to legal exceptions. The applicable rights and response procedure should be confirmed in the final notice.',
  ] },
  { id: 'links', title: 'External links & updates', paragraphs: [
    'Links to LinkedIn, Google Maps, product websites, and other external services take you to sites with their own privacy practices. This notice does not govern those services.',
    'This page will need updating when the website’s features or data practices change. The review date above identifies this version. This draft is not a certification of legal compliance.',
  ] },
]

export default function PrivacyPage() {
  return <><Header /><main id="main-content" className="privacy-page">
    <section className="privacy-hero"><div className="container">
      <p className="eyebrow"><span /> Information & trust</p>
      <h1>Privacy Policy</h1>
      <p className="privacy-hero__intro">A clear view of the information you share,<br />and the choices you have.</p>
      <div className="privacy-meta"><ShieldCheck size={19} aria-hidden="true" /><span>Public website notice</span><span>Draft reviewed: 29 October 2026</span></div>
    </div></section>
    <div className="container privacy-layout">
      <aside className="privacy-index"><p>On this page</p><nav aria-label="Privacy policy contents">{sections.map((section, index) => <SiteLink key={section.id} href={`/privacy-policy#${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</SiteLink>)}</nav></aside>
      <div className="privacy-content">
        <div className="privacy-review"><strong>Draft · pending business and legal review</strong><p>The website behaviour described here has been checked against the current application. Company identity, provider arrangements, retention practices, and applicable legal disclosures still need approval before this becomes the final notice.</p></div>
        {sections.map((section, index) => <section className="privacy-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}><span className="privacy-section__number">{String(index + 1).padStart(2, '0')}</span><h2 id={`${section.id}-heading`}>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
        <section className="privacy-contact"><p className="eyebrow"><span /> Contact Invicto</p><h2>A question about privacy?</h2><p>Get in touch with our team about this notice or an enquiry you have sent.</p><a href={`mailto:${company.email}?subject=Privacy%20enquiry`}>{company.email}<ArrowUpRight size={19} aria-hidden="true" /></a></section>
      </div>
    </div>
  </main><Footer /></>
}
