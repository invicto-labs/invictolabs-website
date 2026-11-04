import { useState, type FormEvent } from 'react'
import { SiteLink } from './SiteLink'
import { ArrowUpRight, Mail, Phone } from 'lucide-react'
import { company } from '../data/site'
import './inquiry.css'

const topics = ['General inquiry', 'Title services', 'Mortgage services', 'Tax & property data', 'Technology services', 'TraceQ demo', 'TitleFlow AI demo', 'Tax Flow county coverage']

export function Contact() {
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const prepare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setDraft({ subject: `Invicto inquiry — ${values.get('topic')}`, body: `Name: ${String(values.get('name')).trim()}\nCompany: ${String(values.get('organization')).trim()}\nReply email: ${String(values.get('email')).trim()}\nInterest: ${values.get('topic')}\n\n${String(values.get('message')).trim()}` })
    setCopyStatus('')
  }
  const copyDraft = async () => {
    if (!draft) return
    try { await navigator.clipboard.writeText(`To: ${company.email}\nSubject: ${draft.subject}\n\n${draft.body}`); setCopyStatus('Copied. Paste this into your email application and send it to our team.') }
    catch { setCopyStatus('Copy is unavailable in this browser. Select and copy the draft text below.') }
  }
  return <section className="contact contact--inquiry" id="contact" aria-labelledby="contact-heading" tabIndex={-1}>
    <div className="container contact-grid">
      <div className="contact-copy"><p className="eyebrow eyebrow--light"><span /> Start a conversation</p><h2 id="contact-heading">Tell us what your team needs.</h2><p>Share the service you need, the work involved, and any timing or volume requirements. We’ll use that context to discuss a suitable scope.</p><p className="inquiry-privacy">Please do not include borrower details, property documents, passwords, or other confidential information. This form prepares an email draft; it does not upload or send your information.</p></div>
      <div className="contact-action">
        <form className="inquiry-form" onSubmit={prepare} onChange={() => { setDraft(null); setCopyStatus('') }}>
          <div className="inquiry-form__row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Work email<input name="email" type="email" autoComplete="email" required maxLength={160} /></label></div>
          <label>Company<input name="organization" autoComplete="organization" required maxLength={120} /></label>
          <label>I'm interested in<select name="topic">{topics.map(topic => <option key={topic}>{topic}</option>)}</select></label>
          <label>How can we help?<textarea name="message" rows={3} required minLength={10} maxLength={1200} placeholder="A brief outline of your workflow, scope, or demo request." /></label>
          <button className="contact-cta" type="submit"><span>Prepare email draft</span><ArrowUpRight size={20} aria-hidden="true" /></button>
          <SiteLink href="/privacy-policy">Read our Privacy Policy</SiteLink>
        </form>
        {draft && <div className="inquiry-draft"><p role="status"><strong>Your draft is ready—not sent.</strong> Open your email app, review it, and send it to {company.email}.</p><textarea aria-label="Prepared inquiry email" readOnly value={draft.body} rows={6} /><div><a href={`mailto:${company.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}>Open email app ↗</a><button type="button" onClick={copyDraft}>Copy draft</button></div><p role="status">{copyStatus}</p></div>}
      </div>
      <div className="contact-details"><p>Prefer to contact us directly?</p><div><SiteLink id="contact-email" href={`mailto:${company.email}`}><Mail size={17} />{company.email}</SiteLink><SiteLink href={`tel:${company.phoneHref}`}><Phone size={17} />{company.phone}</SiteLink></div><span className="contact-presence">Dallas · Bengaluru · Supporting U.S. operations</span></div>
    </div>
  </section>
}
