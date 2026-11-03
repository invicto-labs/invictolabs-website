import { useLayoutEffect, useRef } from 'react'

type IndicatorPosition = { path: string; viewport: number; transform: string }
let previousPosition: IndicatorPosition | undefined

export function useNavIndicator(path: string, active: string | undefined, menuOpen: boolean) {
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const nav = navRef.current
    const indicator = indicatorRef.current
    if (!nav || !indicator || menuOpen) return

    let frame = 0
    let routeAnimation: Animation | undefined
    const measure = () => {
      frame = 0
      const current = nav.querySelector<HTMLElement>('[data-nav-item][aria-current]')
      const bounds = nav.getBoundingClientRect()
      if (!current || !bounds.width) {
        nav.removeAttribute('data-indicator-ready')
        return
      }
      const item = current.getBoundingClientRect()
      const center = item.left - bounds.left + item.width / 2
      const transform = `translateX(${center - indicator.offsetWidth / 2}px)`
      if (!nav.hasAttribute('data-indicator-ready') && previousPosition &&
          previousPosition.path !== path && previousPosition.viewport === window.innerWidth &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        routeAnimation = indicator.animate([{ transform: previousPosition.transform }, { transform }], {
          duration: 320, easing: 'cubic-bezier(.2,.65,.3,1)',
        })
      }
      indicator.style.transform = transform
      nav.setAttribute('data-indicator-ready', '')
      previousPosition = { path, viewport: window.innerWidth, transform }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    observer.observe(nav)
    nav.querySelectorAll('[data-nav-item]').forEach(item => observer.observe(item))
    document.fonts?.addEventListener('loadingdone', schedule)
    window.addEventListener('resize', schedule)
    measure()
    return () => {
      routeAnimation?.cancel()
      observer.disconnect()
      cancelAnimationFrame(frame)
      document.fonts?.removeEventListener('loadingdone', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [path, active, menuOpen])

  return { navRef, indicatorRef }
}
