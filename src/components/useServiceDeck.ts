import { useEffect, useRef, type PointerEvent } from 'react'

export function moveServiceSpotlight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
  event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
}

export function moveServiceTilt(event: PointerEvent<HTMLDivElement>) {
  const slot = event.currentTarget
  if (event.pointerType !== 'mouse' || !slot.closest('.services--deck-open')) return

  // Measure the slot so the card's rotation cannot shift the pointer coordinates.
  const bounds = slot.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
  const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
  slot.style.setProperty('--pointer-x', `${x * 100}%`)
  slot.style.setProperty('--pointer-y', `${y * 100}%`)
  slot.style.setProperty('--tilt-x', `${(0.5 - y) * 10}deg`)
  slot.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`)
  slot.dataset.pointerActive = ''
}

export function resetServiceTilt(event: PointerEvent<HTMLDivElement>) {
  delete event.currentTarget.dataset.pointerActive
}

export function useServiceDeck() {
  const sectionRef = useRef<HTMLElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const section = sectionRef.current
    const deck = deckRef.current
    if (!section || !deck) return
    const cards = Array.from(deck.querySelectorAll<HTMLElement>('.service-card-slot'))
    const media = window.matchMedia('(min-width: 1100px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    const update = () => {
      frame = 0
      section.classList.toggle('services--deck-ready', media.matches)
      const stage = section.querySelector<HTMLElement>('.services-stage')
      const top = stage ? parseFloat(getComputedStyle(stage).top) || 82 : 82
      const travel = Math.max(1, section.offsetHeight - (stage?.offsetHeight ?? window.innerHeight - top))
      // Keyboard users must be able to reach a source link without a stacked
      // sibling card hiding the focused target.
      const keyboardFocus = deck.contains(document.activeElement) && document.activeElement?.matches(':focus-visible')
      // Leave part of the pinned scroll range for interacting with the open cards.
      const progress = media.matches && !keyboardFocus ? Math.min(1, Math.max(0, (top - section.getBoundingClientRect().top) / (travel * .75))) : 1
      const open = progress === 1
      if (section.classList.contains('services--deck-open') && !open) {
        cards.forEach(card => { delete card.dataset.pointerActive })
      }
      section.classList.toggle('services--deck-open', open)
      const remaining = 1 - progress * progress * (3 - 2 * progress)
      cards.forEach((card, index) => {
        card.style.setProperty('--deck-x', `${(deck.clientWidth / 2 - card.offsetLeft - card.offsetWidth / 2) * remaining}px`)
        card.style.setProperty('--deck-y', `${index * 9 * remaining}px`)
        card.style.setProperty('--deck-rotate', `${(index - (cards.length - 1) / 2) * 2.6 * remaining}deg`)
        card.style.setProperty('--deck-scale', `${1 - index * .012 * remaining}`)
        card.style.zIndex = `${cards.length - index}`
      })
      section.style.setProperty('--deck-progress', `${progress}`)
      if (progressRef.current) progressRef.current.textContent = `${String(Math.min(cards.length, Math.floor(progress * cards.length) + 1)).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`
    }
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    const resize = new ResizeObserver(requestUpdate)
    resize.observe(deck)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    media.addEventListener('change', requestUpdate)
    deck.addEventListener('focusin', requestUpdate)
    deck.addEventListener('focusout', requestUpdate)
    requestUpdate()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      media.removeEventListener('change', requestUpdate)
      deck.removeEventListener('focusin', requestUpdate)
      deck.removeEventListener('focusout', requestUpdate)
    }
  }, [])
  return { sectionRef, deckRef, progressRef }
}
