import { lazy, Suspense, useEffect, useState } from 'react'

const Silk = lazy(() => import('./ui/Silk').then(module => ({ default: module.Silk })))

export function DeferredSilk() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const media = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    let timer = 0
    const schedule = () => {
      clearTimeout(timer)
      if (!media.matches || connection?.saveData) { setReady(false); return }
      timer = window.setTimeout(() => setReady(true), 1800)
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    media.addEventListener('change', schedule)
    return () => { clearTimeout(timer); window.removeEventListener('load', schedule); media.removeEventListener('change', schedule) }
  }, [])
  return ready ? <Suspense fallback={null}><Silk speed={3.2} scale={1.15} color="#1748e8" noiseIntensity={0.85} rotation={0.18} /></Suspense> : null
}
