import { useRef, useState, type KeyboardEvent } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CheckCircle2, Compass, Network, Rocket, SearchCheck, TrendingUp } from 'lucide-react'
import { approach } from '../data/site'
import { SiteLink } from './SiteLink'
import './approach-experience.css'
import '../insights.css'

const linkedin = 'https://www.linkedin.com/company/invictolabs/posts/?feedView=all'
const phases = [
  { icon: SearchCheck, label: 'Understand the work.', detail: 'Start with the way your team operates today. Map the assignment, the information available, and the constraints that shape delivery.', items: ['Review tasks, inputs, and current handoffs', 'Identify scope, dependencies, and exceptions', 'Agree what the first assignment should cover'], output: 'An initial scope for your team to review', group: 'Build the foundation' },
  { icon: Compass, label: 'Define what good looks like.', detail: 'Turn expectations into a shared working brief, so your team and ours have the same reference point for every handoff.', items: ['Set the review checklist and delivery format', 'Clarify decision owners and responsibilities', 'Agree priorities and timing requirements'], output: 'A shared checklist and delivery brief', group: 'Build the foundation' },
  { icon: Network, label: 'Connect to your workflow.', detail: 'Establish the access and communication needed to work together. Make the route for questions and exceptions clear from the start.', items: ['Confirm authorized access to relevant systems', 'Establish communication channels', 'Identify escalation contacts'], output: 'A defined access and communication plan', group: 'Build the foundation' },
  { icon: Rocket, label: 'Start focused. Learn early.', detail: 'Begin with an agreed initial assignment. Review the output together and use that feedback to refine the work before expanding its scope.', items: ['Launch the initial assignment', 'Review the output against the agreed checklist', 'Resolve feedback before expanding scope'], output: 'A reviewed first delivery and next steps', group: 'Keep the work moving' },
  { icon: CheckCircle2, label: 'Make every handoff clear.', detail: 'Prepare work in the agreed format, with outstanding items visible. Give your team the context it needs to take the next step.', items: ['Prepare the agreed deliverables', 'Identify outstanding items and exceptions', 'Route the work to the designated reviewer'], output: 'Prepared work with clear review notes', group: 'Keep the work moving' },
  { icon: TrendingUp, label: 'Improve with every cycle.', detail: 'Keep the working relationship responsive. Use delivery feedback to revisit instructions, priorities, and capacity as your needs change.', items: ['Review feedback from completed work', 'Refine instructions and priorities', 'Revisit scope and capacity requirements'], output: 'Updated instructions for the next cycle', group: 'Keep the work moving' },
]

