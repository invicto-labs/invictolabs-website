import { useEffect, type ReactNode } from 'react'

const FALLBACK_HEADER_OFFSET = 82

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
    window.scrollTo({ top: 0, behavior })
    return true
  }

  const target = document.getElementById(id)
  if (!target) return false

  if (id === 'main-content') {
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  const headerOffset = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? FALLBACK_HEADER_OFFSET
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top: Math.max(0, targetTop), behavior })
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
  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useEffect(() => scrollAfterRender(target ? `#${target}` : '', behavior), [behavior, locationKey, target])

  return children
}
