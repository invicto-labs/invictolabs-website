import { useEffect, type ReactNode } from 'react'
import { useNavigationType } from 'react-router-dom'

const FALLBACK_HEADER_OFFSET = 82
const positions = new Map<string, number>()

function getHashId(hash = window.location.hash) {
  if (!hash || hash === '#') return ''

  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return hash.slice(1)
  }
}

function scrollToRouteTarget(hash: string, behavior: ScrollBehavior) {
  const id = getHashId(hash)

  if (!id || id === 'top') {
    window.scrollTo({ top: 0, behavior: behavior === 'auto' ? 'instant' : behavior })
    return true
  }

  const target = document.getElementById(id)
  if (!target) return false

  const headingId = target.dataset.focusHeading
  const focusTarget = headingId ? document.getElementById(headingId) : id === 'main-content' || id === 'contact' ? target : null
  if (focusTarget) {
    focusTarget.setAttribute('tabindex', '-1')
    focusTarget.focus({ preventScroll: true })
  }

  const headerOffset = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? FALLBACK_HEADER_OFFSET
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset - (headingId ? 8 : 0)
  window.scrollTo({ top: Math.max(0, targetTop), behavior: behavior === 'auto' ? 'instant' : behavior })
  return true
}

function scrollAfterRender(hash: string, behavior: ScrollBehavior) {
  const started = performance.now()
  let frame = 0

  const findAndScroll = () => {
    if (scrollToRouteTarget(hash, behavior) || performance.now() - started >= 5000) return
    frame = window.requestAnimationFrame(findAndScroll)
  }

  frame = window.requestAnimationFrame(() => {
    frame = window.requestAnimationFrame(findAndScroll)
  })

  return () => window.cancelAnimationFrame(frame)
}

type RouteScrollManagerProps = {
  behavior: ScrollBehavior
  children: ReactNode
  locationKey: string
  target: string
}

export function RouteScrollManager({ behavior, children, locationKey, target }: RouteScrollManagerProps) {
  const navigationType = useNavigationType()
  useEffect(() => {
    // This SPA owns restoration for the document. Restoring "auto" during a
    // Suspense/route cleanup can overwrite the newly active entry's mode.
    const ensureManual = () => { window.history.scrollRestoration = 'manual' }
    ensureManual()
    window.addEventListener('popstate', ensureManual)
    window.addEventListener('hashchange', ensureManual)
    return () => {
      window.removeEventListener('popstate', ensureManual)
      window.removeEventListener('hashchange', ensureManual)
    }
  }, [])

  useEffect(() => {
    // Scroll restoration belongs to each history entry. Native hash links can
    // create an entry with automatic restoration, notably in WebKit.
    window.history.scrollRestoration = 'manual'
    let frame = 0
    const remember = () => {
      positions.set(locationKey, window.scrollY)
      if (positions.size > 100) positions.delete(positions.keys().next().value!)
    }
    const saved = navigationType === 'POP' ? positions.get(locationKey) : undefined
    let cancel: (() => void) | undefined
    if (saved !== undefined) {
      const started = performance.now()
      const restore = () => {
        if (document.documentElement.scrollHeight >= saved + innerHeight || performance.now() - started > 5000) {
          window.scrollTo({ top: saved, behavior: 'instant' })
        } else frame = requestAnimationFrame(restore)
      }
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(restore) })
    } else cancel = scrollAfterRender(target ? `#${target}` : '', behavior)
    window.addEventListener('scroll', remember, { passive: true })
    // Route replacement can shorten the document before passive cleanup. Keep
    // the last scroll event's position so the outgoing entry is not clamped.
    return () => { window.removeEventListener('scroll', remember); cancelAnimationFrame(frame); cancel?.() }
  }, [behavior, locationKey, target, navigationType])

  return children
}
