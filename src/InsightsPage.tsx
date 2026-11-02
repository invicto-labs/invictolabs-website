import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, Clock3, Search } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SiteLink } from './components/SiteLink'
import NotFoundPage from './NotFoundPage'
import { blogs, caseStudies, readingMinutes, type Insight } from './data/insights'
import './insights.css'

function Meta({ item, example }: { item: Insight; example: boolean }) {
  return <div className="journal-meta"><span>{item.category}</span><span><Clock3 size={13} aria-hidden="true" /> {readingMinutes(item)} min read</span>{example && <span>Illustrative workflow</span>}</div>
}

function StoryArt({ example }: { example: boolean }) {
  return <div className={`journal-art ${example ? 'journal-art--case' : ''}`} aria-hidden="true">
    <img src={example ? '/images/traceq-client-dashboard-960.webp' : '/home-title-hero.webp'} alt="" width={example ? 960 : 1200} height={example ? 475 : 800} />
    <div className="journal-art__label"><span>{example ? 'THE OPERATING RECORD' : 'THE WORK BEHIND THE FILE'}</span><div><i />{example ? 'Order · Ownership · Next step' : 'Scope · Source · Review'}</div></div>
  </div>
}

function ResourceCTA() {
  return <section className="journal-cta container"><div><p className="eyebrow"><span /> Put the ideas to work</p><h2>Let’s talk about your workflow.</h2><p>Bring your service requirements, handoffs, and open questions. We’ll discuss where support or technology could fit.</p></div><SiteLink className="button" href="/#contact">Talk to our team <ArrowUpRight size={17} aria-hidden="true" /></SiteLink></section>
}

