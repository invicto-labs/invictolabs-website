import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useSpring } from 'motion/react'
import './TiltedCard.css'

// Adapted from the supplied React Bits TiltedCard: existing linked content
// replaces its image/overlay, and a separate shell owns the scroll animation.
export default function TiltedCard({ children, rotateAmplitude = 6, scaleOnHover = 1.015 }: {
  children: ReactNode; rotateAmplitude?: number; scaleOnHover?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const spring = { damping: 30, stiffness: 100, mass: 2 }
  const rotateX = useSpring(0, spring)
  const rotateY = useSpring(0, spring)
  const scale = useSpring(1, spring)
  const enabled = (event: PointerEvent) => event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches
  const reset = () => { rotateX.set(0); rotateY.set(0); scale.set(1) }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled(event) || !ref.current) { reset(); return }
    const rect = ref.current.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)))
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)))
    rotateX.set(-y * rotateAmplitude)
    rotateY.set(x * rotateAmplitude)
    scale.set(scaleOnHover)
  }
  return <div ref={ref} className="product-tilt-shell" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <motion.div className="product-tilt-inner" style={{ rotateX, rotateY, scale }}>{children}</motion.div>
  </div>
}
