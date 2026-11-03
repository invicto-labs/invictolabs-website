import { SiteLink } from './components/SiteLink'
import { lazy, Suspense, useEffect, useRef } from 'react'
import {
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  Bot,
  ClipboardCheck,
  FileInput,
  Gauge,
  Layers3,
  ReceiptText,
  UsersRound,
  Workflow,
} from 'lucide-react'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { GridBoxBackground } from './components/ui/GridBoxBackground'
const LazyRings = lazy(() => import('./components/ui/MagicRings').then(module => ({ default: module.MagicRings })))
function MagicRings(props: React.ComponentProps<typeof LazyRings>) {
  return <Suspense fallback={null}><LazyRings {...props} /></Suspense>
}
import { ProductInsights } from './components/ProductInsights'
import { ProductHeroVisual } from './components/ProductHeroVisual'
import { TaxFlowExperience } from './components/TaxFlowExperience'
import { TraceQGallery } from './components/TraceQGallery'
import './products-stack.css'
// Keep the shells mounted before the scroll effect captures them. A lazy
// fallback can be replaced after that effect runs, leaving detached targets.
import TiltedCard from './components/ui/TiltedCard'

const workflowStages = ['Order intake', 'Assignment', 'Production', 'Quality review', 'Invoice ready']

const traceQCapabilities = [
  { icon: FileInput, title: 'Order placement', description: 'Bring title-search orders into one structured operating queue.' },
  { icon: Layers3, title: 'Workflow levels', description: 'Define stages, ownership, handoffs, and review checkpoints.' },
  { icon: UsersRound, title: 'Workforce tracking', description: 'Connect assignments and employee activity to active production.' },
  { icon: Gauge, title: 'Productivity visibility', description: 'See how work moves without relying on disconnected trackers.' },
  { icon: ClipboardCheck, title: 'Quality oversight', description: 'Keep review status and workflow exceptions visible before delivery.' },
  { icon: ReceiptText, title: 'Invoice generation', description: 'Carry completed activity into an organized billing workflow.' },
]

type ProductName = 'traceq' | 'titleflow-ai' | 'tax-flow'
const productIntroductions = {
  traceq: { name: 'TraceQ', label: 'OPERATIONS, CONNECTED', headline: 'Every order. Every handoff. One clear view.', description: 'Give your people a shared operating picture. TraceQ connects title-search orders, team assignments, production activity, quality checkpoints, and invoicing.', action: 'Explore the workflow', target: '#traceq' },
  'titleflow-ai': { name: 'TitleFlow AI', label: 'AI-ASSISTED TITLE EXAMINATION', headline: <>From source records to <span className="titleflow-headline-accent">review-ready</span> title reports.</>, description: 'Give title examiners one workspace to organize deeds, mortgages, and tax records, verify AI-extracted details against the original pages, and prepare reports for delivery.', action: 'Request a private demo', target: '/#contact' },
  'tax-flow': { name: 'Tax Flow', label: 'PROPERTY TAX RESEARCH', headline: 'From parcel to a clearer tax record.', description: 'Enter a parcel number, state, and county. Tax Flow retrieves available property-tax information from supported sources and brings it into a structured certificate for your team to review.', action: 'Explore the workflow', target: '#tax-flow' },
}

