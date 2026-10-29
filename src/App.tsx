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

export default function App() {
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const main = mainRef.current
    const header = document.querySelector<HTMLElement>('.site-header')
    if (!main || !header) return
    const panels = Array.from(main.children).filter((element): element is HTMLElement => element instanceof HTMLElement)
    const measure = () => {
      const headerHeight = header.offsetHeight
      main.style.setProperty('--home-header-height', `${headerHeight}px`)
      panels.forEach(panel => {
        // Tall panels must scroll past the header before they can be covered.
        panel.style.setProperty('--home-panel-top', `${Math.min(headerHeight, window.innerHeight - panel.offsetHeight)}px`)
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    panels.forEach(panel => observer.observe(panel))
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return (
    <>
      <Header />
      <main ref={mainRef} className="stack-page home-page" id="main-content">
        <Hero />
        <Services showcase />
        <Approach />
        <Partnership />
        <Locations />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