export function ApproachExperience() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % phases.length
    else if (event.key === 'ArrowLeft') next = (index + phases.length - 1) % phases.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = phases.length - 1
    else return
    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return <>
    <section className="ap-hero" aria-labelledby="ap-heading">
      <div className="container">
        <div className="ap-hero-grid">
          <div className="ap-hero-copy">
            <p className="ap-eyebrow"><span /> THE INVICTO APPROACH</p>
            <h1 id="ap-heading">Your workflow.<br />Our expertise.<br /><em>One team.</em></h1>
            <p className="ap-lead">From the first conversation to the next delivery, we build around the way you work. Clear responsibilities. Connected people. Room to grow.</p>
            <div className="ap-actions"><SiteLink className="ap-button" href="#contact">Build your delivery plan <ArrowUpRight size={18} /></SiteLink><SiteLink className="ap-text-link" href="#working-method">Explore the process <ArrowDown size={16} /></SiteLink></div>
          </div>
          <div className="ap-map" aria-label="Six connected steps, from discovery to continuous improvement">
            <div className="ap-map-heading"><span className="ap-status-dot" /> A SHARED OPERATING RHYTHM <span>01—06</span></div>
            <div className="ap-map-center"><span>YOUR TEAM + INVICTO</span><strong>Connected from<br />day one.</strong><p>One method. Six connected moves.</p></div>
            <ol className="ap-map-steps">{approach.map((step, index) => {
              const Icon = phases[index].icon
              return <li key={step.number}><span className="ap-map-number">{step.number}</span><Icon size={19} aria-hidden="true" /><span>{step.title}</span></li>
            })}</ol>
            <div className="ap-map-return"><TrendingUp size={15} /> Feedback informs the next cycle <span>↗</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="ap-method" id="working-method" aria-labelledby="ap-method-heading">
      <div className="container">
        <div className="ap-section-heading"><div><p className="ap-eyebrow"><span /> HOW WE WORK TOGETHER</p><h2 id="ap-method-heading">A clear path.<br /><span>At every step.</span></h2></div><p>Know where we start, what happens next, and what your team receives. Explore each stage of the working relationship.</p></div>
        <div className="ap-tabs" role="tablist" aria-label="Stages of our approach">{approach.map((step, index) => <button key={step.number} type="button" role="tab" id={`ap-tab-${index}`} aria-controls={`ap-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} ref={element => { tabs.current[index] = element }} onClick={() => setActive(index)} onKeyDown={event => onTabKey(event, index)}><span>{step.number}</span>{step.title}<ArrowRight size={16} aria-hidden="true" /></button>)}</div>
        {phases.map((phase, index) => {
          const Icon = phase.icon
          return <div className="ap-phase" key={phase.label} id={`ap-panel-${index}`} role="tabpanel" aria-labelledby={`ap-tab-${index}`} tabIndex={0} hidden={active !== index}>
            <div className="ap-phase-copy"><div className="ap-phase-kicker"><Icon size={21} aria-hidden="true" /><span>{phase.group}</span><span>{approach[index].number} / 06</span></div><h3>{phase.label}</h3><p>{phase.detail}</p><div className="ap-phase-output"><span>THE HANDOFF</span><strong>{phase.output}</strong><ArrowUpRight size={21} aria-hidden="true" /></div></div>
            <div className="ap-phase-checklist"><p>What this looks like</p><ul>{phase.items.map(item => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul><div className="ap-phase-bottom"><span>Clarity before the next step.</span><button type="button" onClick={() => { const next = (active + 1) % phases.length; setActive(next); tabs.current[next]?.focus() }}>{active === 5 ? 'Back to Discover' : `Next: ${approach[active + 1].title}`}<ArrowRight size={16} /></button></div></div>
          </div>
        })}
      </div>
    </section>

    <section className="ap-article" aria-labelledby="ap-perspective-heading">
      <div className="container ap-article-heading">
        <p className="ap-eyebrow"><span /> THE APPROACH IN PRACTICE</p>
        <div className="journal-meta"><span>Title operations</span><span>Perspectives from our LinkedIn</span></div>
        <h2 id="ap-perspective-heading">More capacity begins with<br />a connected way of working.</h2>
        <p>Production support works best when people understand the assignment, the review expectations, and the next handoff. Here’s how that thinking connects to the priorities Invicto shares with the title industry.</p>
        <div className="journal-byline"><span className="journal-monogram" aria-hidden="true">i</span><div><strong>Invicto editorial</strong><span>Adapted from Invicto’s public LinkedIn updates</span></div></div>
      </div>
      <div className="container journal-reader">
        <aside className="journal-toc"><p>IN THIS PERSPECTIVE</p><nav aria-label="Title operations article contents">
          <SiteLink href="#approach-capacity"><span>01</span>Capacity that follows demand</SiteLink>
          <SiteLink href="#approach-quality"><span>02</span>Quality alongside turnaround</SiteLink>
          <SiteLink href="#approach-continuity"><span>03</span>Continuity in your workflow</SiteLink>
        </nav><div className="journal-toc__related"><span>More from Invicto</span><SiteLink href="/blogs">Explore our blogs <ArrowUpRight size={15} aria-hidden="true" /></SiteLink></div></aside>
        <article className="journal-body" aria-labelledby="ap-perspective-heading">
          <section className="journal-reading-section" id="approach-capacity"><span className="journal-section-index">01</span><h3>Build capacity around the work.</h3>
            <p>Order volume can change faster than a team can recruit and train. In its LinkedIn updates, Invicto describes flexible production support across title search, examination, and commitment work, covering both daily orders and periods of higher demand.</p>
            <p>Our approach starts by defining the assignment and agreeing on an initial scope. Reviewing that first delivery together gives both teams a practical basis for deciding what to refine and where to expand support.</p>
          </section>
          <section className="journal-reading-section" id="approach-quality"><span className="journal-section-index">02</span><h3>Keep quality and turnaround in the same conversation.</h3>
            <p>Invicto’s public title-production updates report 98% on-time delivery, an average turnaround of 8–12 hours, and two-layer quality control. They also describe experienced human examiners as part of the production support model.</p>
            <p>These are company-reported figures. The posts do not specify a measurement period or sample size, and the figures are not a turnaround commitment for every assignment. Timing, scope, and review expectations are agreed for each engagement.</p>
          </section>
          <section className="journal-reading-section" id="approach-continuity"><span className="journal-section-index">03</span><h3>Make support part of your operating rhythm.</h3>
            <p>Invicto describes nationwide support for current-owner, two-owner, full, and update searches within a client’s existing workflow. The emphasis is on adding production support while keeping the team connected to its established process.</p>
            <p>That is why integration is a distinct step in our method. Authorized access, communication channels, and escalation contacts are confirmed before activation. As work moves forward, delivery feedback helps us refine instructions, priorities, and capacity requirements.</p>
          </section>
          <div className="journal-sources"><h3>Source and further reading</h3><p>This perspective paraphrases Invicto’s public updates on title-production capacity, quality control, and search support.</p><a href={linkedin} target="_blank" rel="noopener noreferrer">Read Invicto’s LinkedIn updates <ArrowUpRight size={14} aria-hidden="true" /></a><SiteLink href="/services/title">Explore title services <ArrowUpRight size={14} aria-hidden="true" /></SiteLink></div>
        </article>
      </div>
    </section>
  </>
}
