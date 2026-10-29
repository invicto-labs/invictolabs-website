import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Contact } from './components/Contact'
import { Services } from './components/Services'
import { Locations } from './components/Locations'
import { Approach } from './components/Approach'
import { ServiceAtelier } from './components/ServiceAtelier'

export default function OperationsPage({ kind }: { kind: 'services' | 'location' | 'our-approach' }) {
  const title = { services: 'Our services', location: 'Our locations', 'our-approach': 'Our approach' }[kind]
  return <>
    <Header />
    <main className="stack-page" id="main-content">
      {kind === 'services' ? <div><ServiceAtelier /></div> : <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }}>{title}</h1>}
      {kind === 'services' ? <Services /> : kind === 'location' ? <Locations /> : <Approach />}
      <Contact />
    </main>
    <Footer />
  </>
}
