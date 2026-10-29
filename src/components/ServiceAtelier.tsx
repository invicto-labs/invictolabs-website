import { useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SiteLink } from './SiteLink'
import { serviceDetails } from '../data/serviceDetails'
import './ServiceAtelier.css'

const titles = ['A clearer picture.', 'Room to move.', 'Grounded in detail.', 'Built to connect.']
const labels = ['Property / Records / Review', 'Intake / Coordination / Handoff', 'Parcel / Source / Context', 'People / Systems / Workflow']

export function ServiceArtwork({ index }: { index: number }) {
  return <div className={`service-art service-art--${index}`} aria-hidden="true">
    <div className="service-art__orbit" /><div className="service-art__orbit service-art__orbit--two" />
    <svg viewBox="0 0 600 440" fill="none">
      {index === 0 && <g className="service-art__drawing"><path d="M110 258 300 145 490 258 300 368Z" /><path d="m110 234 190-113 190 113-190 110Z" /><path d="m110 210 190-113 190 113-190 110Z" /><path d="M203 224v-76l98-58 98 58v76M184 159l117-92 117 92M278 271v-75l49-29 49 29v47" /><path d="m143 231 158 95 155-95M300 368v30" /></g>}
      {index === 1 && <g className="service-art__drawing"><path d="M105 285h95v-85h95v-70h95v-60h100M105 310h120v-85h95v-70h95v-60h75" /><rect x="78" y="255" width="55" height="55" rx="12" /><rect x="267" y="104" width="55" height="55" rx="12" /><rect x="462" y="42" width="55" height="55" rx="12" /><path d="m95 281 8 8 15-17m166-140 8 8 15-17m169-53 8 8 15-17M90 370h425" /></g>}
      {index === 2 && <g className="service-art__drawing"><path d="m90 240 205-130 215 120-205 135Z" /><path d="m142 206 213 124m-160-158 214 124m-162-157 214 124M143 271l205-132m-154 163 206-133m-153 164 205-134" /><path className="service-art__parcel" d="m247 206 51-33 55 32-52 33Z" /><path d="M300 199v-70" /><circle cx="300" cy="103" r="26" /><circle cx="300" cy="103" r="8" /></g>}
      {index === 3 && <g className="service-art__drawing"><path d="M140 140h160v95h160M140 325h160v-90M300 80v155" /><rect x="85" y="100" width="110" height="80" rx="14" /><rect x="85" y="285" width="110" height="80" rx="14" /><rect x="405" y="195" width="110" height="80" rx="14" /><rect x="255" y="35" width="90" height="60" rx="12" /><circle cx="300" cy="235" r="37" /><path d="m125 122-15 18 15 18m30-36 15 18-15 18m285 55 13 13 27-28" /></g>}
    </svg><div className="service-art__caption"><span>INVICTO / {String(index + 1).padStart(2, '0')}</span><span>{labels[index]}</span></div>
  </div>
}

export function ServiceAtelier() {
  const [active, setActive] = useState(0)
  const service = serviceDetails[active]
  return <section className="service-atelier" aria-labelledby="atelier-heading"><div className="container">
    <div className="service-atelier__masthead"><span>INVICTO / SERVICES</span><span>Expertise, working together.</span></div>
    <div className="service-atelier__headline"><h1 id="atelier-heading">The work behind<br /><em>what comes next.</em></h1><p>Your operation has many moving parts.<br />Bring the right people, processes, and technology together.</p></div>
    <div className="service-atelier__stage"><div className="service-atelier__visual" key={active}><ServiceArtwork index={active} /></div><div className="service-atelier__editorial" aria-live="polite"><span className="service-atelier__kicker">0{active + 1} / {service.name}</span><h2>{titles[active]}</h2><p>{service.intro}</p><SiteLink href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()} <ArrowUpRight size={21} /></SiteLink></div></div>
    <div className="service-atelier__selector" aria-label="Choose a service">{serviceDetails.map((item,index) => <button key={item.slug} aria-pressed={active === index} onClick={() => setActive(index)}><span>0{index+1}</span><strong>{item.name}</strong><ArrowRight size={18} /></button>)}</div>
  </div></section>
}
