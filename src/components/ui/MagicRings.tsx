import { useEffect, useRef, type CSSProperties } from 'react'
import * as THREE from 'three'
import './MagicRings.css'

type MagicRingsProps = {
  color?: string
  colorTwo?: string
  speed?: number
  ringCount?: number
  attenuation?: number
  lineThickness?: number
  baseRadius?: number
  radiusStep?: number
  scaleRate?: number
  opacity?: number
  blur?: number
  noiseAmount?: number
  rotation?: number
  ringGap?: number
  fadeIn?: number
  fadeOut?: number
  followMouse?: boolean
  mouseInfluence?: number
  hoverScale?: number
  parallax?: number
  clickBurst?: boolean
  className?: string
}

type LiveProps = Required<Omit<MagicRingsProps, 'className'>>

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`

export function MagicRings({
  color = '#fcfcfc',
  colorTwo = '#1f49ff',
  speed = 1,
  ringCount = 6,
  attenuation = 10,
  lineThickness = 2,
  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,
  opacity = 1,
  blur = 0,
  noiseAmount = 0.1,
  rotation = 0,
  ringGap = 1.5,
  fadeIn = 0.7,
  fadeOut = 0.5,
  followMouse = false,
  mouseInfluence = 0.2,
  hoverScale = 1.2,
  parallax = 0.05,
  clickBurst = false,
  className = '',
}: MagicRingsProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef<LiveProps>({
    color, colorTwo, speed, ringCount, attenuation, lineThickness, baseRadius,
    radiusStep, scaleRate, opacity, blur, noiseAmount, rotation, ringGap,
    fadeIn, fadeOut, followMouse, mouseInfluence, hoverScale, parallax, clickBurst,
  })

  propsRef.current = {
    color, colorTwo, speed, ringCount: Math.max(1, Math.min(10, Math.round(ringCount))),
    attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, blur,
    noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse, mouseInfluence,
    hoverScale, parallax, clickBurst,
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
    } catch {
      mount.dataset.webgl = 'unavailable'
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1

    const uniforms = {
      uTime: { value: 0 },
      uAttenuation: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color() },
      uColorTwo: { value: new THREE.Color() },
      uLineThickness: { value: 0 },
      uBaseRadius: { value: 0 },
      uRadiusStep: { value: 0 },
      uScaleRate: { value: 0 },
      uRingCount: { value: 0 },
      uOpacity: { value: 1 },
      uNoiseAmount: { value: 0 },
      uRotation: { value: 0 },
      uRingGap: { value: 1.6 },
      uFadeIn: { value: 0.5 },
      uFadeOut: { value: 0.75 },
      uMouse: { value: new THREE.Vector2() },
      uMouseInfluence: { value: 0 },
      uHoverAmount: { value: 0 },
      uHoverScale: { value: 1 },
      uParallax: { value: 0 },
      uBurst: { value: 0 },
    }

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true })
    const geometry = new THREE.PlaneGeometry(1, 1)
    const quad = new THREE.Mesh(geometry, material)
    scene.add(quad)

    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      uniforms.uResolution.value.set(width * dpr, height * dpr)
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)

    const mouse = [0, 0]
    const smoothMouse = [0, 0]
    let isHovered = false
    let hoverAmount = 0
    let burst = 0

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      mouse[0] = (event.clientX - rect.left) / rect.width - 0.5
      mouse[1] = -((event.clientY - rect.top) / rect.height - 0.5)
    }
    const onPointerEnter = () => { isHovered = true }
    const onPointerLeave = () => {
      isHovered = false
      mouse[0] = 0
      mouse[1] = 0
    }
    const onClick = () => {
      if (propsRef.current.clickBurst) burst = 1
    }

    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerenter', onPointerEnter)
    mount.addEventListener('pointerleave', onPointerLeave)
    mount.addEventListener('click', onClick)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let isVisible = false
    let isPageVisible = !document.hidden
    let elapsed = 0
    let lastTime = 0

    const applyUniforms = () => {
      const props = propsRef.current
      uniforms.uTime.value = elapsed
      uniforms.uAttenuation.value = props.attenuation
      uniforms.uColor.value.set(props.color)
      uniforms.uColorTwo.value.set(props.colorTwo)
      uniforms.uLineThickness.value = props.lineThickness
      uniforms.uBaseRadius.value = props.baseRadius
      uniforms.uRadiusStep.value = props.radiusStep
      uniforms.uScaleRate.value = props.scaleRate
      uniforms.uRingCount.value = props.ringCount
      uniforms.uOpacity.value = props.opacity
      uniforms.uNoiseAmount.value = props.noiseAmount
      uniforms.uRotation.value = (props.rotation * Math.PI) / 180
      uniforms.uRingGap.value = props.ringGap
      uniforms.uFadeIn.value = props.fadeIn
      uniforms.uFadeOut.value = props.fadeOut
      uniforms.uMouse.value.set(smoothMouse[0], smoothMouse[1])
      uniforms.uMouseInfluence.value = props.followMouse ? props.mouseInfluence : 0
      uniforms.uHoverAmount.value = hoverAmount
      uniforms.uHoverScale.value = props.hoverScale
      uniforms.uParallax.value = props.parallax
      uniforms.uBurst.value = props.clickBurst ? burst : 0
    }

    const renderStill = () => {
      applyUniforms()
      renderer.render(scene, camera)
    }

    const animate = (time: number) => {
      frameId = 0
      const props = propsRef.current
      const delta = lastTime === 0 ? 0 : Math.min(time - lastTime, 100)
      lastTime = time
      elapsed += delta * 0.001 * props.speed
      smoothMouse[0] += (mouse[0] - smoothMouse[0]) * 0.08
      smoothMouse[1] += (mouse[1] - smoothMouse[1]) * 0.08
      hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * 0.08
      burst *= 0.95
      if (burst < 0.001) burst = 0
      renderStill()
      if (isVisible && isPageVisible && !reducedMotion.matches) {
        frameId = requestAnimationFrame(animate)
      }
    }

    const start = () => {
      if (!isVisible || !isPageVisible || frameId !== 0) return
      if (reducedMotion.matches) {
        renderStill()
        return
      }
      lastTime = 0
      frameId = requestAnimationFrame(animate)
    }
    const stop = () => {
      if (frameId !== 0) cancelAnimationFrame(frameId)
      frameId = 0
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) start()
      else stop()
    })
    intersectionObserver.observe(mount)

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden
      if (isPageVisible) start()
      else stop()
    }
    const onMotionChange = () => {
      if (reducedMotion.matches) {
        stop()
        renderStill()
      } else {
        start()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    reducedMotion.addEventListener('change', onMotionChange)
    renderStill()

    return () => {
      stop()
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      reducedMotion.removeEventListener('change', onMotionChange)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerenter', onPointerEnter)
      mount.removeEventListener('pointerleave', onPointerLeave)
      mount.removeEventListener('click', onClick)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  const style = blur > 0 ? ({ filter: `blur(${blur}px)` } satisfies CSSProperties) : undefined

  return <div ref={mountRef} className={`magic-rings-container ${className}`.trim()} style={style} />
}

export default MagicRings
