import { lazy, Suspense } from 'react'
import type { CSSProperties } from 'react'
import { useServiceDeck, moveServiceTilt, resetServiceTilt } from './useServiceDeck'
import { Blocks, Landmark, MapPinned, SearchCheck } from 'lucide-react'
import { services } from '../data/site'
import { SectionHeading } from './SectionHeading'
const DotGrid = lazy(() => import('./ui/DotGrid'))
import { SiteLink } from './SiteLink'
import { serviceDetails } from '../data/serviceDetails'

const icons = {
  search: SearchCheck,
  landmark: Landmark,
  map: MapPinned,
  blocks: Blocks,
}

export function Services({ showcase = false }: { showcase?: boolean }) {
  const { sectionRef, deckRef, progressRef } = useServiceDeck()

  return (
    <section ref={sectionRef} className="section services" id="services" aria-labelledby="services-heading">
      <div className="services-stage">
        <div className="services-dot-grid" aria-hidden="true">
          {!showcase && <Suspense fallback={null}><DotGrid
            dotSize={3}
            gap={26}
            baseColor="#c4cee9"
            activeColor="#3159e8"
            proximity={140}
            speedTrigger={135}
            shockRadius={220}
            shockStrength={2.2}
            resistance={900}
            returnDuration={1.2}
          /></Suspense>}
        </div>
        <div className="container">
          <div className="section-intro">
            <SectionHeading
              id="services-heading"
              eyebrow="What we do"
              title={showcase ? 'One partner. Every moving part.' : 'One partner across your operation.'}
              description="Purpose-built support for the work behind every confident decision and successful closing."
            />
            <div className="services-meta">
              <span className="services-meta__signal"><i /> Four connected capabilities</span>
              <p className="section-index" aria-hidden="true">01 — 04</p>
            </div>
          </div>

          <div className="service-grid" ref={deckRef}>
            {services.map((service, index) => {
              const Icon = icons[service.icon as keyof typeof icons]
              const { slug } = serviceDetails[index]
              const href = showcase ? '/services' : `/services/${slug}`
              const label = showcase ? `Explore services, including ${service.title}` : `Explore this service: ${service.title}`
              return (
                <div
                  key={slug}
                  className="service-card-slot"
                  onPointerEnter={moveServiceTilt}
                  onPointerMove={moveServiceTilt}
                  onPointerLeave={resetServiceTilt}
                  onPointerCancel={resetServiceTilt}
                >
                  <SiteLink
                    className="service-card"
                    href={href}
                    aria-label={label}
                    style={{ '--card-delay': `${index * 90}ms` } as CSSProperties}
                  >
                    <div className="service-card__head">
                      <div className="icon-tile icon-tile--light"><Icon size={23} /></div>
                      <span>{service.number}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul>
                      {service.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <div className="service-card__status">
                      <span>{['Research to review', 'Support across the file', 'Property-level context', 'Built around your process'][index]}</span>
                      <i aria-hidden="true"><b /></i>
                    </div>
                    <span className="service-card__details" aria-hidden="true">
                      {showcase ? <>Explore services <span>↗</span></> : 'Explore this service ↗'}
                    </span>
                  </SiteLink>
                </div>
              )
            })}
          </div>

          <div className="services-deck-progress" aria-hidden="true">
            <span>Scroll to expand</span>
            <i><b /></i>
            <span ref={progressRef}>01 / 04</span>
          </div>
        </div>
      </div>
    </section>
  )
}
