import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { palette } from '@/config/scene'
import type { DeviceTier } from '@/lib/device'
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
        <HeroStage reduced={reduced} />
      </Suspense>
      <Suspense fallback={null}>
        <ServicesMarquee3D quality={tier} reduced={reduced} />
      </Suspense>
      <Suspense fallback={null}>
        <ExperienceNumber3D quality={tier} reduced={reduced} />
      </Suspense>
      <DustField count={preset.dust} reduced={reduced} />

      {reduced && <DemandInvalidator />}
    </Canvas>
  )
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
