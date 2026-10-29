import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface DottedSurfaceProps {
  className?: string
  size?: number
  opacity?: number
  sizeAttenuation?: boolean
  vertexColors?: boolean
}

export function DottedSurface({
  className = '',
  size = 5.5,
  opacity = 0.58,
  sizeAttenuation = true,
  vertexColors = true,
}: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const separation = 150
    const amountX = 40
    const amountY = 60
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xf6f8ff, 4200, 12000)

    const camera = new THREE.PerspectiveCamera(60, 1, 1, 10000)
    camera.position.set(0, 355, 1220)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(scene.fog.color, 0)
    container.appendChild(renderer.domElement)

    const positions: number[] = []
    const colors: number[] = []
    const geometry = new THREE.BufferGeometry()

    for (let xIndex = 0; xIndex < amountX; xIndex += 1) {
      for (let yIndex = 0; yIndex < amountY; yIndex += 1) {
        positions.push(
          xIndex * separation - (amountX * separation) / 2,
          0,
          yIndex * separation - (amountY * separation) / 2,
        )

        const depthTone = yIndex / amountY
        colors.push(
          0.004 + depthTone * 0.008,
          0.012 + depthTone * 0.016,
          0.055 + depthTone * 0.065,
        )
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size,
      vertexColors,
      // White preserves the per-point colors without an undefined material parameter.
      color: vertexColors ? 0xffffff : 0x123fe8,
      transparent: true,
      opacity,
      sizeAttenuation,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0
    let count = 0
    let visible = true

    const renderFrame = () => {
      const positionAttribute = geometry.attributes.position
      const pointPositions = positionAttribute.array
      let pointIndex = 0

      for (let xIndex = 0; xIndex < amountX; xIndex += 1) {
        for (let yIndex = 0; yIndex < amountY; yIndex += 1) {
          const offset = pointIndex * 3
          pointPositions[offset + 1] =
            Math.sin((xIndex + count) * 0.3) * 50 +
            Math.sin((yIndex + count) * 0.5) * 50
          pointIndex += 1
        }
      }

      positionAttribute.needsUpdate = true
      renderer.render(scene, camera)
    }

    const animate = () => {
      animationFrame = 0
      renderFrame()
      if (!reducedMotion.matches) count += 0.1
      if (visible && !reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate)
    }

    const startAnimation = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animate)
    }

    const resize = () => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderFrame()
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) startAnimation()
      else if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
      }
    })

    resizeObserver.observe(container)
    visibilityObserver.observe(container)
    reducedMotion.addEventListener('change', startAnimation)
    resize()
    startAnimation()

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      reducedMotion.removeEventListener('change', startAnimation)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
    }
  }, [opacity, size, sizeAttenuation, vertexColors])

  return <div ref={containerRef} className={`dotted-surface ${className}`.trim()} />
}
