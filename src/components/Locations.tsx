import { SiteLink } from './SiteLink'
import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { locations } from '../data/site'
import { SectionHeading } from './SectionHeading'
import { Globe } from './ui/CobeGlobe'
import type { GlobeArc, GlobeMarker } from './ui/CobeGlobe'

const globeMarkers: GlobeMarker[] = [
  { id: 'dallas', location: [32.7767, -96.797], label: 'Dallas · HQ' },
  { id: 'bengaluru', location: [12.9716, 77.5946], label: 'Bengaluru · Delivery' },
]

const globeArcs: GlobeArc[] = [
  {
    id: 'dallas-bengaluru',
    from: globeMarkers[0].location,
    to: globeMarkers[1].location,
    label: 'Connected delivery',
  },
]

export function Locations() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const revealMedia = window.matchMedia('(min-width: 1100px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)')
    const updateWithoutObserver = () => {
      if (!revealMedia.matches) section.classList.add('locations--open')
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!revealMedia.matches) {
        section.classList.add('locations--open')
        return
      }
      section.classList.toggle('locations--open', entry.isIntersecting && entry.intersectionRatio > 0.22)
    }, { threshold: [0, 0.22, 0.5], rootMargin: '-8% 0px -8% 0px' })

    observer.observe(section)
    revealMedia.addEventListener('change', updateWithoutObserver)
    updateWithoutObserver()

    return () => {
      observer.disconnect()
      revealMedia.removeEventListener('change', updateWithoutObserver)
    }
  }, [])

  return (
    <section ref={sectionRef} className="section locations" id="locations" aria-labelledby="locations-heading">
      <div className="locations-dot-grid" aria-hidden="true">
      </div>
      <div className="container locations-layout">
        <div className="locations-copy">
          <SectionHeading
            id="locations-heading"
            eyebrow="Where we are"
            title="Local presence. Connected delivery."
            description="Invicto supports clients across the United States from a connected team spanning key operations centers."
          />

          <div className="location-list">
            {locations.map((location) => (
              <article key={location.city}>
                <MapPin size={19} aria-hidden="true" />
                <div>
                  <p>{location.type}</p>
                  <h3>{location.city}</h3>
                  <address>{location.address}</address><SiteLink className="location-directions" href={location.directionsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`} target="_blank" rel="noreferrer">View directions ↗</SiteLink>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="locations-globe-panel">
          <div className="locations-globe-panel__head" aria-hidden="true">
            <span><i />Connected network</span>
            <small>Drag to explore</small>
          </div>
          <Globe
            className="locations-globe"
            markers={globeMarkers}
            arcs={globeArcs}
            markerColor={[0.3, 0.45, 0.85]}
            baseColor={[1, 1, 1]}
            arcColor={[0.3, 0.45, 0.85]}
            glowColor={[0.94, 0.93, 0.91]}
            dark={0}
            mapBrightness={10}
            markerSize={0.025}
            markerElevation={0.01}
            arcWidth={1.25}
            arcHeight={0.22}
            speed={0.0027}
            initialRotation={-0.95}
            mapSamples={24000}
          />
          <div className="locations-globe-panel__footer" aria-hidden="true">
            <span>United States</span>
            <i />
            <span>Global delivery</span>
          </div>
        </div>
      </div>
    </section>
  )
}
