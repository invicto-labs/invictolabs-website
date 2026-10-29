import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, Layers3 } from 'lucide-react'
import { SiteLink } from './SiteLink'
import { MagicRings } from './ui/MagicRings'
import { serviceDetails } from '../data/serviceDetails'

type Service = typeof serviceDetails[number]

export function ServicesHero() {
  return <section className="service-landing" aria-labelledby="services-title">
    <div className="service-landing__aura" aria-hidden="true"><MagicRings color="#173fd8" colorTwo="#7c97ff" speed={0.54} opacity={0.35} ringCount={8} followMouse={false} /></div>
    <div className="container service-landing__copy"><p className="eyebrow"><span /> Invicto operational services</p><h1 id="services-title">The people behind<br /><em>your next move.</em></h1><p>From title research to technology, bring specialist support into the work your team does every day.</p><SiteLink className="button" href="#services">Explore our capabilities <ArrowRight size={18} /></SiteLink><div className="service-landing__signals"><span>04 connected capabilities</span><span>Your workflow, our support</span><span>People + technology</span></div></div>
  </section>
}

export function ServiceBlueprint({ service }: { service: Service }) {
  return <div className="service-blueprint"><div className="service-blueprint__label"><span>THE CONNECTED WORKFLOW</span><Layers3 size={24} /></div><div className="service-blueprint__core"><Layers3 size={32} /><span>Your operation<strong>Supported at every handoff.</strong></span></div><div className="service-blueprint__steps">{service.capabilities.map(([title], index) => <div key={title}><span>0{index + 1}</span><strong>{title}</strong><Check size={16} /></div>)}</div><div className="service-blueprint__handoff"><span>THE HANDOFF</span><p>{service.output}</p></div></div>
}

export function ServiceCapabilities({ service }: { service: Service }) {
  const [active, setActive] = useState(0)
  return <section className="service-detail__scope container"><div><p className="eyebrow"><span /> Inside the service</p><h2>The detail makes<br />the difference.</h2><p className="service-detail__intro">Built for {service.audience.toLowerCase()}. Explore where we fit into your operation.</p><div className="service-scope-tabs" aria-label="Explore capabilities">{service.capabilities.map(([title], index) => <button key={title} aria-pressed={active === index} aria-controls="service-capability" onClick={() => setActive(index)}><span>0{index + 1}</span>{title}<ArrowUpRight size={18} /></button>)}</div></div><div className="service-scope-panel" id="service-capability" aria-live="polite"><Layers3 size={40} /><span className="service-scope-panel__number" aria-hidden="true">0{active + 1}</span><div key={active} className="service-scope-panel__copy"><p>CAPABILITY / 0{active + 1}</p><h3>{service.capabilities[active][0]}</h3><p>{service.capabilities[active][1]}</p></div><div className="service-scope-panel__foot"><Check size={17} /> Aligned to your agreed requirements</div></div></section>
}
