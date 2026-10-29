import { SiteLink } from './components/SiteLink'
import { useState } from 'react'
import { ArrowRight, ChevronDown, FileCheck2, Handshake, Layers3 } from 'lucide-react'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { DeferredDottedSurface as DottedSurface } from './components/DeferredDottedSurface'
import { GridBoxBackground } from './components/ui/GridBoxBackground'
import { clientExperience, company, faqs } from './data/site'

const experienceIcons = [FileCheck2, Layers3, Handshake]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <>
      <Header />
      <main className="faq-page" id="main-content">
        <section className="faq-hero" id="top" aria-labelledby="faq-heading">
          <div className="faq-hero__surface" aria-hidden="true">
            <DottedSurface size={8} opacity={0.92} sizeAttenuation vertexColors />
          </div>
          <div className="container faq-hero__inner">
            <p className="eyebrow"><span /> Client FAQ</p>
            <h1 id="faq-heading">The questions behind a confident partnership.</h1>
            <p>Clear answers about coverage, quality, workflow integration, and what it takes to get started with Invicto.</p>
            <div className="faq-hero__signals" aria-label="Invicto operating highlights">
              <span><strong>06</strong> practical answers</span>
              <span><strong>Clear</strong> engagement scope</span>
              <span><strong>Human</strong> reviewed delivery</span>
            </div>
          </div>
        </section>

        <section className="section faq-section" aria-labelledby="faq-list-heading">
          <GridBoxBackground />
          <div className="container faq-layout">
            <aside className="faq-aside">
              <p className="eyebrow"><span /> Before we begin</p>
              <h2 id="faq-list-heading">Start with clarity.</h2>
              <p>Every engagement is shaped around the client’s workflow, service levels, volume, and definition of done.</p>
              <SiteLink href={`mailto:${company.email}`}>
                Ask another question <ArrowRight size={17} />
              </SiteLink>
            </aside>

            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index
                return (
                  <article className={`faq-item${isOpen ? ' faq-item--open' : ''}`} key={faq.question}>
                    <button
                      id={`faq-question-${index}`}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    >
                      <span>0{index + 1}</span>
                      <strong>{faq.question}</strong>
                      <i><ChevronDown size={20} aria-hidden="true" /></i>
                    </button>
                    <div
                      className="faq-item__answer"
                      id={`faq-answer-${index}`}
                      hidden={!isOpen}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                    >
                      <div><p>{faq.answer}</p></div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section client-experience" aria-labelledby="experience-heading">
          <div className="container">
            <div className="client-experience__head">
              <div>
                <p className="eyebrow eyebrow--light"><span /> Client experience</p>
                <h2 id="experience-heading">What the partnership is designed to feel like.</h2>
              </div>
              <p>The principles that guide how we organize work, communicate exceptions, and support your team.</p>
            </div>
            <div className="client-experience__grid">
              {clientExperience.map((item, index) => {
                const Icon = experienceIcons[index]
                return (
                  <article key={item.title}>
                    <div><Icon size={21} /><span>0{index + 1}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <small>{item.outcome}</small>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  )
}
