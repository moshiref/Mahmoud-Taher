import { Suspense, useEffect, useState } from 'react'
import { Vector4, type Object3D } from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { palette } from '@/config/scene'
import type { DeviceTier } from '@/lib/device'
import { onSceneActivity, sceneIsLive } from '@/lib/sceneActivity'
import { CameraRig } from './rig/CameraRig'
import { HeroStage } from './hero/HeroStage'
import { ServicesMarquee3D } from './hero/ServicesMarquee3D'
import { ExperienceNumber3D } from './about/ExperienceNumber3D'
import { DustField } from './objects/DustField'
import { Lighting } from './Lighting'

interface ExperienceProps {
  tier: DeviceTier
  reduced: boolean
  onReady: () => void
}

const quality = {
  high: { dpr: 1.75, dust: 1100 },
  low: { dpr: 1.5, dust: 380 },
} as const

/**
 * The persistent WebGL layer holding the hero set. Later sections join the
 * same world as camera chapters (see config/scene.ts). It sits fixed behind the DOM and receives pointer events from the page
 * root. Loaded lazily — three.js never blocks the first paint.
 */
export default function Experience({ tier, reduced, onReady }: ExperienceProps) {
  const preset = quality[tier]
  const [dpr, setDpr] = useState<number>(preset.dpr)

  return (
    <Canvas
      eventSource={document.getElementById('root') ?? undefined}
      eventPrefix="client"
      dpr={[1, dpr]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: [0, 0, 13.5], fov: 35, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
        // Checking every shader for errors makes the browser wait for each compile
        // (a long stall on phones). Useful while developing, pure cost in production.
        gl.debug.checkShaderErrors = import.meta.env.DEV
        requestAnimationFrame(onReady)
      }}
    >
      <color attach="background" args={[palette.black]} />
      <fog attach="fog" args={[palette.black, 14, 34]} />

      {/* Degrade gracefully when the device can't hold frame rate. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} />

      <CameraRig reduced={reduced} />
      <Lighting />
      <Suspense fallback={null}>
        <HeroStage reduced={reduced} quality={tier} />
        {/* Each warm-up mounts with its boundary's content, compiling those shaders then. */}
        <ShaderWarmup />
      </Suspense>
      <Suspense fallback={null}>
        <ServicesMarquee3D quality={tier} reduced={reduced} />
        <ShaderWarmup />
      </Suspense>
      <Suspense fallback={null}>
        <ExperienceNumber3D quality={tier} reduced={reduced} />
        <ShaderWarmup />
      </Suspense>
      <DustField count={preset.dust} reduced={reduced} />
      {/* Compiles the dust and background shaders straight away. */}
      <ShaderWarmup />

      {reduced ? <DemandInvalidator /> : <RenderGovernor />}
    </Canvas>
  )
}

/**
 * Compiles every shader in the scene ahead of use, by rendering the whole scene
 * once into a 1×1-pixel scissor box (nothing visible changes). Objects that are
 * hidden until their section scrolls into view are shown for that one draw, so
 * their shaders don't compile mid-scroll (a visible hitch on phones). A real
 * render — not renderer.compile() — so programs match exactly, clipping
 * planes included.
 */
function ShaderWarmup() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    const shown: Object3D[] = []
    scene.traverse((o) => {
      if (!o.visible) {
        o.visible = true
        shown.push(o)
      }
    })
    const scissor = gl.getScissor(new Vector4())
    const scissorTest = gl.getScissorTest()
    gl.setScissorTest(true)
    gl.setScissor(0, 0, 1, 1)
    gl.render(scene, camera)
    gl.setScissor(scissor)
    gl.setScissorTest(scissorTest)
    shown.forEach((o) => (o.visible = false))
  }, [gl, scene, camera])
  return null
}

/**
 * Runs the 60 fps loop only while a 3D element is on screen (the hero or
 * About's "08" — see lib/sceneActivity). Otherwise the scene renders on
 * demand: once per scroll / resize / pointer frame, enough for the dust's
 * parallax, and nothing at all while the page is still.
 */
function RenderGovernor() {
  const setFrameloop = useThree((s) => s.setFrameloop)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const apply = () => {
      setFrameloop(sceneIsLive() ? 'always' : 'demand')
      invalidate()
    }
    apply()
    const stop = onSceneActivity(apply)
    const request = () => invalidate()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    window.addEventListener('pointermove', request, { passive: true })
    return () => {
      stop()
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      window.removeEventListener('pointermove', request)
    }
  }, [setFrameloop, invalidate])
  return null
}

/** With frameloop="demand", re-render only when the user scrolls, moves or resizes. */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const request = () => invalidate()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [invalidate])
  return null
}
