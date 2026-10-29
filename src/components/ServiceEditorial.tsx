import { ArrowDownRight, ArrowUpRight, Check } from 'lucide-react'
import { serviceEditorial } from '../data/serviceEditorial'
import { SiteLink } from './SiteLink'
import './ServiceEditorial.css'

export function ServiceScopeEditorial({ slug }: { slug: string }) {
  const content = serviceEditorial[slug]
  return <section className="service-editorial container" aria-labelledby="service-depth-heading">
    <div className="service-editorial__intro"><p className="eyebrow"><span /> A closer look</p><h2 id="service-depth-heading">{content.heading}</h2><p>{content.introduction}</p></div>
    <div className="service-editorial__chapters">{content.scope.map((chapter, index) => <article key={chapter.title}><div className="service-editorial__chapter-label"><span>0{index + 1} / SCOPE</span><ArrowDownRight size={25} aria-hidden="true" /></div><h3>{chapter.title}</h3><p>{chapter.description}</p><ul>{chapter.items.map(item => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul></article>)}</div>
  </section>
}

export function ServiceHandoff({ slug }: { slug: string }) {
  const content = serviceEditorial[slug]
  return <>
    <section className="service-handoff"><div className="container"><div className="service-handoff__heading"><p className="eyebrow"><span /> A shared starting point</p><h2>Good work starts<br />with a clear brief.</h2><p>Agree on the inputs and the expected handoff before the first assignment.</p></div><div className="service-handoff__grid"><article><span className="service-handoff__label">01 / FROM YOUR TEAM</span><h3>What we start with</h3><ul>{content.inputs.map(item => <li key={item}>{item}</li>)}</ul></article><article><span className="service-handoff__label">02 / BACK TO YOUR TEAM</span><h3>What the handoff includes</h3><ul>{content.outputs.map(item => <li key={item}>{item}</li>)}</ul><span className="service-handoff__review">Prepared for your review—not a substitute for it.</span></article></div></div></section>
    <section className="service-questions container"><div><p className="eyebrow"><span /> Before we begin</p><h2>The practical<br />questions.</h2><SiteLink href="#contact">Discuss your specific scope <ArrowUpRight size={18} /></SiteLink></div><div>{content.questions.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
  </>
}
