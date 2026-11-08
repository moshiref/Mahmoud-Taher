import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { MathUtils, MeshBasicMaterial, MeshPhysicalMaterial, Plane, Vector3, type Group, type PerspectiveCamera } from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontUrl from '@/assets/fonts/geist-extrabold.typeface.json?url'
import { palette } from '@/config/scene'
import { about } from '@/content/about'
import { aboutScene } from '@/lib/aboutScene'
import { scrollState } from '@/lib/scrollStore'
import { damp } from '../utils/damp'

/** World depth of the number's plane. */
const Z = 0
/** Share of the slot the number fills (height and width). */
const FILL = 0.86

/**
 * The About centerpiece: "08" as a sculpted object. Deep extrusion and soft
 * bevels; flat brand-accent faces (unlit, no tone mapping, no fog — the
 * accent stays exactly the logo colour) over glossy black sides that catch the
 * studio's white light. It fills the DOM slot [data-experience-slot], turns
 * gently in perspective as the section scrolls past, and rises in through a
 * clip plane when the stage enters view.
 */
export function ExperienceNumber3D({ quality, reduced }: { quality: 'high' | 'low'; reduced: boolean }) {
  const font = useLoader(FontLoader, fontUrl)
  const root = useRef<Group>(null)
  const spin = useRef<Group>(null)

  const geo = useMemo(() => {
    const g = new TextGeometry(about.experience.display, {
      font,
      size: 1,
      depth: 0.42,
      curveSegments: quality === 'high' ? 14 : 8,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.018,
      bevelSegments: quality === 'high' ? 4 : 2,
    })
    g.computeBoundingBox()
    const b = g.boundingBox!
    g.center()
    return { geometry: g, width: b.max.x - b.min.x, height: b.max.y - b.min.y }
  }, [font, quality])

  const clip = useMemo(() => new Plane(new Vector3(0, -1, 0), -1e6), [])
  const materials = useMemo(
    () => [
      new MeshBasicMaterial({ color: palette.accent, toneMapped: false, fog: false, clippingPlanes: [clip] }),
      new MeshPhysicalMaterial({
        color: palette.black,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2,
        clippingPlanes: [clip],
      }),
    ],
    [clip],
  )

  useEffect(
    () => () => {
      geo.geometry.dispose()
      materials.forEach((m) => m.dispose())
    },
    [geo, materials],
  )

  const tmp = useMemo(() => ({ ndc: new Vector3(), centre: new Vector3(), top: new Vector3(), bottom: new Vector3(), left: new Vector3() }), [])
  const tilt = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    const g = root.current
    const s = spin.current
    const slot = aboutScene.slot
    const r = slot?.getBoundingClientRect()
    if (!g || !s || !r || r.height === 0) {
      if (g) g.visible = false
      if (reduced) state.invalidate()
      return
    }
    const { width: vw, height: vh } = state.size
    g.visible = r.bottom > -vh * 0.2 && r.top < vh * 1.2
    if (!g.visible) return

    // Project the DOM slot onto the plane z = Z via camera rays.
    const cam = state.camera as PerspectiveCamera
    const toPlane = (px: number, py: number, out: Vector3) => {
      tmp.ndc.set((px / vw) * 2 - 1, -(py / vh) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize()
      return out.copy(cam.position).addScaledVector(tmp.ndc, (Z - cam.position.z) / tmp.ndc.z)
    }
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    toPlane(cx, cy, tmp.centre)
    toPlane(cx, r.top, tmp.top)
    toPlane(cx, r.bottom, tmp.bottom)
    toPlane(r.left, cy, tmp.left)
    const slotH = tmp.top.y - tmp.bottom.y
    const slotW = 2 * (tmp.centre.x - tmp.left.x)
    const scale = Math.min((slotH * FILL) / geo.height, (slotW * FILL) / geo.width)

    // Entrance: rises through a clip plane while settling forward.
    const reveal = aboutScene.reveal
    clip.constant = tmp.bottom.y + reveal * slotH * 1.15
    g.position.set(tmp.centre.x, tmp.centre.y, Z - (1 - reveal) * 1.5)
    g.scale.setScalar(scale)

    // Scroll-linked perspective: the number turns as the section passes.
    const progress = MathUtils.clamp((vh - r.top) / (vh + r.height), 0, 1)
    const k = reduced ? 1000 : 3
    tilt.current.y = damp(tilt.current.y, MathUtils.lerp(-0.3, 0.22, progress), k, dt)
    tilt.current.x = damp(tilt.current.x, MathUtils.lerp(0.16, -0.08, progress) - scrollState.pointer.y * 0.03, k, dt)
    s.rotation.set(tilt.current.x, tilt.current.y, 0)
    if (!reduced) s.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.012
  })

  return (
    <group ref={root} visible={false}>
      <group ref={spin}>
        <mesh geometry={geo.geometry} material={materials} />
      </group>
    </group>
  )
}
