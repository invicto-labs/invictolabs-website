import { useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SiteLink } from './SiteLink'
import { serviceDetails } from '../data/serviceDetails'
import './ServiceAtelier.css'

const titles = ['A clearer picture.', 'Room to move.', 'Grounded in detail.', 'Built to connect.']
const labels = ['Property / Records / Review', 'Intake / Coordination / Handoff', 'Parcel / Source / Context', 'People / Systems / Workflow']

function TitleBlueprint() {
  return (
    <g className="service-art__blueprint">
      <g className="service-art__guides">
        <path d="M68 244 288 115 513 244 292 373Z M98 267 319 138 M129 285 350 156 M160 303 381 174 M191 321 412 192 M222 339 443 210 M253 357 474 228 M99 226 323 355 M130 208 354 337 M161 190 385 319 M192 172 416 301 M223 154 447 283 M254 136 478 265" />
        <path d="M68 244v42m445-42v42M292 373v28M88 118h24m-12-12v24m385 180h24m-12-12v24M164 77h14m-7-7v14" />
      </g>
      <g className="service-art__parcel-layers">
        <path d="m119 257 166-96 172 96-166 99Z" />
        <path d="m119 238 166-96 172 96-166 99Z" />
        <path d="m119 219 166-96 172 96-166 99Z" />
      </g>
      <path className="service-art__boundary" d="m151 222 134-77 138 77-133 79Z" />
      <g className="service-art__building">
        <path className="service-art__building-side" d="M286 148 352 111v91l-66 39Z" />
        <path className="service-art__building-front" d="M214 106 286 148v93l-72-42Z" />
        <path className="service-art__building-roof" d="m197 112 74-61 98 57-74 61-12-9-69-40Z" />
        <path d="m271 51 12 109m-62-29 61 36m12-1 62-49m-94 108v-44l-23-13v43m62-50 16-9v21l-16 9Zm23-13 16-10v22l-16 9Z" />
      </g>
      <g className="service-art__record">
        <path className="service-art__connector" d="m347 232 31 18 54-31v-38" />
        <circle cx="347" cy="232" r="4" />
        <rect x="391" y="104" width="99" height="70" rx="10" />
        <path d="M406 126h36m-36 11h28m-28 11h18" />
        <circle cx="463" cy="140" r="13" />
        <path d="m457 140 4 4 7-8" />
      </g>
    </g>
  )
}

export function ServiceArtwork({ index, blueprint = false }: { index: number; blueprint?: boolean }) {
  return <div className={`service-art service-art--${index}`} aria-hidden="true">
    <div className="service-art__orbit" /><div className="service-art__orbit service-art__orbit--two" />
    <svg viewBox="0 0 600 440" fill="none">
      {index === 0 && (blueprint ? <TitleBlueprint /> : <g className="service-art__drawing"><path d="M110 258 300 145 490 258 300 368Z" /><path d="m110 234 190-113 190 113-190 110Z" /><path d="m110 210 190-113 190 113-190 110Z" /><path d="M203 224v-76l98-58 98 58v76M184 159l117-92 117 92M278 271v-75l49-29 49 29v47" /><path d="m143 231 158 95 155-95M300 368v30" /></g>)}
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
    <div className="service-atelier__stage"><div className="service-atelier__visual" key={active}><ServiceArtwork index={active} blueprint /></div><div className="service-atelier__editorial" aria-live="polite"><span className="service-atelier__kicker">0{active + 1} / {service.name}</span><h2>{titles[active]}</h2><p>{service.intro}</p><SiteLink href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()} <ArrowUpRight size={21} /></SiteLink></div></div>
    <div className="service-atelier__selector" role="group" aria-label="Choose a service">{serviceDetails.map((item,index) => <button type="button" key={item.slug} aria-pressed={active === index} onClick={() => setActive(index)}><span>0{index+1}</span><strong>{item.name}</strong><ArrowRight size={18} /></button>)}</div>
  </div></section>
}
