import { useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { CheckCircle2, Compass, Network, Rocket, SearchCheck, TrendingUp } from 'lucide-react'
import { approach } from '../data/site'
import { SectionHeading } from './SectionHeading'

const icons = {
  discover: SearchCheck,
  align: Compass,
  integrate: Network,
  activate: Rocket,
  deliver: CheckCircle2,
  evolve: TrendingUp,
}

const phaseColors = ['#8ca7ff', '#6f92ff', '#5f7eff', '#4dd9c3', '#76e0bd', '#a4e8d2']

export function Approach() {
  const sectionRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const scene = sceneRef.current
    if (!section || !scene) return

    const cards = Array.from(scene.querySelectorAll<HTMLElement>('.approach-orbit-card'))
    const sceneMedia = window.matchMedia('(min-width: 1100px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    let visible = false
    let lastTime = performance.now()
    let clusterRotation = 0

    const showExpanded = () => {
      section.classList.remove('approach--orbit-ready')
      section.style.setProperty('--approach-progress', '1')
      cards.forEach((card) => {
        card.style.removeProperty('--orbit-x')
        card.style.removeProperty('--orbit-y')
        card.style.removeProperty('--orbit-rotate')
        card.style.removeProperty('--orbit-rotate-y')
        card.style.removeProperty('--orbit-scale')
        card.style.removeProperty('z-index')
      })
      if (progressRef.current) progressRef.current.textContent = '06 / 06'
    }

    const updateScene = (time = performance.now()) => {
      frame = 0
      if (!sceneMedia.matches) {
        showExpanded()
        return
      }

      section.classList.add('approach--orbit-ready')
      const stage = section.querySelector<HTMLElement>('.approach-stage')
      const stickyTop = stage ? parseFloat(getComputedStyle(stage).top) || 0 : 82
      const travel = Math.max(1, section.offsetHeight - (stage?.offsetHeight ?? window.innerHeight - stickyTop))
      const rawProgress = (stickyTop - section.getBoundingClientRect().top) / travel
      const scrollProgress = Math.min(1, Math.max(0, rawProgress))
      const progress = Math.min(1, Math.max(0, (scrollProgress - 0.06) / 0.72))
      const easedProgress = progress * progress * (3 - 2 * progress)
      const remaining = 1 - easedProgress
      const elapsed = Math.min(48, Math.max(0, time - lastTime))
      lastTime = time
      clusterRotation += elapsed * 0.00042 * remaining * remaining

      const cardWidth = cards[0]?.offsetWidth ?? 280
      const cardHeight = Math.max(...cards.map((card) => card.offsetHeight), 154)
      const openStepX = Math.min(cardWidth + 22, Math.max(250, (scene.clientWidth - cardWidth) / 2))
      const openStepY = cardHeight / 2 + 11
      const radiusX = Math.min(205, scene.clientWidth * 0.19)
      const radiusY = Math.min(72, scene.clientHeight * 0.16)

      cards.forEach((card, index) => {
        const angle = (index / cards.length) * Math.PI * 2 - Math.PI / 2 + clusterRotation
        const closedX = Math.cos(angle) * radiusX
        const closedY = Math.sin(angle) * radiusY
        const closedRotation = -Math.cos(angle) * 6
        const closedRotateY = -Math.cos(angle) * 24
        const depth = (Math.sin(angle) + 1) / 2
        const closedScale = 0.58 + depth * 0.1
        const column = index % 3
        const row = Math.floor(index / 3)
        const openX = (column - 1) * openStepX
        const openY = (row === 0 ? -1 : 1) * openStepY
        const x = closedX * remaining + openX * easedProgress
        const y = closedY * remaining + openY * easedProgress
        const rotation = closedRotation * remaining
        const scale = closedScale + easedProgress * (1 - closedScale)

        card.style.setProperty('--orbit-x', `${x}px`)
        card.style.setProperty('--orbit-y', `${y}px`)
        card.style.setProperty('--orbit-rotate', `${rotation}deg`)
        card.style.setProperty('--orbit-rotate-y', `${closedRotateY * remaining}deg`)
        card.style.setProperty('--orbit-scale', `${scale}`)
        card.style.zIndex = `${Math.round(20 + depth * 12 + easedProgress * index)}`
      })

      section.style.setProperty('--approach-progress', `${progress}`)
      const currentPhase = Math.min(cards.length, Math.floor(progress * cards.length) + 1)
      if (progressRef.current) progressRef.current.textContent = `0${currentPhase} / 06`

      if (visible) frame = window.requestAnimationFrame(updateScene)
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScene)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        lastTime = performance.now()
        if (visible) requestUpdate()
      },
      { rootMargin: '35% 0px' },
    )

    observer.observe(section)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    sceneMedia.addEventListener('change', requestUpdate)
    requestUpdate()

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      sceneMedia.removeEventListener('change', requestUpdate)
    }
  }, [])

  const moveSpotlight = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
  }

  return (
    <section ref={sectionRef} className="section approach" id="approach" aria-labelledby="approach-heading">
      <div className="approach-stage">
        <div className="container approach-shell">
          <div className="approach-intro">
            <SectionHeading
              id="approach-heading"
              eyebrow="How we work"
              title="One method. Six connected moves."
              description="We become part of your operating rhythm—from first discovery to continuous improvement."
            />
            <blockquote>
              “Your workflow sets the direction. Our team helps it move with confidence.”
              <cite>— The Invicto operating approach</cite>
            </blockquote>
          </div>

          <div className="approach-orbit-scene" ref={sceneRef}>
            <div className="approach-orbit-cards">
              {approach.map((step, index) => {
                const Icon = icons[step.icon as keyof typeof icons]
                return (
                  <article
                    className="approach-orbit-card"
                    key={step.number}
                    onPointerMove={moveSpotlight}
                    style={{
                      '--phase-accent': phaseColors[index],
                      '--phase-index': index,
                    } as CSSProperties}
                  >
                    <div className="approach-orbit-card__head">
                      <span className="approach-orbit-card__icon"><Icon size={18} strokeWidth={1.8} /></span>
                      <span>{step.number}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <div className="approach-orbit-card__line" aria-hidden="true"><i /></div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="approach-orbit-progress" aria-hidden="true">
            <span>Scroll to expand the process</span>
            <i><b /></i>
            <span ref={progressRef}>01 / 06</span>
          </div>
        </div>
      </div>
    </section>
  )
}
