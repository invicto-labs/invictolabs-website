import { useLocation } from 'react-router-dom'
import { SiteLink } from './SiteLink'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { company, primaryLinks, resourceLinks } from '../data/site'
import { Logo } from './Logo'
import { useModalNavigation } from './useModalNavigation'
import { homeTargetFor } from '../data/homeNavigation'
import { useHomeScrollSpy, useNavIndicator } from './useHeaderNavigation'
import './navigation.css'

function activateOnSpace(event: ReactKeyboardEvent<HTMLAnchorElement>) {
  if (event.key !== ' ' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
  event.preventDefault()
  event.currentTarget.click()
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useModalNavigation(menuOpen, dialogRef, triggerRef, closeMenu)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setResourcesOpen(false) }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const { pathname: currentPath } = useLocation()
  const onHome = currentPath === '/'
  const homeActive = useHomeScrollSpy(onHome)
  const matchesRoute = (href: string) => currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`))
  const resourcesActive = resourceLinks.some(item => matchesRoute(item.href))
  const active = onHome ? homeActive : resourcesActive ? 'resources' : primaryLinks.find(item => matchesRoute(item.href))?.href
  const { navRef, indicatorRef } = useNavIndicator(currentPath, active, menuOpen)

  useEffect(() => {
    if (!pendingAnchor || menuOpen || !onHome) return
    const anchor = document.getElementById(pendingAnchor)
    const headingId = anchor?.dataset.focusHeading ?? (pendingAnchor === 'top' ? 'hero-heading' : '')
    const heading = document.getElementById(headingId)
    if (!anchor || !heading) { setPendingAnchor(null); return }
    const headerHeight = menuRef.current?.closest('header')?.getBoundingClientRect().height ?? 0
    const top = pendingAnchor === 'top' ? 0 : anchor.getBoundingClientRect().top + window.scrollY - headerHeight - 8
    heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
    const url = new URL(window.location.href)
    url.hash = pendingAnchor === 'top' ? '' : pendingAnchor
    window.history.replaceState(window.history.state, '', url)
    window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    setPendingAnchor(null)
  }, [pendingAnchor, menuOpen, onHome])

  function jumpToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return
    if (!document.getElementById(id)) return
    event.preventDefault()
    closeMenu()
    setResourcesOpen(false)
    setPendingAnchor(id)
  }
  useEffect(() => {
    setMenuOpen(false)
    setResourcesOpen(false)
  }, [currentPath])
  useEffect(() => {
    if (!resourcesOpen) return
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !dialogRef.current?.contains(event.target as Node)) setResourcesOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [resourcesOpen])
  const contactPages = ['/', '/services', '/services/title', '/services/mortgage', '/services/tax-property', '/services/technology', '/our-approach', '/location', '/products', '/products/traceq', '/products/titleflow-ai', '/products/tax-flow', '/faq']

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 1280) setMenuOpen(false)
    }

    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [])

  const menuContent = <>
          <nav ref={navRef} className="primary-nav" aria-label="Primary navigation">
            <span ref={indicatorRef} className="primary-nav__indicator" aria-hidden="true" />
            {primaryLinks.map(item => {
              const anchor = onHome ? item.href === '/' ? 'top' : homeTargetFor(item.href)?.anchor : undefined
              const current = active === item.href ? onHome ? 'location' : 'page' : undefined
              return anchor ? (
                <a key={item.href} href={`#${anchor}`} data-nav-item={item.href} aria-current={current}
                  onKeyDown={activateOnSpace} onClick={event => jumpToSection(event, anchor)}>{item.label}</a>
              ) : (
                <SiteLink key={item.href} href={item.href} data-nav-item={item.href} aria-current={current}
                  onKeyDown={activateOnSpace} onClick={closeMenu}>{item.label}</SiteLink>
              )
            })}
            <div className="header-resources">
              <button type="button" className="header-resources__toggle" aria-expanded={resourcesOpen} aria-controls="resource-links" data-nav-item="resources" aria-current={resourcesActive ? 'page' : undefined} data-active={resourcesActive} onClick={() => setResourcesOpen(open => !open)}>Resources <ChevronDown size={14} aria-hidden="true" /></button>
              <div id="resource-links" className="header-resources__links" hidden={!resourcesOpen}>
                {resourceLinks.map(item => <SiteLink key={item.href} href={item.href} onKeyDown={activateOnSpace} onClick={() => { setResourcesOpen(false); setMenuOpen(false) }}><strong>{item.label}</strong><span>{item.href === '/blogs' ? 'Practical operations guides' : item.href === '/faq' ? 'Answers before you begin' : 'Explore the working process'}</span></SiteLink>)}
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <SiteLink className="header-careers" href={company.careers} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Careers <ArrowUpRight size={14} aria-hidden="true" /></SiteLink>
            <SiteLink className="button button--small" href={contactPages.includes(currentPath) ? '#contact' : '/#contact'} onClick={closeMenu}>
              Talk to our team
              <ArrowUpRight size={16} aria-hidden="true" />
            </SiteLink>
          </div>
  </>
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="container header-inner" ref={menuRef}>
          <Logo />
          <button ref={triggerRef} className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="header-menu" onClick={() => setMenuOpen(current => !current)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          {!menuOpen && <div id="header-menu" className="header-menu">{menuContent}</div>}
        </div>
      </header>
      {menuOpen && createPortal(<div ref={dialogRef} id="header-menu" className="header-menu header-menu--open mobile-menu-layer" role="dialog" aria-modal="true" aria-label="Main navigation" tabIndex={-1} onPointerDown={event => { if (event.target === event.currentTarget) closeMenu() }}>
        <div className="mobile-menu-sheet">
          <div className="mobile-menu-top"><span>Navigation</span><button className="mobile-menu-close" type="button" aria-label="Close navigation menu" onClick={closeMenu}><X size={22} aria-hidden="true" /></button></div>
          <div className="mobile-menu-scroll">{menuContent}</div>
        </div>
      </div>, document.body)}
    </>
  )
}
