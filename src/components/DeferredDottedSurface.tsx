import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { DottedSurfaceProps } from './ui/DottedSurface'

const Surface = lazy(() => import('./ui/DottedSurface').then(module => ({ default: module.DottedSurface })))

// Download and initialize WebGL only as the decorative surface approaches view.
export function DeferredDottedSurface(props: DottedSurfaceProps) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const media = matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    let observer: IntersectionObserver | undefined
    const update = () => {
      observer?.disconnect()
      if (!media.matches || connection?.saveData) { setReady(false); return }
      observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setReady(true)
        observer?.disconnect()
      }
      }, { rootMargin: '160px' })
      if (host.current) observer.observe(host.current)
    }
    update()
    media.addEventListener('change', update)
    return () => { observer?.disconnect(); media.removeEventListener('change', update) }
  }, [])
  return <div ref={host} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
    {ready && <Suspense fallback={null}><Surface {...props} /></Suspense>}
  </div>
}
