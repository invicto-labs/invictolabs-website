import { useLocation } from 'react-router-dom'
import { SiteLink } from './SiteLink'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { company, navigation } from '../data/site'
import { Logo } from './Logo'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setResourcesOpen(false) }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', menuOpen)
    if (!menuOpen) return

    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.body.classList.remove('mobile-menu-open')
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [menuOpen])

  const { pathname: currentPath, state } = useLocation()
  useEffect(() => {
    setMenuOpen(false)
    setResourcesOpen(false)
  }, [currentPath])
  useEffect(() => {
    if (!resourcesOpen) return
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setResourcesOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [resourcesOpen])
  const resourceLinks = navigation.filter(item => ['/blogs', '/case-studies', '/faq'].includes(item.href))
  const currentHash = state?.scrollTarget ? `#${state.scrollTarget}` : ''
  const isActive = (href: string) => {
    const destination = new URL(href, 'https://invictolabs.com')
    const destinationPath = destination.pathname.replace(/\/+$/, '') || '/'
    return destination.hash ? destinationPath === currentPath && destination.hash === currentHash : destinationPath === currentPath || (['/products', '/services', '/blogs', '/case-studies'].includes(destinationPath) && currentPath.startsWith(`${destinationPath}/`))
  }

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 1280) setMenuOpen(false)
    }

    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [])

  return (
    <>
      <SiteLink className="skip-link" href="#main-content">Skip to main content</SiteLink>
      <header className="site-header">
        <div className="container header-inner" ref={menuRef}>
          <Logo />

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="header-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          id="header-menu"
          className={`header-menu${menuOpen ? ' header-menu--open' : ''}`}
        >
          <nav className="primary-nav" aria-label="Primary navigation">
            {navigation.filter(item => !resourceLinks.includes(item)).map((item) => (
              <SiteLink
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </SiteLink>
            ))}
            <div className="header-resources">
              <button type="button" className="header-resources__toggle" aria-expanded={resourcesOpen} aria-controls="resource-links" data-active={resourceLinks.some(item => isActive(item.href))} onClick={() => setResourcesOpen(open => !open)}>Resources <ChevronDown size={14} aria-hidden="true" /></button>
              <div id="resource-links" className="header-resources__links" hidden={!resourcesOpen}>
                {resourceLinks.map(item => <SiteLink key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} onClick={() => { setResourcesOpen(false); setMenuOpen(false) }}><strong>{item.label}</strong><span>{item.href === '/blogs' ? 'Practical operations guides' : item.href === '/faq' ? 'Answers before you begin' : 'Explore the working process'}</span></SiteLink>)}
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <SiteLink className="header-careers" href={company.careers} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Careers <ArrowUpRight size={14} aria-hidden="true" /></SiteLink>
            <SiteLink className="button button--small" href={currentPath === '/our-company' || /^\/(blogs|case-studies)(\/|$)/.test(currentPath) ? '/#contact' : '#contact'} onClick={() => setMenuOpen(false)}>
              Talk to our team
              <ArrowUpRight size={16} aria-hidden="true" />
            </SiteLink>
          </div>
        </div>
        </div>
      </header>
    </>
  )
}
