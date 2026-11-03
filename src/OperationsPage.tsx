import { ServicePageBackground } from './components/ServicePageBackground'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Contact } from './components/Contact'
import { Services } from './components/Services'
import { Locations } from './components/Locations'
import { ApproachExperience } from './components/ApproachExperience'
import { ServiceAtelier } from './components/ServiceAtelier'
import { ApproachDelivery, ServiceDelivery } from './components/DeliveryContent'

export default function OperationsPage({ kind }: { kind: 'services' | 'location' | 'our-approach' }) {
  const title = { services: 'Our services', location: 'Our locations', 'our-approach': 'Our approach' }[kind]
  return <>
    <Header />
    <main tabIndex={-1} className={kind === 'our-approach' ? 'approach-page' : 'stack-page'} id="main-content">
      {kind === 'our-approach' && <ServicePageBackground />}
      {kind === 'services' ? <div><ServiceAtelier /></div> : kind === 'location' ? <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }}>{title}</h1> : null}
      {kind === 'services' ? <Services /> : kind === 'location' ? <Locations /> : <ApproachExperience />}
      {kind === 'services' && <ServiceDelivery />}
      {kind === 'our-approach' && <ApproachDelivery />}
      <Contact />
    </main>
    <Footer />
  </>
}
