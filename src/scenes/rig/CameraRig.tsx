import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { heroIntro } from '@/lib/heroIntro'
import { scrollState } from '@/lib/scrollStore'
import { damp, damp3, SNAP } from '../utils/damp'
import { livePose, resolvePoses, samplePose } from './poses'

/**
 * Scroll-driven cinematography: samples the chapter timeline, adds the intro
 * push-in and a gentle handheld drift from the pointer, then eases the lens
 * toward the result.
 */
export function CameraRig({ reduced }: { reduced: boolean }) {
  const camera = useThree((s) => s.camera)
  const portraitScreen = useThree((s) => s.size.width / s.size.height < 1)
  const poses = useMemo(() => resolvePoses(portraitScreen), [portraitScreen])

  const lookAt = useRef(new Vector3())
  const desired = useRef(new Vector3())
  const pointer = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    samplePose(poses, scrollState.chapter, livePose)

    const k = reduced ? SNAP : 2.4
    if (!reduced) {
      pointer.current.x = damp(pointer.current.x, scrollState.pointer.x, 2, dt)
      pointer.current.y = damp(pointer.current.y, scrollState.pointer.y, 2, dt)
    }
    const breath = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.4) * 0.05
    // The intro push-in only applies while the hero is the active shot.
    const inHero = 1 - MathUtils.clamp(scrollState.chapter, 0, 1)

    desired.current.copy(livePose.camera)
    desired.current.x += pointer.current.x * (portraitScreen ? 0.12 : 0.5)
    desired.current.y += pointer.current.y * (portraitScreen ? 0.08 : 0.28) + breath
    desired.current.z += heroIntro.dolly * 3.5 * inHero

    damp3(camera.position, desired.current, k, dt)
    damp3(lookAt.current, livePose.target, k, dt)
    camera.lookAt(lookAt.current)

    if (camera instanceof PerspectiveCamera) {
      const fov = damp(camera.fov, livePose.fov, k, dt)
      if (Math.abs(fov - camera.fov) > 1e-3) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
    }
  })

  return null
}
