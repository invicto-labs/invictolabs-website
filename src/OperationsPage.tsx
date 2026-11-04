import { lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Services } from './components/Services'
import { Locations } from './components/Locations'
import { ApproachExperience } from './components/ApproachExperience'
import { ServiceAtelier } from './components/ServiceAtelier'
import { ServiceDelivery } from './components/ServiceDelivery'
const DotGrid = lazy(() => import('./components/ui/DotGrid'))

export default function OperationsPage({ kind }: { kind: 'services' | 'location' | 'our-approach' }) {
  const title = { services: 'Our services', location: 'Our locations', 'our-approach': 'Our approach' }[kind]
  return <>
    <Header />
    <main className={kind === 'our-approach' ? 'approach-page' : kind === 'services' ? 'stack-page services-page' : 'stack-page'} id="main-content">
      {kind === 'our-approach' && <div className="ap-page-background" aria-hidden="true"><div className="ap-page-grid"><Suspense fallback={null}><DotGrid dotSize={2} gap={26} baseColor="#a6b8d7" activeColor="#829ac8" proximity={100} speedTrigger={5000} shockRadius={0} /></Suspense></div></div>}
      {kind === 'services' ? <div><ServiceAtelier /></div> : kind === 'location' ? <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }}>{title}</h1> : null}
      {kind === 'services' ? <Services /> : kind === 'location' ? <Locations /> : <ApproachExperience />}
      {kind === 'services' && <ServiceDelivery />}
    </main>
    <Footer />
  </>
}
