import { Approach } from './components/Approach'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Locations } from './components/Locations'
import { Partnership } from './components/Partnership'
import { Services } from './components/Services'
import './home-services.css'
import { useEffect, useRef } from 'react'
import { homeTargets, type HomeSectionPath } from './data/homeNavigation'

function HomeAnchor({ path }: { path: HomeSectionPath }) {
  const { anchor, heading } = homeTargets[path]
  return <span id={anchor} className="home-nav-anchor" data-focus-heading={heading} aria-hidden="true" />
}

export default function App() {
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const main = mainRef.current
    const header = document.querySelector<HTMLElement>('.site-header')
    if (!main || !header) return
    const panels = Array.from(main.querySelectorAll<HTMLElement>(':scope > section'))
    let frame = 0
    const measure = () => {
      frame = 0
      const headerHeight = header.offsetHeight
      // Read all geometry before changing inherited CSS properties. Interleaved
      // reads/writes force a full layout for each panel on slower devices.
      const tops = panels.map(panel => `${Math.min(headerHeight, window.innerHeight - panel.offsetHeight)}px`)
      const height = `${headerHeight}px`
      if (main.style.getPropertyValue('--home-header-height') !== height) main.style.setProperty('--home-header-height', height)
      panels.forEach((panel, index) => {
        if (panel.style.getPropertyValue('--home-panel-top') !== tops[index]) panel.style.setProperty('--home-panel-top', tops[index])
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    observer.observe(header)
    panels.forEach(panel => observer.observe(panel))
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <>
      <Header />
      <main tabIndex={-1} ref={mainRef} className="stack-page home-page" id="main-content">
        <Hero />
        <HomeAnchor path="/services" />
        <Services showcase />
        <HomeAnchor path="/our-approach" />
        <Approach />
        <Partnership />
        <HomeAnchor path="/location" />
        <Locations />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
