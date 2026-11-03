import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { homeTargets } from '../data/homeNavigation'

export function useHomeScrollSpy(enabled: boolean) {
  const [active, setActive] = useState('/')

  useEffect(() => {
    if (!enabled) return
    const header = document.querySelector('.site-header')
    const footer = document.querySelector('.site-footer')
    const footerEnd = footer?.querySelector('.footer-bottom')
    const entries = [['/', 'top'], ...Object.entries(homeTargets).map(([path, target]) => [path, target.section])]
      .flatMap(([path, id]) => {
        const element = document.getElementById(id)
        return element ? [{ path, element }] : []
      })
    if (!header || !entries.length) return

    let observer: IntersectionObserver | undefined
    let frame = 0
    let zoneTop = 0
    let zoneBottom = 0
    const update = () => {
      frame = 0
      let next = '/'
      if (window.scrollY > 1) {
        // A later panel paints over an earlier sticky panel. In the gaps,
        // retain the nearest preceding mapped section through the footer.
        const panels = entries.map(({ path, element }) => ({ path, rect: element.getBoundingClientRect() })).reverse()
        const atFooter = (footer && footer.getBoundingClientRect().top < zoneBottom) ||
          (footerEnd && footerEnd.getBoundingClientRect().top < window.innerHeight)
        next = atFooter
          ? panels[0].path
          : panels.find(({ rect }) => rect.top < zoneBottom && rect.bottom > zoneTop)?.path
            ?? panels.find(({ rect }) => rect.top < zoneBottom)?.path
            ?? '/'
      }
      setActive(next)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observe = () => {
      const height = window.innerHeight
      zoneTop = Math.min(height - 2, Math.max(header.getBoundingClientRect().height + 8, Math.round(height * 0.36)))
      zoneBottom = Math.min(height - 1, Math.max(zoneTop + 1, Math.round(height * 0.45)))
      observer?.disconnect()
      observer = new IntersectionObserver(schedule, { rootMargin: `-${zoneTop}px 0px -${height - zoneBottom}px 0px` })
      entries.forEach(({ element }) => observer?.observe(element))
      if (footer) observer.observe(footer)
      schedule()
    }
    const resize = new ResizeObserver(observe)
    // A short desktop footer can be fully visible below the reading band.
    const endObserver = new IntersectionObserver(schedule)
    if (footerEnd) endObserver.observe(footerEnd)
    resize.observe(header)
    window.addEventListener('resize', observe)
    observe()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      endObserver.disconnect()
      resize.disconnect()
      window.removeEventListener('resize', observe)
    }
  }, [enabled])

  return active
}

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
      const transform = `translate3d(${item.left - bounds.left}px, ${item.bottom - bounds.top + 4}px, 0) scaleX(${item.width})`
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