export default function ProductsPage({ product }: { product?: ProductName }) {
  const introduction = product ? productIntroductions[product] : null
  const revealRef = useRef<HTMLElement>(null)
  const revealStageRef = useRef<HTMLDivElement>(null)
  const productDeckRef = useRef<HTMLDivElement>(null)
  const revealProgressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = revealRef.current
    const stage = revealStageRef.current
    const deck = productDeckRef.current
    if (!section || !stage || !deck) return

    const cards = Array.from(deck.querySelectorAll<HTMLElement>('.product-tilt-shell'))
    const revealMedia = window.matchMedia('(min-width: 1100px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)')
    let frame = 0

    const showExpanded = () => {
      section.classList.remove('product-reveal-v3--deck-ready')
      section.style.setProperty('--product-reveal-progress', '1')
      cards.forEach((card) => {
        card.style.setProperty('--product-card-x', '0px')
        card.style.setProperty('--product-card-y', '0px')
        card.style.setProperty('--product-card-rotate', '0deg')
        card.style.setProperty('--product-card-scale', '1')
        card.style.removeProperty('z-index')
      })
      if (revealProgressRef.current) revealProgressRef.current.textContent = 'OPEN'
    }

    const updateDeck = () => {
      frame = 0
      if (!revealMedia.matches) {
        showExpanded()
        return
      }

      section.classList.add('product-reveal-v3--deck-ready')
      const stickyOffset = 82
      const stickyHeight = window.innerHeight - stickyOffset
      const travel = Math.max(1, section.offsetHeight - stickyHeight)
      const rawProgress = (stickyOffset - section.getBoundingClientRect().top) / travel
      const progress = Math.min(1, Math.max(0, rawProgress))
      const easedProgress = progress * progress * (3 - 2 * progress)
      const remaining = 1 - easedProgress
      const deckCenter = deck.clientWidth / 2

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const collapsedX = deckCenter - cardCenter
        const collapsedY = index * 14
        const collapsedRotation = (index - (cards.length - 1) / 2) * 3.4
        const collapsedScale = 1 - index * 0.025

        card.style.setProperty('--product-card-x', `${collapsedX * remaining}px`)
        card.style.setProperty('--product-card-y', `${collapsedY * remaining}px`)
        card.style.setProperty('--product-card-rotate', `${collapsedRotation * remaining}deg`)
        card.style.setProperty('--product-card-scale', `${1 - (1 - collapsedScale) * remaining}`)
        card.style.zIndex = `${cards.length - index}`
      })

      section.style.setProperty('--product-reveal-progress', `${progress}`)
      if (revealProgressRef.current) {
        revealProgressRef.current.textContent = progress > 0.96 ? 'OPEN' : `${Math.round(progress * 100).toString().padStart(2, '0')}%`
      }
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateDeck)
    }

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    revealMedia.addEventListener('change', requestUpdate)
    requestUpdate()

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      revealMedia.removeEventListener('change', requestUpdate)
    }
  }, [product])

  return (
    <>
      <Header />
      <main className={`products-page products-v2${product ? ` product-detail product-detail--${product}` : ' products-overview-stack'}`} id="main-content">
        {introduction && <section className="product-detail-hero" id="top">
          <div className="container">
            <SiteLink className="product-back" href="/products#product-system">← All products</SiteLink>
            <div className="product-detail-hero__grid">
              <div>
                <p className="eyebrow"><span /> {introduction.label}</p>
                <div className="product-live"><i /> LIVE PRODUCT · {introduction.name}</div>
                <h1>{introduction.headline}</h1>
                <p className="product-detail-hero__description">{introduction.description}</p>
                <div className="product-detail-hero__actions">
                  <SiteLink className="button" href={introduction.target}>{introduction.action}<ArrowRight size={18} aria-hidden="true" /></SiteLink>
                  {product === 'titleflow-ai' && <SiteLink className="titleflow-secondary" href="#titleflow-workflow">See how it works <ArrowDown size={17} aria-hidden="true" /></SiteLink>}
                </div>
              </div>
              {product && <ProductHeroVisual product={product} />}
            </div>
          </div>
        </section>}
        {!product && <>
        <section className="product-hero-v3" id="top" aria-labelledby="products-heading">
          <div className="product-hero-v3__rings" aria-hidden="true">
            <MagicRings
              color="#173fd8"
              colorTwo="#7c97ff"
              ringCount={8}
              speed={0.54}
              attenuation={12}
              lineThickness={1.65}
              baseRadius={0.19}
              radiusStep={0.073}
              scaleRate={0.1}
              opacity={0.58}
              noiseAmount={0.018}
              rotation={-12}
              ringGap={1.16}
              fadeIn={0.68}
              fadeOut={0.5}
              followMouse
              mouseInfluence={0.075}
              hoverScale={1.045}
              parallax={0.016}
              clickBurst
            />
          </div>
          <div className="product-hero-v3__wash" aria-hidden="true" />

          <div className="container product-hero-v3__inner">
            <p className="eyebrow"><span /> Invicto product systems</p>
            <h1 id="products-heading">Technology built around the work.</h1>
            <p>
              Coordinate the operation with TraceQ. Prepare and review title files with TitleFlow AI. Retrieve property-tax information with Tax Flow. Purpose-built tools for the people behind every property file.
            </p>
            <SiteLink className="button product-hero-v3__button" href="#product-system">
              Open the product system <ArrowRight size={18} aria-hidden="true" />
            </SiteLink>
            <div className="product-hero-v3__signals" aria-label="Invicto product highlights">
              <span><strong>03</strong> focused products</span>
              <span><strong>One</strong> operational purpose</span>
              <span><strong>Human</strong> review stays central</span>
            </div>
          </div>
          <SiteLink className="product-hero-v3__scroll" href="#product-system" aria-label="Scroll to explore the product system">
            <span>Scroll to open</span><i><b /></i>
          </SiteLink>
        </section>

        <section
          ref={revealRef}
          className="product-reveal-v3"
          id="product-system"
          aria-labelledby="product-system-heading"
        >
          <div ref={revealStageRef} className="product-reveal-v3__stage">
            <GridBoxBackground />
            <div className="container product-reveal-v3__inner">
              <div className="product-reveal-v3__head">
                <p className="eyebrow"><span /> The product direction</p>
                <h2 id="product-system-heading">Three products. More room for expertise.</h2>
                <p>Explore the tools behind order management, title preparation, and property-tax research.</p>
              </div>

              <div ref={productDeckRef} className="product-reveal-v3__deck">
                <TiltedCard><SiteLink className="product-reveal-card product-reveal-card--traceq" href="/products/traceq">
                  <div className="product-reveal-card__top">
                    <span>01 / Operations platform</span>
                    <i><Workflow size={22} aria-hidden="true" /></i>
                  </div>
                  <div className="product-reveal-card__copy">
                    <small>LIVE · IN-HOUSE PLATFORM</small>
                    <h3>TraceQ</h3>
                    <p>One connected operating record for orders, assignments, production, quality, productivity, and invoicing.</p>
                  </div>
                  <ul aria-label="TraceQ focus areas">
                    <li>Order flow</li><li>Workforce</li><li>Billing</li>
                  </ul>
                  <span className="product-reveal-card__link">Explore TraceQ <ArrowRight size={18} aria-hidden="true" /></span>
                </SiteLink></TiltedCard>

                <TiltedCard><SiteLink className="product-reveal-card product-reveal-card--quality" href="/products/titleflow-ai">
                  <div className="product-reveal-card__top">
                    <span>02 / Quality intelligence</span>
                    <i><Bot size={22} aria-hidden="true" /></i>
                  </div>
                  <div className="product-reveal-card__copy">
                    <small>LIVE · AI PREPARES · PEOPLE REVIEW</small>
                    <h3>TitleFlow AI</h3>
                    <p>From source documents to structured reports: AI-assisted extraction, typing, and quality checks in one title-production workspace.</p>
                  </div>
                  <ul aria-label="AI quality workflow focus areas">
                    <li>Compare</li><li>Surface</li><li>Review</li>
                  </ul>
                  <span className="product-reveal-card__link">Explore TitleFlow AI <ArrowRight size={18} aria-hidden="true" /></span>
                </SiteLink></TiltedCard>
                <TiltedCard><SiteLink className="product-reveal-card product-reveal-card--tax" href="/products/tax-flow">
                  <div className="product-reveal-card__top"><span>03 / Property-tax research</span><i><ReceiptText size={22} aria-hidden="true" /></i></div>
                  <div className="product-reveal-card__copy">
                    <small>LIVE · PROPERTY-TAX RETRIEVAL</small>
                    <h3>Tax Flow</h3>
                    <p>Enter a parcel number, state, and county. Let automated retrieval bring the property’s available tax information into focus.</p>
                  </div>
                  <ul aria-label="Tax Flow focus areas"><li>Identify</li><li>Retrieve</li><li>Review</li></ul>
                  <span className="product-reveal-card__link">Explore Tax Flow <ArrowRight size={18} aria-hidden="true" /></span>
                </SiteLink></TiltedCard>
              </div>

              <div className="product-reveal-v3__progress" aria-hidden="true">
                <span>Closed</span><i><b /></i><span ref={revealProgressRef}>00%</span>
              </div>
            </div>
          </div>
        </section>

        </>}
        {product === 'traceq' && <section className="section traceq-v2" id="traceq" aria-labelledby="traceq-heading">
          <div className="container">
            <div className="traceq-overview">
              <div>
                <p className="eyebrow"><span /> Connected operations</p>
                <h2 id="traceq-heading">From intake to invoice.<br /><span>One connected workspace.</span></h2>
              </div>
              <div>
                <p>TraceQ is Invicto’s in-house application platform for coordinating title-search production—bringing orders, people, progress, quality, and billing into one connected operating view.</p>
                <SiteLink className="traceq-overview__link" href="https://traceqlabs.com/" target="_blank" rel="noreferrer">
                  Visit TraceQ Labs <ArrowUpRight size={17} aria-hidden="true" />
                </SiteLink>
              </div>
              <div className="traceq-overview__capabilities">
                <article><FileInput size={21} aria-hidden="true" /><div><h3>Follow every order</h3><p>Assignments, stages, and due dates in context.</p></div></article>
                <article><UsersRound size={21} aria-hidden="true" /><div><h3>See the team picture</h3><p>Attendance and productivity, brought together.</p></div></article>
                <article><ClipboardCheck size={21} aria-hidden="true" /><div><h3>Keep quality visible</h3><p>Findings and review detail for focused follow-up.</p></div></article>
              </div>
            </div>

            <section className="traceq-client-view" id="traceq-client-view" aria-labelledby="traceq-client-heading">
              <div className="traceq-showcase-heading"><h3 id="traceq-client-heading">Inside the workspace</h3><p>Explore the views behind your day-to-day operations.</p></div>
              <TraceQGallery />
            </section>
            <div className="traceq-system-v2">
              <div className="traceq-spine" aria-label="Conceptual TraceQ operating workflow">
                <div className="traceq-spine__bar">
                  <span><b /> TRACEQ / OPERATIONS</span>
                  <small><i /> Connected workflow</small>
                </div>
                <div className="traceq-spine__intro">
                  <div><small>One order</small><strong>One connected operating record</strong></div>
                  <span>INTAKE → DELIVERY</span>
                </div>
                <div className="traceq-spine__track">
                  {workflowStages.map((stage, index) => (
                    <article key={stage}>
                      <span>0{index + 1}</span>
                      <i><b /></i>
                      <strong>{stage}</strong>
                    </article>
                  ))}
                </div>
                <div className="traceq-spine__signals">
                  <article><UsersRound size={18} aria-hidden="true" /><span><small>People</small><strong>Ownership follows the order</strong></span></article>
                  <article><ClipboardCheck size={18} aria-hidden="true" /><span><small>Quality</small><strong>Review stays visible</strong></span></article>
                  <article><ReceiptText size={18} aria-hidden="true" /><span><small>Billing</small><strong>Completed work moves forward</strong></span></article>
                </div>
                <div className="traceq-spine__ticker" aria-hidden="true">
                  <span>ORDER</span><i /> <span>OWNER</span><i /> <span>STATUS</span><i /> <span>QUALITY</span><i /> <span>INVOICE</span>
                </div>
              </div>

              <div className="traceq-ledger">
                <div className="traceq-ledger__head"><span>Platform capabilities</span><small>06 / connected</small></div>
                {traceQCapabilities.map(({ icon: Icon, title, description }, index) => (
                  <article key={title}>
                    <span className="traceq-ledger__number">0{index + 1}</span>
                    <span className="traceq-ledger__icon"><Icon size={18} aria-hidden="true" /></span>
                    <span><strong>{title}</strong><p>{description}</p></span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>}

        {product === 'titleflow-ai' && <ProductInsights kind="title" />}
        {product === 'tax-flow' && <TaxFlowExperience />}
        {product && <nav className="product-siblings container" aria-label="Explore other products"><span>Explore the product family</span>{(Object.keys(productIntroductions) as ProductName[]).map(key => <SiteLink key={key} href={`/products/${key}`} aria-current={product === key ? 'page' : undefined}>{productIntroductions[key].name}<ArrowUpRight size={16} /></SiteLink>)}</nav>}
        {product !== 'titleflow-ai' && <div className="products-contact-wave">
          <div className="products-contact-wave__surface" aria-hidden="true" />
          <Contact />
        </div>}
      </main>
      <Footer />
    </>
  )
}

export function TraceQPage() { return <ProductsPage product="traceq" /> }
export function TitleFlowPage() { return <ProductsPage product="titleflow-ai" /> }
export function TaxFlowPage() { return <ProductsPage product="tax-flow" /> }
