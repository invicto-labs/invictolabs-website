import { useEffect, useRef } from 'react'
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'

type SilkProps = {
  speed?: number
  scale?: number
  color?: string
  noiseIntensity?: number
  rotation?: number
  className?: string
}

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '')
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ]
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`

export function Silk({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
  className = '',
}: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1
    const [red, green, blue] = hexToNormalizedRGB(color)
    const material = new ShaderMaterial({
      uniforms: {
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uColor: { value: new Color().setRGB(red, green, blue) },
        uRotation: { value: rotation },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    })
    const geometry = new PlaneGeometry(2, 2, 1, 1)
    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let previousTime = performance.now()
    let visible = false

    const render = (time: number) => {
      frame = 0
      const delta = Math.min(0.1, Math.max(0, (time - previousTime) / 1000))
      previousTime = time
      material.uniforms.uTime.value += 0.1 * delta
      renderer.render(scene, camera)
      if (visible && !document.hidden && !reducedMotion.matches) frame = window.requestAnimationFrame(render)
    }

    const startRendering = () => {
      previousTime = performance.now()
      if (!frame) frame = window.requestAnimationFrame(render)
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) startRendering()
        else if (frame) {
          window.cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { rootMargin: '20% 0px' },
    )
    const handleMotionChange = () => startRendering()
    const handleVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
      else if (visible) startRendering()
    }

    visibilityObserver.observe(host)
    reducedMotion.addEventListener('change', handleMotionChange)
    document.addEventListener('visibilitychange', handleVisibility)
    startRendering()

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      reducedMotion.removeEventListener('change', handleMotionChange)
      document.removeEventListener('visibilitychange', handleVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [color, noiseIntensity, rotation, scale, speed])

  return <canvas ref={canvasRef} className={`silk-canvas ${className}`.trim()} aria-hidden="true" />
}
