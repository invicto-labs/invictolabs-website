import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

export interface GlobeMarker {
  id: string
  location: [number, number]
  label: string
}

export interface GlobeArc {
  id: string
  from: [number, number]
  to: [number, number]
  label?: string
}

interface GlobeProps {
  markers?: GlobeMarker[]
  arcs?: GlobeArc[]
  className?: string
  markerColor?: [number, number, number]
  baseColor?: [number, number, number]
  arcColor?: [number, number, number]
  glowColor?: [number, number, number]
  dark?: number
  mapBrightness?: number
  markerSize?: number
  markerElevation?: number
  arcWidth?: number
  arcHeight?: number
  speed?: number
  initialRotation?: number
  theta?: number
  diffuse?: number
  mapSamples?: number
}

type GeoPoint = [number, number]

// The MIT-licensed COBE land mask keeps the dot plot geographically accurate.
const COBE_LAND_MASK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAACAAQAAAADMzoqnAAAAAXNSR0IArs4c6QAABA5JREFUeNrV179uHEUAx/Hf3JpbF+E2VASBsmVKTBcpKJs3SMEDcDwBiVJAAewYEBUivIHT0uUBIt0YCovKD0CRjUC4QfHYh8hYXu+P25vZ2Zm9c66gMd/GJ/tz82d3bk8GN4SrByYF2366FNTACIAkivVAAazQdnf3MvAlbNUQfOPAdQDvSAimMWhwy4I2g4SU+Kp04ISLpPBAKLxPyic3O/CCi+Y7rUJbiodcpDOFY7CgxCEXmdYD2EYK2s5lApOx5pEDDYCUwM1XdJUwBV11QQMg59kePSCaPAASQMEL2hwo6TJFgxpg+TgC2ymXPbuvc40awr3D1QCFfbH9kcoqAOkZozpQo0aqAGQRKCog/+tjkgbNFEtg2FffBvBGlSxHoAaAa1u6X4PBAwDiR8FFsrQgeUhfJTSALaB9jy5NCybJPn1SVFiWk7ywN+KzhH1aKAuydhGkbEF4lWohLXDXavlyFgHY7LBnLRdlAP6BS5Cc8RfVDXbkwN/oIvmY+6obbNeBP0JwTuMGu9gTzy1Q4RS/cWpfzszeYwd+CAFrtBW/Hur0gLbJGlD+/OjVwe/drfBxkbbg63dndEDfiEBlAd7ac0BPe1D6Jd8dfbLH+RI0OzseFB5s01/M+gMdAeluLOCAuaUA9Lezo/vSgXoCX9rtEiXnp7Q1W/CNyWcd8DXoS6jH/YZ5vAJEWY2dXFQe2TUgaFaNejCzJ98g6HnlVrsE58sDcYqg+9XY75fPqdoh/kRQWiXKg8MWlJQxUFMPjqnyujhFBE7UxIMjyszk0QwQlFsezImsyvUYYYVED2pk6m0Tg8T04Fwjk2kdAwSACqlM6gRRt3vQYAFGX0Ah7Ebx1H+MDRI5ui0QldH4j7FGcm90XdxD2Jg1AOEAVAKhEFXSn4cKUELurIAKwJ3MArypPscQaLhJFICJ0ohjDySAdH8AhDtCiTuMycH8CXzhH9jUACAO5uMhoAwA5i+T6WAKmmAqnLy80wxHqIPFYpqCwxGaYLt4Dyievg5kEoVEUAhs6pqKgFtDQYOuaXypaWKQfIuwwoGSZgfLsu/XAtI8cGN+h7Cc1A5oLOMhwlIPXuhu48AIvsSBkvtV9wsJRKCyYLfq5lTrQMFd1a262oqBck9K1V0YjQg0iEYYgpS1A9GlXQV5cykwm4A7BzVsxQqo7E+zCegO7Ma7yKgsuOcfKbMBwLC8wvVNYDsANYalEpOAa6zpWjTeMKGwEwC1CiQewJc5EKfgy7GmRAZA4vUVGwE2dPM/g0xuAInE/yG5aZ8ISxWGfYigUVbdyBElTHh2uCwGdfCkOLGgQVBh3Ewp+/QK4CDlR5Ws/Zf7yhCf8pH7vinWAvoVCQ6zz0NX5V/6GkAVV+2/5qsJ/gU8bsxpM8IeAQAAAABJRU5ErkJggg=='

