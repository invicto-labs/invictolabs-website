import { SiteLink } from './components/SiteLink'
import { ArrowLeft } from 'lucide-react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main tabIndex={-1} className="not-found" id="main-content">
        <div className="container not-found__inner">
          <p className="eyebrow"><span /> 404 · Page not found</p>
          <h1>This page has moved—or never existed.</h1>
          <p>The link may be outdated. You can browse Invicto’s services or return to the homepage.</p>
          <SiteLink className="button" href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Return to homepage
          </SiteLink>
          <p><SiteLink href="/services">Explore Invicto services</SiteLink></p>
        </div>
      </main>
      <Footer />
    </>
  )
}
