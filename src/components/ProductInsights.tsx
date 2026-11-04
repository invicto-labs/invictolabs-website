import { SiteLink } from './SiteLink'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, ChevronRight, ClipboardCheck, Download, FileInput, Files, Layers3, Pause, Play, ReceiptText, SearchCheck, ShieldCheck, UsersRound } from 'lucide-react'
import './product-insights.css'
import { TitleFlowExample } from './TitleFlowConcept'
import Waves from './ui/Waves'

const titleStages = [
  { icon: FileInput, title: 'Open an order', text: 'Capture the order number, property details, and key dates.', output: 'Order record' },
  { icon: Files, title: 'Add source records', text: 'Attach deeds, mortgages, tax records, and client instructions.', output: 'Source file' },
  { icon: Layers3, title: 'AI extraction and examination', text: 'AI extracts parties and recording details from source documents. Examiners verify the results, build the deed chain, and document vesting.', output: 'Examination record' },
  { icon: ClipboardCheck, title: 'Search and check quality', text: 'Review names and gather search evidence. Check the draft against that evidence and client requirements, then resolve findings before approval.', output: 'Reviewed report' },
  { icon: Download, title: 'Export and complete', text: 'Export approved search notes, title reports, and source packages, then record completion.', output: 'Delivery package' },
]

const titleCapabilities = [
  { icon: FileInput, title: 'Manage examination orders', text: 'Save and reopen orders with property details, client instructions, and source attachments in one Windows workspace.' },
  { icon: Files, title: 'Extract from PDFs and images', text: 'Use AI to capture parties, dates, recording references, and parcel details in editable fields. Verify each value against the original page.' },
  { icon: Layers3, title: 'Organize title evidence', text: 'Build the deed chain and record vesting, legal descriptions, mortgage assignments, judgments, and tax information.' },
  { icon: SearchCheck, title: 'Prepare supporting searches', text: 'Build a reviewable list of names from deeds, mortgages, and order details, then gather the evidence the assignment requires.' },
  { icon: ClipboardCheck, title: 'Check against client requirements', text: 'Review required fields from written instructions. Use quality findings linked to source pages to resolve missing or inconsistent details before delivery.' },
  { icon: UsersRound, title: 'Track team production', text: 'In managed installations, authorized team leads can track completed orders and review production activity.' },
]

const titleDeliverables = [
  { title: 'Search notes', format: 'TXT', text: 'Search and examination details for review or handoff.' },
  { title: 'Title abstract', format: 'TXT', text: 'Structured abstract for downstream title production.' },
  { title: 'Typed title report', format: 'PDF / Word', text: 'A PDF for delivery and an editable Word document.' },
  { title: 'Source document package', format: 'PDF', text: 'A merged file of the source documents selected for the order.' },
  { title: 'Assessor and tax packages', format: 'PDF', text: 'Separate packages when the corresponding records are attached.' },
  { title: 'Cost worksheet', format: 'PDF', text: 'An order cost summary when county pricing is configured.' },
  { title: 'Deliverables bundle', format: 'ZIP', text: 'Generated files together in one download.' },
]