export default function InsightsPage({ kind }: { kind: 'blogs' | 'case-studies' }) {
  const { slug } = useParams()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const isBlog = kind === 'blogs'
  const items = isBlog ? blogs : caseStudies
  const base = isBlog ? '/blogs' : '/case-studies'
  const label = isBlog ? 'Blogs' : 'Workflow Walkthroughs'
  const selected = items.find(item => item.slug === slug)
  if (slug && !selected) return <NotFoundPage />
  const categories = ['All', ...new Set(items.map(item => item.category))]
  const filtered = items.filter(item => (category === 'All' || item.category === category) && [item.title, item.intro, item.category].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  const featured = items[isBlog ? 0 : 1]

  return <><Header /><main className="insights-page" id="main-content">
    {selected ? <>
      <section className="journal-reader-hero container">
        <SiteLink className="journal-back" href={base}>← Back to {label.toLowerCase()}</SiteLink>
        <Meta item={selected} example={!isBlog} />
        <h1>{selected.title}</h1><p>{selected.intro}</p>
        <div className="journal-byline"><span className="journal-monogram" aria-hidden="true">i</span><div><strong>Invicto editorial</strong><span>{isBlog ? 'Practical operations guide' : 'Workflow walkthrough · Not a client result'}</span></div></div>
      </section>
      <div className="journal-reader container">
        <aside className="journal-toc"><p>IN THIS {isBlog ? 'GUIDE' : 'WALKTHROUGH'}</p><nav aria-label="Article contents">{selected.sections.map((section, index) => <SiteLink href={`#reading-${index}`} key={section.title}><span>0{index + 1}</span>{section.title}</SiteLink>)}</nav>
          <div className="journal-toc__related"><span>Related capability</span><SiteLink href={selected.related.href}>{selected.related.label} <ArrowUpRight size={15} aria-hidden="true" /></SiteLink></div>
        </aside>
        <article className="journal-body">
          <div className="journal-takeaway"><p>THE ESSENTIAL IDEA</p><h2>{selected.takeaway}</h2></div>
          {!isBlog && <p className="journal-disclosure">Illustrative workflow, not a client engagement. No measured outcomes or customer endorsements are presented.</p>}
          {selected.sections.map((section, index) => <section id={`reading-${index}`} className="journal-reading-section" key={section.title}><span className="journal-section-index">0{index + 1}</span><h2>{section.title}</h2>{section.paragraphs.map(p => <p key={p}>{p}</p>)}</section>)}
          <section className="journal-checklist"><p className="eyebrow"><span /> {isBlog ? 'Keep this checklist' : 'Review checkpoints'}</p><h2>{isBlog ? 'Before the next handoff.' : 'What to validate in practice.'}</h2><ul>{selected.checklist.map(point => <li key={point}><Check size={17} aria-hidden="true" />{point}</li>)}</ul></section>
          {selected.sources && <div className="journal-sources"><h2>Further reading</h2><p>External references for additional context. These do not represent an endorsement or an Invicto certification.</p>{selected.sources.map(source => <a href={source.href} key={source.href}>{source.label} <ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>}
          <p className="journal-editorial-note">General operational information, not legal, tax, or lending advice. Scope, source availability, and review responsibilities must be confirmed for each engagement.</p>
        </article>
      </div>
      <section className="container journal-related"><p className="eyebrow"><span /> Continue reading</p><div className="journal-card-grid">{items.filter(i => i.slug !== selected.slug).slice(0, 2).map(item => <ArticleCard key={item.slug} item={item} base={base} example={!isBlog} />)}</div></section>
    </> : <>
      <section className="journal-masthead container">
        <div><p className="eyebrow"><span /> {isBlog ? 'The Invicto journal' : 'Inside the workflow'}</p><h1>{isBlog ? <>A sharper view<br />of the work.</> : <>See the process.<br /><em>Understand the possibilities.</em></>}</h1><p>{isBlog ? 'Field-level thinking for title, mortgage, and property operations. Practical guides for the people who prepare, review, and move every file forward.' : 'Detailed walkthroughs of how operational support and purpose-built technology can work together—from the first instruction to the next handoff.'}</p></div>
        <div className="journal-masthead__aside"><span>{isBlog ? 'OPERATIONAL PERSPECTIVES' : 'TRANSPARENT BY DESIGN'}</span><p>{isBlog ? 'Less noise. More context. Ideas you can bring into your next process review.' : 'These are illustrative workflows, not client success stories. Real engagement results will be published only with approval and supporting evidence.'}</p><div>{isBlog ? 'Title / Mortgage / Technology / Tax' : 'Challenge / Workflow / Review'}</div></div>
      </section>
      <section className="container journal-feature" aria-label="Featured story">
        <SiteLink className="journal-feature__link" href={`${base}/${featured.slug}`}>
          <StoryArt example={!isBlog} />
          <div className="journal-feature__copy"><p className="eyebrow"><span /> {isBlog ? 'Editor’s focus' : 'Featured walkthrough'}</p><Meta item={featured} example={!isBlog} /><h2>{featured.title}</h2><p>{featured.intro}</p><span className="journal-read">{isBlog ? 'Read the guide' : 'Explore the workflow'}<ArrowRight size={19} aria-hidden="true" /></span></div>
        </SiteLink>
      </section>
      <section className="container journal-library" aria-labelledby="library-heading">
        <div className="journal-library__head"><div><p className="eyebrow"><span /> {isBlog ? 'The reading room' : 'Workflow library'}</p><h2 id="library-heading">{isBlog ? 'Good questions. Useful answers.' : 'A closer look at the operating model.'}</h2></div>
          <label className="journal-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search {label.toLowerCase()}</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={isBlog ? 'Find a topic…' : 'Find a workflow…'} /></label>
        </div>
        <div className="journal-filter-row"><div className="journal-filters" role="group" aria-label="Filter by topic">{categories.map(topic => <button key={topic} type="button" aria-pressed={topic === category} onClick={() => setCategory(topic)}>{topic}</button>)}</div><p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'story' : 'stories'}</p></div>
        <div className="journal-card-grid">{filtered.map(item => <ArticleCard key={item.slug} item={item} base={base} example={!isBlog} />)}</div>
        {!filtered.length && <div className="journal-empty"><h3>No matching stories.</h3><p>Try another topic or clear your search.</p><button type="button" onClick={() => { setQuery(''); setCategory('All') }}>Show all stories</button></div>}
      </section>
      <section className="container journal-principle"><span>{isBlog ? 'OUR EDITORIAL APPROACH' : 'WHAT THESE WALKTHROUGHS COVER'}</span><h2>{isBlog ? <>Useful context.<br />Not inflated promises.</> : <>The work, the handoffs,<br />and the questions to ask.</>}</h2><p>{isBlog ? 'Our guides focus on practical operating decisions: what to confirm, how to organize the work, and where a reviewer needs to stay involved. They do not replace your procedures or professional advice.' : 'Each walkthrough explains an operating challenge, a possible working process, and the checkpoints a team should evaluate. No invented customer quotes, performance numbers, or completed engagements.'}</p></section>
    </>}
    <ResourceCTA />
  </main><Footer /></>
}

function ArticleCard({ item, base, example }: { item: Insight; base: string; example: boolean }) {
  return <article className="journal-card"><SiteLink href={`${base}/${item.slug}`} className="journal-card__link"><Meta item={item} example={example} /><h3>{item.title}</h3><p>{item.intro}</p><div className="journal-card__bottom"><span>{example ? 'View walkthrough' : 'Read the guide'}</span><ArrowUpRight size={20} aria-hidden="true" /></div></SiteLink></article>
}
