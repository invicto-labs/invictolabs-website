import { SiteLink } from './SiteLink'
import { ArrowUpRight } from 'lucide-react'
import { company, navigation } from '../data/site'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo inverse />
          <p>Your all-in-one outsourcing partner for mortgage, title, tax, and MLS services across the nation.</p>
        </div>
        <nav className="footer-nav footer-nav--explore" aria-label="Footer navigation">
          <p>Explore</p>
          {navigation.map((item) => <SiteLink href={item.href} key={item.href}>{item.label}</SiteLink>)}
        </nav>
        <nav className="footer-nav" aria-label="Footer products">
          <p>Products</p>
          <SiteLink href="/products/traceq">TraceQ Labs</SiteLink>
          <SiteLink href="/products/titleflow-ai">TitleFlow AI</SiteLink>
          <SiteLink href="/products/tax-flow">Tax Flow</SiteLink>
        </nav>
        <div className="footer-nav">
          <p>Connect</p>
          <SiteLink href={`mailto:${company.email}`}>{company.email}</SiteLink>
          <SiteLink href={`tel:${company.phoneHref}`}>{company.phone}</SiteLink>
          <SiteLink href={company.linkedIn} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={14} />
          </SiteLink>
          <SiteLink href={company.careers} target="_blank" rel="noreferrer">Careers <ArrowUpRight size={14} /></SiteLink>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Invicto. All rights reserved.</span>
        <SiteLink href="/privacy-policy">Privacy Policy</SiteLink>
        <SiteLink href="/">Back to homepage ↑</SiteLink>
      </div>
    </footer>
  )
}
