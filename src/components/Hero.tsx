import { SiteLink } from './SiteLink'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { DeferredSilk } from './DeferredSilk'

const propertyImages = [
  { src: '/home-title-hero.webp', position: '54% center' },
  { src: '/home-title-house-2.webp', position: '50% center' },
  { src: '/home-title-house-3.webp', position: '50% center' },
]

export function Hero() {
  const [activeImage, setActiveImage] = useState(0)
  const [carouselReady, setCarouselReady] = useState(false)
  const [imageInView, setImageInView] = useState(false)
  const visualRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setImageInView(entry.isIntersecting))
    if (visualRef.current) observer.observe(visualRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const loadTimer = window.setTimeout(() => { if (imageInView && !reducedMotion.matches) setCarouselReady(true) }, 3500)
    let rotationTimer = 0

    const stopRotation = () => {
      if (rotationTimer) window.clearInterval(rotationTimer)
      rotationTimer = 0
    }

    const startRotation = () => {
      stopRotation()
      if (document.hidden || reducedMotion.matches || !imageInView || !carouselReady) return
      rotationTimer = window.setInterval(() => {
        setActiveImage((current) => (current + 1) % propertyImages.length)
      }, 5800)
    }

    const handleVisibility = () => startRotation()
    reducedMotion.addEventListener('change', startRotation)
    document.addEventListener('visibilitychange', handleVisibility)
    startRotation()

    return () => {
      window.clearTimeout(loadTimer)
      stopRotation()
      reducedMotion.removeEventListener('change', startRotation)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [imageInView, carouselReady])

  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <div className="hero-silk" aria-hidden="true">
        <DeferredSilk />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Title, mortgage &amp; property operations</p>
          <h1 id="hero-heading">
            Clarity for every file. <em>Capacity</em> for every opportunity.
          </h1>
          <p className="hero-lede">
            Invicto brings dependable title research and flexible mortgage operations support into one connected workflow—helping your team move every property file forward with confidence.
          </p>
          <div className="hero-actions">
            <SiteLink className="button" href="#contact">
              Start a conversation
              <ArrowRight size={18} aria-hidden="true" />
            </SiteLink>
            <SiteLink className="text-link" href="/services">
              Explore our services
              <span aria-hidden="true">↘</span>
            </SiteLink>
          </div>
          <div className="hero-note">
            <Check size={17} aria-hidden="true" />
            <span>Built around your workflow, service levels, and priorities.</span>
          </div>
        </div>

        <div className="hero-visual" ref={visualRef}>
          <figure className="property-visual">
            <div
              className="property-carousel"
              role="img"
              aria-label="American residential homes representing Invicto's title services"
            >
              {propertyImages.filter((_, index) => index === 0 || carouselReady).map((image, index) => (
                <img
                  className={index === activeImage ? 'is-active' : ''}
                  src={image.src}
                  alt=""
                  width="1400"
                  height="934"
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'low'}
                  style={{ objectPosition: image.position }}
                  aria-hidden="true"
                  key={image.src}
                />
              ))}
            </div>
          </figure>

        </div>
      </div>

    </section>
  )
}
