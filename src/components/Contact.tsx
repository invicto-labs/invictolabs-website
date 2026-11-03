import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { SiteLink } from './SiteLink'
import { ArrowUpRight, Mail, Phone } from 'lucide-react'
import { company } from '../data/site'
import './inquiry.css'

const topics = ['General inquiry', 'Title services', 'Mortgage services', 'Tax & property data', 'Technology services', 'TraceQ demo', 'TitleFlow AI demo', 'Tax Flow county coverage']
const routeTopics: Record<string, string> = { '/products/traceq': 'TraceQ demo', '/products/titleflow-ai': 'TitleFlow AI demo', '/products/tax-flow': 'Tax Flow county coverage', '/services/title': 'Title services', '/services/mortgage': 'Mortgage services', '/services/tax-property': 'Tax & property data', '/services/technology': 'Technology services' }

export function Contact() {
  const { pathname } = useLocation()
  return <InquiryForm key={pathname} initialTopic={routeTopics[pathname] ?? 'General inquiry'} />
}

function InquiryForm({ initialTopic }: { initialTopic: string }) {
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => { setReady(true) }, [])
  const isProduct = initialTopic.includes('demo') || initialTopic.includes('coverage')
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
  return <section className="contact contact--inquiry" id="contact" aria-labelledby="contact-heading">
    <div className="container contact-grid">
      <div className="contact-copy"><p className="eyebrow eyebrow--light"><span /> {isProduct ? 'Explore the product' : 'Start a conversation'}</p><h2 id="contact-heading">{isProduct ? 'See how it fits your team.' : 'Tell us what your team needs.'}</h2><p>{initialTopic === 'Tax Flow county coverage' ? 'Share your states, counties, and required tax fields so we can discuss source support.' : isProduct ? 'Tell us about your workflow and what you would like to see in a product demonstration.' : 'Share the service you need, the work involved, and any timing or volume requirements. We’ll use that context to discuss a suitable scope.'}</p><p className="inquiry-privacy">Please do not include borrower details, property documents, passwords, or other confidential information. This form prepares an email draft; it does not upload or send your information.</p></div>
      <div className="contact-action">
        <form className="inquiry-form" onSubmit={prepare} onChange={() => { setDraft(null); setCopyStatus('') }}>
          <p className="inquiry-required">Name, work email, company and message are required.</p>
          <fieldset disabled={!ready} onInvalid={event => { const input = event.target; if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) setErrors(previous => ({ ...previous, [input.name]: input.validationMessage })) }} onChange={event => { const input = event.target; if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) setErrors(previous => ({ ...previous, [input.name]: '' })) }}>
          <legend className="visually-hidden">Inquiry details</legend>
          <div className="inquiry-form__row"><label>Your name<input type="text" name="name" autoComplete="name" enterKeyHint="next" required maxLength={100} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'inquiry-name-error' : undefined} />{errors.name && <span id="inquiry-name-error" className="inquiry-error">{errors.name}</span>}</label><label>Work email<input name="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" required maxLength={160} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'inquiry-email-error' : undefined} />{errors.email && <span id="inquiry-email-error" className="inquiry-error">{errors.email}</span>}</label></div>
          <label>Company<input type="text" name="organization" autoComplete="organization" enterKeyHint="next" required maxLength={120} aria-invalid={errors.organization ? true : undefined} aria-describedby={errors.organization ? 'inquiry-organization-error' : undefined} />{errors.organization && <span id="inquiry-organization-error" className="inquiry-error">{errors.organization}</span>}</label>
          <label>I'm interested in<select name="topic" defaultValue={initialTopic}>{topics.map(topic => <option key={topic}>{topic}</option>)}</select></label>
          <label>How can we help?<textarea name="message" rows={3} required minLength={10} maxLength={1200} enterKeyHint="done" aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'inquiry-message-error' : undefined} placeholder="A brief outline of your workflow, scope, or demo request." />{errors.message && <span id="inquiry-message-error" className="inquiry-error">{errors.message}</span>}</label>
          <button className="contact-cta" type="submit"><span>Prepare email draft</span><ArrowUpRight size={20} aria-hidden="true" /></button>
          </fieldset>
          <noscript><p>The draft form requires JavaScript. Use the email or phone links below to contact us directly.</p></noscript>
          <SiteLink href="/privacy-policy">Read our Privacy Policy</SiteLink>
        </form>
        {draft && <div className="inquiry-draft"><p role="status"><strong>Your draft is ready—not sent.</strong> Open your email app, review it, and send it to {company.email}.</p><textarea aria-label="Prepared inquiry email" readOnly value={draft.body} rows={6} /><div><a href={`mailto:${company.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}>Open email app ↗</a><button type="button" onClick={copyDraft}>Copy draft</button></div><p role="status">{copyStatus}</p></div>}
      </div>
      <div className="contact-details"><p>Prefer to contact us directly?</p><div><SiteLink href={`mailto:${company.email}`}><Mail size={17} />{company.email}</SiteLink><SiteLink href={`tel:${company.phoneHref}`}><Phone size={17} />{company.phone}</SiteLink></div><span className="contact-presence">Dallas · Bengaluru · Supporting U.S. operations</span></div>
    </div>
  </section>
}
