import { useState } from 'react'
import './traceq-gallery.css'

const screens = [
  { file: '04-team-overview', label: 'Team overview', heading: 'Your team. One clear operating view.', description: 'Bring attendance, completed work, and productivity trends together before moving into individual orders and reports.', alt: 'TraceQ team overview with attendance, productivity, completed tasks, and daily production charts using fictional sample data' },
  { file: '08-order-workspace', label: 'Order workspace', heading: 'Know where the work stands.', description: 'Review assignments, active stages, due dates, and recorded activity in a shared order workspace.', alt: 'TraceQ team orders showing assignments, in-progress and on-hold work, due dates, and order tracking actions' },
  { file: '02-employee-productivity', label: 'Team productivity', heading: 'Bring workload into perspective.', description: 'Compare production across a selected period, then review the employee-level detail behind the chart.', alt: 'TraceQ employee productivity report with a date range, production chart, and employee performance table' },
  { file: '07-quality-management', label: 'Quality management', heading: 'Make review findings visible.', description: 'See internal and external findings together, with monthly reporting and associate-level detail to support follow-up.', alt: 'TraceQ team quality reports showing internal and external findings and monthly points by associate' },
]

export function TraceQGallery() {
  const [selected, setSelected] = useState(0)
  const screen = screens[selected]
  return <div className="traceq-gallery">
    <div className="traceq-gallery__controls" role="group" aria-label="Choose a TraceQ application view">
      {screens.map((item, index) => <button key={item.file} type="button" aria-pressed={index === selected} aria-controls="traceq-screen" onClick={() => setSelected(index)}><span>0{index + 1}</span>{item.label}</button>)}
    </div>
    <figure className="traceq-gallery__frame" id="traceq-screen">
      <div className="traceq-gallery__bar"><span>TRACEQ LABS / {screen.label}</span><span>DEMO WORKSPACE</span></div>
      <img key={screen.file} src={`/images/traceq/${screen.file}.png`} width="3200" height="2100" alt={screen.alt} loading="lazy" decoding="async" />
      <figcaption aria-live="polite"><strong>{screen.heading}</strong><span>{screen.description}</span></figcaption>
    </figure>
    <p className="traceq-gallery__note">Application showcase with fictional sample data. Names, order details, revenue, and performance figures are illustrative—not client results. Available views depend on role and access.</p>
  </div>
}