function rgb(color: [number, number, number], alpha = 1) {
  const channels = color.map((value) => Math.round(Math.max(0, Math.min(1, value)) * 255))
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`
}

function projectPoint(
  location: GeoPoint,
  rotation: number,
  tilt: number,
  center: number,
  radius: number,
  elevation = 0,
) {
  const latitude = location[0] * Math.PI / 180
  const longitude = location[1] * Math.PI / 180 + rotation
  const cosLatitude = Math.cos(latitude)
  const x = cosLatitude * Math.sin(longitude)
  const unrotatedY = Math.sin(latitude)
  const unrotatedZ = cosLatitude * Math.cos(longitude)
  const y = unrotatedY * Math.cos(tilt) - unrotatedZ * Math.sin(tilt)
  const z = unrotatedY * Math.sin(tilt) + unrotatedZ * Math.cos(tilt)
  const scale = 1 + elevation
  return {
    x: center + x * radius * scale,
    y: center - y * radius * scale,
    z,
  }
}

function interpolateArc(from: GeoPoint, to: GeoPoint, progress: number): GeoPoint {
  let longitudeDelta = to[1] - from[1]
  if (longitudeDelta > 180) longitudeDelta -= 360
  if (longitudeDelta < -180) longitudeDelta += 360
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + longitudeDelta * progress,
  ]
}

export function Globe({
  markers = [],
  arcs = [],
  className = '',
  markerColor = [0.3, 0.45, 0.85],
  baseColor = [1, 1, 1],
  arcColor = [0.35, 0.52, 1],
  glowColor = [0.94, 0.93, 0.91],
  dark = 0,
  mapBrightness = 10,
  markerSize = 0.025,
  markerElevation = 0.02,
  arcWidth = 1.2,
  arcHeight = 0.18,
  speed = 0.002,
  initialRotation = 1.15,
  theta = 0.12,
  diffuse = 1.5,
  mapSamples = 16000,
}: GlobeProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const rotationRef = useRef(initialRotation)
  const tiltRef = useRef(theta)
  const velocityRef = useRef({ x: 0, y: 0 })
  const markerLabels = useRef(new Map<string, HTMLDivElement>())
  const arcLabels = useRef(new Map<string, HTMLDivElement>())

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY }
    velocityRef.current = { x: 0, y: 0 }
    shellRef.current?.classList.add('is-dragging')
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.style.cursor = 'grabbing'
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerRef.current) return
      const deltaX = event.clientX - pointerRef.current.x
      const deltaY = event.clientY - pointerRef.current.y
      const rotationDelta = Math.max(-0.12, Math.min(0.12, deltaX / 165))
      const tiltDelta = Math.max(-0.055, Math.min(0.055, deltaY / 430))
      rotationRef.current += rotationDelta
      tiltRef.current = Math.max(-0.42, Math.min(0.42, tiltRef.current - tiltDelta))
      velocityRef.current = {
        x: velocityRef.current.x * 0.34 + rotationDelta * 0.66,
        y: velocityRef.current.y * 0.34 + tiltDelta * 0.66,
      }
      pointerRef.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerUp = () => {
      pointerRef.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
      shellRef.current?.classList.remove('is-dragging')
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointercancel', handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const shell = shellRef.current
    if (!canvas || !shell) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let size = 0
    let landPoints: GeoPoint[] = []
    let visible = false

    const landMask = new Image()
    landMask.onload = () => {
      const mapCanvas = document.createElement('canvas')
      mapCanvas.width = landMask.naturalWidth
      mapCanvas.height = landMask.naturalHeight
      const mapContext = mapCanvas.getContext('2d', { willReadFrequently: true })
      if (!mapContext) return

      mapContext.drawImage(landMask, 0, 0)
      const pixels = mapContext.getImageData(0, 0, mapCanvas.width, mapCanvas.height).data
      const sampleCount = Math.max(4000, Math.min(24000, Math.round(mapSamples)))
      const goldenAngle = Math.PI * (3 - Math.sqrt(5))
      const points: GeoPoint[] = []

      for (let index = 0; index < sampleCount; index += 1) {
        const vertical = 1 - (index / (sampleCount - 1)) * 2
        const latitude = Math.asin(vertical) * 180 / Math.PI
        const longitude = ((index * goldenAngle * 180 / Math.PI + 180) % 360) - 180
        const pixelX = Math.min(mapCanvas.width - 1, Math.max(0, Math.floor((longitude + 180) / 360 * mapCanvas.width)))
        const pixelY = Math.min(mapCanvas.height - 1, Math.max(0, Math.floor((90 - latitude) / 180 * mapCanvas.height)))
        const pixelIndex = (pixelY * mapCanvas.width + pixelX) * 4
        if (pixels[pixelIndex] > 127) points.push([latitude, longitude])
      }

      landPoints = points
      if (visible && !frame) frame = window.requestAnimationFrame(draw)
    }
    landMask.src = COBE_LAND_MASK

    const resize = () => {
      size = shell.clientWidth
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(size * ratio)
      canvas.height = Math.round(size * ratio)
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (visible && !frame) frame = window.requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(shell)
    resize()

    const drawCurve = (points: GeoPoint[], rotation: number, center: number, radius: number) => {
      context.beginPath()
      let drawing = false
      points.forEach((point) => {
        const projected = projectPoint(point, rotation, tiltRef.current, center, radius)
        if (projected.z <= 0) {
          drawing = false
          return
        }
        if (!drawing) context.moveTo(projected.x, projected.y)
        else context.lineTo(projected.x, projected.y)
        drawing = true
      })
      context.stroke()
    }

    const updateLabel = (element: HTMLDivElement | undefined, point: ReturnType<typeof projectPoint>) => {
      if (!element) return
      const visible = point.z > 0.06
      element.style.opacity = visible ? `${Math.min(1, point.z * 1.8)}` : '0'
      element.style.transform = `translate3d(${point.x}px, ${point.y - 10}px, 0) translate(-50%, -100%)`
    }

    const draw = () => {
      frame = 0
      if (!size) {
        if (visible) frame = window.requestAnimationFrame(draw)
        return
      }

      if (!pointerRef.current) {
        if (!reducedMotion.matches) rotationRef.current += speed
        rotationRef.current += velocityRef.current.x
        tiltRef.current -= velocityRef.current.y
        velocityRef.current.x *= 0.955
        velocityRef.current.y *= 0.94
        tiltRef.current += (theta - tiltRef.current) * 0.018
      }

      const center = size / 2
      const radius = size * 0.43
      context.clearRect(0, 0, size, size)

      const depthShadow = context.createRadialGradient(
        center + radius * 0.18,
        center + radius * 0.24,
        radius * 0.12,
        center + radius * 0.18,
        center + radius * 0.24,
        radius * 1.12,
      )
      depthShadow.addColorStop(0, 'rgba(44, 70, 164, 0.16)')
      depthShadow.addColorStop(0.58, 'rgba(44, 70, 164, 0.07)')
      depthShadow.addColorStop(1, 'rgba(44, 70, 164, 0)')
      context.fillStyle = depthShadow
      context.beginPath()
      context.arc(center + radius * 0.12, center + radius * 0.16, radius * 1.12, 0, Math.PI * 2)
      context.fill()

      const globeAccent = dark ? glowColor : arcColor
      const glow = context.createRadialGradient(center, center, radius * 0.84, center, center, radius * 1.18)
      glow.addColorStop(0, 'rgba(0, 0, 0, 0)')
      glow.addColorStop(0.74, rgb(globeAccent, dark ? 0.04 : 0.025))
      glow.addColorStop(1, rgb(globeAccent, 0))
      context.fillStyle = glow
      context.beginPath()
      context.arc(center, center, radius * 1.18, 0, Math.PI * 2)
      context.fill()

      context.save()
      context.beginPath()
      context.arc(center, center, radius, 0, Math.PI * 2)
      context.clip()

      const sphere = context.createRadialGradient(center - radius * 0.3, center - radius * 0.36, radius * 0.08, center, center, radius)
      if (dark) {
        sphere.addColorStop(0, rgb(glowColor, 0.34 + diffuse * 0.04))
        sphere.addColorStop(0.42, rgb(baseColor, 0.98))
        sphere.addColorStop(1, 'rgba(2, 10, 42, 1)')
      } else {
        sphere.addColorStop(0, 'rgba(255, 255, 255, 1)')
        sphere.addColorStop(0.38, rgb(baseColor, 1))
        sphere.addColorStop(0.76, 'rgba(237, 242, 255, 1)')
        sphere.addColorStop(1, 'rgba(188, 201, 233, 1)')
      }
      context.fillStyle = sphere
      context.fillRect(center - radius, center - radius, radius * 2, radius * 2)

      context.lineWidth = 0.7
      context.strokeStyle = rgb(globeAccent, dark ? 0.12 : 0.09)
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        const points: GeoPoint[] = []
        for (let longitude = -180; longitude <= 180; longitude += 4) points.push([latitude, longitude])
        drawCurve(points, rotationRef.current, center, radius)
      }
      for (let longitude = -150; longitude <= 180; longitude += 30) {
        const points: GeoPoint[] = []
        for (let latitude = -88; latitude <= 88; latitude += 3) points.push([latitude, longitude])
        drawCurve(points, rotationRef.current, center, radius)
      }

      const brightness = Math.max(0.35, Math.min(1.4, mapBrightness / 10))
      const mapDotColor: [number, number, number] = dark ? glowColor : [0.055, 0.075, 0.13]
      for (let index = 0; index < landPoints.length; index += 1) {
        const point = projectPoint(landPoints[index], rotationRef.current, tiltRef.current, center, radius)
        if (point.z <= 0) continue
        context.fillStyle = rgb(mapDotColor, (dark ? 0.22 + point.z * 0.48 : 0.4 + point.z * 0.48) * brightness)
        context.beginPath()
        context.arc(point.x, point.y, Math.max(dark ? 0.55 : 0.72, size * (dark ? 0.00135 : 0.0016)), 0, Math.PI * 2)
        context.fill()
      }

      context.restore()

      arcs.forEach((arc) => {
        context.beginPath()
        context.lineWidth = arcWidth
        context.strokeStyle = rgb(arcColor, 0.72)
        let drawing = false
        let midpoint = projectPoint(interpolateArc(arc.from, arc.to, 0.5), rotationRef.current, tiltRef.current, center, radius, arcHeight)
        for (let step = 0; step <= 64; step += 1) {
          const progress = step / 64
          const location = interpolateArc(arc.from, arc.to, progress)
          const elevation = Math.sin(Math.PI * progress) * arcHeight
          const point = projectPoint(location, rotationRef.current, tiltRef.current, center, radius, elevation)
          if (step === 32) midpoint = point
          if (point.z <= -0.02) {
            drawing = false
            continue
          }
          if (!drawing) context.moveTo(point.x, point.y)
          else context.lineTo(point.x, point.y)
          drawing = true
        }
        context.stroke()
        updateLabel(arcLabels.current.get(arc.id), midpoint)
      })

      markers.forEach((marker) => {
        const point = projectPoint(marker.location, rotationRef.current, tiltRef.current, center, radius, markerElevation)
        updateLabel(markerLabels.current.get(marker.id), point)
        if (point.z <= 0) return
        const markerRadius = Math.max(3, size * markerSize * 0.3)
        context.fillStyle = rgb(markerColor, 0.25)
        context.beginPath()
        context.arc(point.x, point.y, markerRadius * 2.2, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = rgb(markerColor, 1)
        context.beginPath()
        context.arc(point.x, point.y, markerRadius, 0, Math.PI * 2)
        context.fill()
        context.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        context.lineWidth = 1
        context.stroke()
      })

      context.strokeStyle = rgb(globeAccent, dark ? 0.34 : 0.22)
      context.lineWidth = 1.1
      context.beginPath()
      context.arc(center, center, radius, 0, Math.PI * 2)
      context.stroke()

      canvas.style.opacity = '1'
      if (visible) frame = window.requestAnimationFrame(draw)
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !frame) frame = window.requestAnimationFrame(draw)
        else if (!visible && frame) {
          window.cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '20% 0px' },
    )
    visibilityObserver.observe(shell)

    return () => {
      landMask.onload = null
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [arcColor, arcHeight, arcWidth, arcs, baseColor, dark, diffuse, glowColor, mapBrightness, mapSamples, markerColor, markerElevation, markerSize, markers, speed, theta])

  return (
    <div ref={shellRef} className={`cobe-globe ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        className="cobe-globe__canvas"
        onPointerDown={handlePointerDown}
        role="img"
        aria-label="Interactive globe showing Invicto locations and delivery routes"
      />
      {markers.map((marker) => (
        <div
          key={marker.id}
          ref={(element) => {
            if (element) markerLabels.current.set(marker.id, element)
            else markerLabels.current.delete(marker.id)
          }}
          className="cobe-globe__label cobe-globe__label--marker"
          aria-hidden="true"
        >
          {marker.label}
        </div>
      ))}
      {arcs.filter((arc) => arc.label).map((arc) => (
        <div
          key={arc.id}
          ref={(element) => {
            if (element) arcLabels.current.set(arc.id, element)
            else arcLabels.current.delete(arc.id)
          }}
          className="cobe-globe__label cobe-globe__label--arc"
          aria-hidden="true"
        >
          {arc.label}
        </div>
      ))}
    </div>
  )
}
