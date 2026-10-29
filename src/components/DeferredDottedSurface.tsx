import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { DottedSurfaceProps } from './ui/DottedSurface'

const Surface = lazy(() => import('./ui/DottedSurface').then(module => ({ default: module.DottedSurface })))

// Download and initialize WebGL only as the decorative surface approaches view.
export function DeferredDottedSurface(props: DottedSurfaceProps) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setReady(true)
        observer.disconnect()
      }
    }, { rootMargin: '160px' })
    if (host.current) observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={host} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
    {ready && <Suspense fallback={null}><Surface {...props} /></Suspense>}
  </div>
}