export function ProductInsights({ kind }: { kind: 'title' | 'tax' }) {
  const workflowRef = useRef<HTMLOListElement>(null)
  const [workflowPaused, setWorkflowPaused] = useState(false)

  useEffect(() => {
    const workflow = workflowRef.current
    if (!workflow || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle('titleflow-workflow__step--offscreen', entry.intersectionRatio < 0.2)
      }
    }, { threshold: 0.2 })
    for (const stage of workflow.children) observer.observe(stage)
    return () => observer.disconnect()
  }, [kind])

  if (kind === 'title') return (
    <>
      <section className="titleflow-editorial" id="titleflow-workflow" aria-labelledby="titleflow-workflow-heading" data-workflow-motion={workflowPaused ? 'paused' : 'running'}>
        <div className="titleflow-workflow__waves" aria-hidden="true">
          <svg className="titleflow-workflow__wave-ribbons" viewBox="0 0 1440 640" preserveAspectRatio="none" focusable="false">
            <g>
              <path d="M-100 414 C168 310 326 548 564 491 S870 347 1091 445 S1346 539 1540 403 V670 H-100Z" fill="#d7e7ff" />
              <path d="M-100 478 C177 373 323 584 574 520 S865 399 1094 489 S1369 575 1540 456 V670 H-100Z" fill="#c6dcfb" />
              <path d="M-100 417 C168 313 326 551 564 494 S870 350 1091 448 S1346 542 1540 406 M-100 446 C170 344 324 551 569 500 S867 361 1093 461 S1354 548 1540 430 M-100 477 C177 372 323 583 574 519 S865 398 1094 488 S1369 574 1540 455 M-100 504 C182 400 325 609 578 542 S861 426 1099 510 S1376 594 1540 482" fill="none" stroke="#709bd8" strokeWidth="1.65" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <Waves
            lineColor="#628bd1"
            accentColor="#7369c8"
            rotation={76}
            spacing={14}
            lineWidth={1.35}
            amplitude={44}
            speed={0.6}
            opacity={0.75}
            fade={0.16}
            dpr={1}
            intro={false}
            mouseStrength={0.45}
            clickRipple={false}
            paused={workflowPaused}
          />
        </div>
        <div className="container">
          <header>
            <p className="titleflow-kicker">THE WORKING PROCESS</p>
            <h2 id="titleflow-workflow-heading">From order intake to delivery</h2>
            <p>Follow five steps through evidence collection, examination, quality review, and export.</p>
          </header>
          <ol className="titleflow-workflow" role="list" ref={workflowRef}>
            {titleStages.map(({ icon: Icon, title, text, output }, index) => (
              <li className="titleflow-workflow__step" key={title} style={{ '--titleflow-stage-index': index } as CSSProperties}>
                <div className="titleflow-workflow__card">
                  <div className="titleflow-workflow__marker"><Icon size={20} aria-hidden="true" /><span aria-hidden="true">Step 0{index + 1}</span></div>
                  <div><h3>{title}</h3><p>{text}</p></div>
                  <div className="titleflow-workflow__output"><small>Output</small><strong>{output}</strong></div>
                </div>
                {index < titleStages.length - 1 && (
                  <span className="titleflow-workflow__connector" aria-hidden="true">
                    <ChevronRight size={14} />
                    <span className="titleflow-workflow__signal"><ArrowRight size={17} /></span>
                  </span>
                )}
              </li>
            ))}
          </ol>
          <button className="titleflow-workflow__motion" type="button" onClick={() => setWorkflowPaused(paused => !paused)}>
            {workflowPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            {workflowPaused ? 'Play animation' : 'Pause animation'}
          </button>
        </div>
      </section>
      <section className="titleflow-editorial titleflow-editorial--capabilities" aria-labelledby="titleflow-capabilities-heading">
        <div className="container">
          <header>
            <p className="titleflow-kicker">WORKSPACE CAPABILITIES</p>
            <h2 id="titleflow-capabilities-heading">What teams can do in TitleFlow AI</h2>
            <p>Built for title agencies, search and abstracting providers, and the production teams that review their work.</p>
          </header>
          <div className="titleflow-capabilities">
            {titleCapabilities.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={20} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="titleflow-editorial titleflow-editorial--example" id="ai-quality" aria-labelledby="ai-quality-heading">
        <div className="container">
          <header>
            <p className="titleflow-kicker">SOURCE VERIFICATION</p>
            <h2 id="ai-quality-heading">What the reviewer checks</h2>
            <p>See how a reviewer compares a working record with its source using a fictional property file.</p>
          </header>
          <TitleFlowExample />
        </div>
      </section>
      <section className="titleflow-editorial" aria-labelledby="titleflow-deliverables-heading">
        <div className="container">
          <div className="titleflow-deliverables">
            <div>
              <p className="titleflow-kicker">REPORTS AND PACKAGES</p>
              <h2 id="titleflow-deliverables-heading">What clients can receive</h2>
              <p>Choose the deliverables for each assignment. Client instructions can guide which additional fields appear in the notes, abstract, or report.</p>
            </div>
            <ul role="list">
              {titleDeliverables.map(({ title, format, text }) => (
                <li key={title}>
                  <div><h3>{title}</h3><p>{text}</p></div>
                  <span>{format}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="titleflow-walkthrough">
            <div>
              <p className="titleflow-kicker">PRIVATE DEMO</p>
              <h2>See TitleFlow AI on a sample order</h2>
              <p>Tell us what your team examines and what clients expect to receive. We’ll use a sample order to walk through source review, quality checks, and report preparation.</p>
            </div>
            <SiteLink className="button" href="/#contact">Request a private demo <ArrowRight size={18} aria-hidden="true" /></SiteLink>
          </div>
        </div>
      </section>
    </>
  )

  return (
    <section className="section taxflow-section" id="tax-flow" aria-labelledby="taxflow-heading">
      <div className="container">
        <div className="product-heading-v2">
          <div><p className="eyebrow"><span /> Product 03 · Tax Flow</p><h2 id="taxflow-heading">Three details.<br />A clearer tax picture.</h2></div>
          <div><p>A property-tax retrieval application built for U.S. mortgage operations. Supply the parcel number, state, and county, and Tax Flow automates the lookup of available property-tax information from supported sources.</p><SiteLink href="/#contact">Discuss your county coverage <ArrowRight size={17} aria-hidden="true" /></SiteLink></div>
        </div>
        <div className="taxflow-workspace">
          <div className="taxflow-lookup" aria-label="Illustration of the Tax Flow lookup process">
            <div className="taxflow-lookup__head"><ReceiptText size={23} aria-hidden="true" /><strong>Tax Flow</strong><span>WORKFLOW PREVIEW</span></div>
            <p className="taxflow-overline">START WITH THE PROPERTY</p>
            <div className="taxflow-fields"><div><small>Parcel number</small><strong>Your property’s parcel ID</strong></div><div><small>State</small><strong>Select state</strong></div><div><small>County</small><strong>Select county</strong></div></div>
            <div className="taxflow-transfer" aria-hidden="true"><i /><span>Automated source lookup</span><i /></div>
            <div className="taxflow-result"><ShieldCheck size={24} aria-hidden="true" /><div><strong>Property-tax information</strong><p>Available source records, ready for your team to review.</p></div></div>
            <small className="taxflow-preview-note">Illustrative workflow. This website does not run a live property search.</small>
          </div>
          <div className="taxflow-steps">
            {[
              ['01', 'Identify the right property', 'The parcel number identifies the property; state and county establish the jurisdiction for the lookup.'],
              ['02', 'Let retrieval do the repetitive work', 'Automated browser-based lookup handles the search on supported tax sources, reducing the need to navigate each source manually.'],
              ['03', 'Review with the source in mind', 'Your team checks the returned information for the mortgage file. Available fields and freshness depend on the underlying source.'],
            ].map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </div>
        <p className="taxflow-coverage">Planning a rollout? Share your states, counties, and required tax fields so we can confirm source support and the right workflow for your team.</p>
      </div>
    </section>
  )
}
