declare module 'three' {
  export class Color {
    constructor(color?: string | number)
    set(color: string | number): Color
    setRGB(red: number, green: number, blue: number): Color
  }

  export class Vector2 {
    constructor(x?: number, y?: number)
    set(x: number, y: number): Vector2
  }

  export class WebGLRenderer {
    constructor(options: Record<string, unknown>)
    setPixelRatio(ratio: number): void
    setSize(width: number, height: number, updateStyle?: boolean): void
    domElement: HTMLCanvasElement
    setClearColor(color: number | Color, alpha?: number): void
    render(scene: Scene, camera: OrthographicCamera | PerspectiveCamera): void
    dispose(): void
  }

  export class Scene {
    fog: Fog
    add(object: Mesh | Points): void
  }

  export class Fog {
    constructor(color: number, near: number, far: number)
    color: Color
  }

  export class PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number)
    aspect: number
    position: { set(x: number, y: number, z: number): void }
    updateProjectionMatrix(): void
  }

  export class OrthographicCamera {
    constructor(left: number, right: number, top: number, bottom: number, near: number, far: number)
    position: { z: number }
  }

  export class ShaderMaterial {
    constructor(parameters: Record<string, unknown>)
    uniforms: Record<string, { value: any }>
    dispose(): void
  }

  export class PlaneGeometry {
    constructor(width: number, height: number, widthSegments?: number, heightSegments?: number)
    dispose(): void
  }

  export class Mesh {
    constructor(geometry: PlaneGeometry, material: ShaderMaterial)
  }

  export class Float32BufferAttribute {
    constructor(array: number[], itemSize: number)
    array: Float32Array
    needsUpdate: boolean
  }

  export class BufferGeometry {
    attributes: Record<string, Float32BufferAttribute>
    setAttribute(name: string, attribute: Float32BufferAttribute): void
    dispose(): void
  }

  export class PointsMaterial {
    constructor(parameters: Record<string, unknown>)
    dispose(): void
  }

  export class Points {
    constructor(geometry: BufferGeometry, material: PointsMaterial)
  }
}
