import { useEffect, type RefObject } from 'react'

const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Keep viewport navigation independent of the sticky/filtered header. */
export function useModalNavigation(
  open: boolean,
  dialog: RefObject<HTMLDivElement | null>,
  trigger: RefObject<HTMLButtonElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!open || !dialog.current) return
    const panel = dialog.current
    const position = { x: window.scrollX, y: window.scrollY }
    const htmlOverflow = document.documentElement.style.overflow
    const bodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const candidates = () => Array.from(panel.querySelectorAll<HTMLElement>(focusable))
      .filter(el => el.getClientRects().length && !el.closest('[hidden],[inert]'))
    const initial = panel.querySelector<HTMLElement>('.mobile-menu-close') ?? panel
    initial.focus({ preventScroll: true })
    const background = Array.from(document.body.children)
      .filter((el): el is HTMLElement => el instanceof HTMLElement && el !== panel)
      .map(el => ({ el, inert: el.inert }))
    background.forEach(({ el }) => { el.inert = true })
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab') return
      const items = candidates(), first = items[0]
      if (!first) { event.preventDefault(); panel.focus({ preventScroll: true }); return }
      // Manage every step: WebKit's host keyboard policy may otherwise skip
      // links and send focus to browser chrome before a boundary is reached.
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next = index < 0 ? (event.shiftKey ? items.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + items.length) % items.length
      event.preventDefault()
      items[next].focus({ preventScroll: true })
      const scrollport = items[next].closest<HTMLElement>('.mobile-menu-scroll')
      if (scrollport) {
        const item = items[next].getBoundingClientRect(), area = scrollport.getBoundingClientRect()
        const delta = item.top < area.top + 4 ? item.top - area.top - 4 : item.bottom > area.bottom - 4 ? item.bottom - area.bottom + 4 : 0
        if (delta) scrollport.scrollBy({ top: delta, behavior: 'instant' })
      }
    }
    const containFocus = (event: FocusEvent) => {
      if (!panel.contains(event.target as Node)) initial.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', keys)
    document.addEventListener('focusin', containFocus)
    return () => {
      document.removeEventListener('keydown', keys)
      document.removeEventListener('focusin', containFocus)
      background.forEach(({ el, inert }) => { el.inert = inert })
      document.documentElement.style.overflow = htmlOverflow
      document.body.style.overflow = bodyOverflow
      if (window.scrollY !== position.y || window.scrollX !== position.x) window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' })
      if (trigger.current?.isConnected && trigger.current.getClientRects().length) trigger.current.focus({ preventScroll: true })
      else document.querySelector<HTMLElement>('.site-header .logo')?.focus({ preventScroll: true })
    }
  }, [open, dialog, trigger, close])
}
