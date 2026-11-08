import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Color, type ShaderMaterial } from 'three'
import { palette } from '@/config/scene'
import { scrollState } from '@/lib/scrollStore'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.x += cos(uTime * 0.15 + aSeed * 12.0) * 0.35;
    // Scroll lifts the dust; wrapping keeps the volume always full.
    p.y = mod(p.y + sin(uTime * 0.2 + aSeed * 6.283) * 0.3 + uScroll + 10.0, 20.0) - 10.0;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.35 + aSeed) / -mv.z;
    vAlpha = smoothstep(28.0, 3.0, -mv.z) * (0.2 + 0.8 * aSeed);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha * 0.7);
  }
`

/** Dust in a projector beam: depth, atmosphere and scroll-linked parallax. */
export function DustField({ count, reduced }: { count: number; reduced: boolean }) {
  const material = useRef<ShaderMaterial>(null)
  const dpr = useThree((s) => s.viewport.dpr)

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2
      seeds[i] = Math.random()
    }
    return { positions, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 60 },
      uColor: { value: new Color(palette.white) },
    }),
    [],
  )

  // Own clock, advanced by a capped step: when the scene idles (renders only on
  // scroll), the dust continues smoothly instead of jumping ahead.
  const time = useRef(0)
  useFrame((_, dt) => {
    const m = material.current
    if (!m) return
    time.current += Math.min(dt, 1 / 30)
    m.uniforms.uTime.value = reduced ? 0 : time.current
    m.uniforms.uScroll.value = scrollState.y * 0.0025
    m.uniforms.uPixelRatio.value = dpr
  })

  // Geometry and material are declared in JSX, so R3F disposes them on unmount.
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
