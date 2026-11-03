import { lazy, Suspense } from 'react'

const DotGrid = lazy(() => import('./ui/DotGrid'))

// A viewport-sized canvas keeps the shared background light even on long articles.
export function ServicePageBackground() {
  return <div className="service-page-dots" aria-hidden="true">
    <Suspense fallback={<div className="service-page-dots__fallback" />}>
      <DotGrid dotSize={2} gap={27} baseColor="#c0cdea" activeColor="#8fa8e0" proximity={110} shockRadius={140} shockStrength={0.4} speedTrigger={220} resistance={1100} />
    </Suspense>
  </div>
}
