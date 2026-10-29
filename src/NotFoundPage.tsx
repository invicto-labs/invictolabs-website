import { SiteLink } from './components/SiteLink'
import { ArrowLeft } from 'lucide-react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="not-found" id="main-content">
        <div className="container not-found__inner">
          <p className="eyebrow"><span /> 404 · Page not found</p>
          <h1>This page has moved—or never existed.</h1>
          <p>The link may be outdated. Return to Invicto’s homepage to continue exploring our services, approach, and locations.</p>
          <SiteLink className="button" href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Return to homepage
          </SiteLink>
        </div>
      </main>
      <Footer />
    </>
  )
}
