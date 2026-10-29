import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from 'gsap'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import './DotGrid.css'

gsap.registerPlugin(InertiaPlugin)

interface DotGridProps {
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
  speedTrigger?: number
  shockRadius?: number
  shockStrength?: number
  maxSpeed?: number
  resistance?: number
  returnDuration?: number
  className?: string
  style?: CSSProperties
}

interface DotState {
  cx: number
  cy: number
  xOffset: number
  yOffset: number
  inertiaApplied: boolean
}

interface PointerState {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  lastTime: number
  lastX: number
  lastY: number
}

function throttle<T extends (...args: never[]) => void>(callback: T, limit: number) {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = performance.now()
    if (now - lastCall < limit) return
    lastCall = now
    callback(...args)
  }
}

function hexToRgb(hex: string) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return { r: 0, g: 0, b: 0 }
  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  }
}

export function DotGrid({
  dotSize = 3,
  gap = 26,
  baseColor = '#d3dcf4',
  activeColor = '#3159e8',
  proximity = 135,
  speedTrigger = 120,
  shockRadius = 220,
  shockStrength = 2.4,
  maxSpeed = 4200,
  resistance = 850,
  returnDuration = 1.25,
  className = '',
  style,
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<DotState[]>([])
  const reducedMotionRef = useRef(false)
  const visibleRef = useRef(false)
  const pointerRef = useRef<PointerState>({
    x: -10000,
    y: -10000,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  })

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor])

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null
    const path = new window.Path2D()
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2)
    return path
  }, [dotSize])

  const buildGrid = useCallback(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const { width, height } = wrapper.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cell = dotSize + gap
    const columns = Math.max(1, Math.floor((width + gap) / cell))
    const rows = Math.max(1, Math.floor((height + gap) / cell))
    const startX = (width - (cell * columns - gap)) / 2 + dotSize / 2
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2
    const dots: DotState[] = []

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        dots.push({
          cx: startX + column * cell,
          cy: startY + row * cell,
          xOffset: 0,
          yOffset: 0,
          inertiaApplied: false,
        })
      }
    }
    dotsRef.current = dots
  }, [dotSize, gap])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => { reducedMotionRef.current = media.matches }
    media.addEventListener('change', updatePreference)
    updatePreference()
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    buildGrid()
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const observer = new ResizeObserver(buildGrid)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [buildGrid])

  useEffect(() => {
    if (!circlePath) return
    let frame = 0
    const proximitySquared = proximity * proximity
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const draw = () => {
      frame = 0
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (!canvas || !context) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
      const { x: pointerX, y: pointerY } = pointerRef.current

      dotsRef.current.forEach((dot) => {
        const deltaX = dot.cx - pointerX
        const deltaY = dot.cy - pointerY
        const distanceSquared = deltaX * deltaX + deltaY * deltaY
        let fill = baseColor

        if (distanceSquared <= proximitySquared) {
          const strength = 1 - Math.sqrt(distanceSquared) / proximity
          const red = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * strength)
          const green = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * strength)
          const blue = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * strength)
          fill = `rgb(${red}, ${green}, ${blue})`
        }

        context.save()
        context.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset)
        context.fillStyle = fill
        context.fill(circlePath)
        context.restore()
      })

      if (visibleRef.current && !reducedMotion.matches) {
        frame = window.requestAnimationFrame(draw)
      }
    }

    const startDrawing = () => {
      if (!frame) frame = window.requestAnimationFrame(draw)
    }

    const wrapper = wrapperRef.current
    if (!wrapper) return

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        if (visibleRef.current) startDrawing()
        else if (frame) {
          window.cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '20% 0px' },
    )
    const resizeObserver = new ResizeObserver(startDrawing)
    const handleMotionChange = () => startDrawing()

    visibilityObserver.observe(wrapper)
    resizeObserver.observe(wrapper)
    reducedMotion.addEventListener('change', handleMotionChange)

    return () => {
      visibleRef.current = false
      if (frame) window.cancelAnimationFrame(frame)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      reducedMotion.removeEventListener('change', handleMotionChange)
    }
  }, [activeRgb, baseColor, baseRgb, circlePath, proximity])

  useEffect(() => {
    const isInside = (event: MouseEvent, bounds: DOMRect) => (
      event.clientX >= bounds.left
      && event.clientX <= bounds.right
      && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom
    )

    const move = (event: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !visibleRef.current) return
      const bounds = canvas.getBoundingClientRect()
      const pointer = pointerRef.current
      if (!isInside(event, bounds)) {
        pointer.x = -10000
        pointer.y = -10000
        pointer.lastTime = 0
        return
      }

      const now = performance.now()
      const elapsed = pointer.lastTime ? Math.max(now - pointer.lastTime, 1) : 16
      let velocityX = ((event.clientX - pointer.lastX) / elapsed) * 1000
      let velocityY = ((event.clientY - pointer.lastY) / elapsed) * 1000
      let speed = Math.hypot(velocityX, velocityY)
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed
        velocityX *= scale
        velocityY *= scale
        speed = maxSpeed
      }

      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.lastTime = now
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      pointer.vx = velocityX
      pointer.vy = velocityY
      pointer.speed = speed

      if (reducedMotionRef.current || speed <= speedTrigger) return
      dotsRef.current.forEach((dot) => {
        const distance = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y)
        if (distance >= proximity || dot.inertiaApplied) return
        dot.inertiaApplied = true
        gsap.killTweensOf(dot)
        gsap.to(dot, {
          inertia: {
            xOffset: dot.cx - pointer.x + velocityX * 0.004,
            yOffset: dot.cy - pointer.y + velocityY * 0.004,
            resistance,
          },
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: returnDuration,
              ease: 'elastic.out(1, 0.75)',
              onComplete: () => { dot.inertiaApplied = false },
            })
          },
        })
      })
    }

    const click = (event: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !visibleRef.current || reducedMotionRef.current) return
      const bounds = canvas.getBoundingClientRect()
      if (!isInside(event, bounds)) return
      const centerX = event.clientX - bounds.left
      const centerY = event.clientY - bounds.top

      dotsRef.current.forEach((dot) => {
        const distance = Math.hypot(dot.cx - centerX, dot.cy - centerY)
        if (distance >= shockRadius || dot.inertiaApplied) return
        const falloff = Math.max(0, 1 - distance / shockRadius)
        dot.inertiaApplied = true
        gsap.killTweensOf(dot)
        gsap.to(dot, {
          inertia: {
            xOffset: (dot.cx - centerX) * shockStrength * falloff,
            yOffset: (dot.cy - centerY) * shockStrength * falloff,
            resistance,
          },
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: returnDuration,
              ease: 'elastic.out(1, 0.75)',
              onComplete: () => { dot.inertiaApplied = false },
            })
          },
        })
      })
    }

    const throttledMove = throttle(move, 42)
    window.addEventListener('mousemove', throttledMove, { passive: true })
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('mousemove', throttledMove)
      window.removeEventListener('click', click)
      gsap.killTweensOf(dotsRef.current)
    }
  }, [maxSpeed, proximity, resistance, returnDuration, shockRadius, shockStrength, speedTrigger])

  return (
    <div className={`dot-grid ${className}`.trim()} style={style}>
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </div>
  )
}

export default DotGrid
