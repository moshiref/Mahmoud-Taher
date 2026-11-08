import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import {
  ExtrudeGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  Plane,
  Shape,
  Vector3,
  type BufferGeometry,
  type Group,
  type InstancedMesh,
  type Material,
  type PerspectiveCamera,
} from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontUrl from '@/assets/fonts/geist-extrabold.typeface.json?url'
import { palette } from '@/config/scene'
import { brand } from '@/content/brand'
import { heroIntro } from '@/lib/heroIntro'
import { heroMarquee } from '@/lib/heroMarquee'
import { damp } from '../utils/damp'

/** World depth of the strip — in front of the portrait (z = 0) for real layering. */
const Z = 1.4
/** Cap height as a share of the DOM slot's height… */
const CAP_IN_SLOT = 0.44
/** …capped so the longest service always fits within this share of the screen width. */
const MAX_WORD_SHARE = 0.8
/** Travel speed in cap-heights per second, and while hovered. */
const SPEED = 3.1
const HOVER_FACTOR = 0.1
/** Gap between a word and the next separator, in cap heights. */
const GAP = 1.15
/** Backward lean so the bevels and extrusion read from the camera. */
const TILT = -0.09
/** Copies of the sequence: enough that the wrap always happens off-screen. */
const COPIES = 3

/** Accent words sit forward, white words a step back: two depth levels. */
const DEPTH = { accent: 0.18, white: -0.32, separator: 0 }

/** Elegant separator: a small extruded diamond, flat accent face. */
function diamond(bevelSegments: number) {
  const r = 0.2
  const s = new Shape()
  s.moveTo(0, r)
  s.lineTo(r * 0.72, 0)
  s.lineTo(0, -r)
  s.lineTo(-r * 0.72, 0)
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments })
  g.center()
  return g
}

interface Item {
  mesh: number
  index: number
  base: number
  depth: number
  /** Half the item's width, for off-screen culling. */
  half: number
}

/**
 * The hero's services as a 3D installation: bevelled, extruded words in
 * alternating accent and white, separated by diamonds, travelling along a
 * gentle arc that turns each word with the path and lets the ends recede.
 *
 * It renders into the hero's DOM slot ([data-services-slot]) — position and
 * size follow that box every frame, so the layout stays the DOM's job.
 * Accent faces are flat (unlit, no tone mapping, no fog) so the brand accent
 * never shades toward gold; depth comes from glossy black sides.
 */
export function ServicesMarquee3D({ quality, reduced }: { quality: 'high' | 'low'; reduced: boolean }) {
  const font = useLoader(FontLoader, fontUrl)
  const root = useRef<Group>(null)
  const meshes = useRef<(InstancedMesh | null)[]>([])
  const motion = useRef({ offset: 0, factor: 1 })

  const curveSegments = quality === 'high' ? 8 : 5
  const bevelSegments = quality === 'high' ? 3 : 2

  // ── Geometry: one centred extrusion per service + one separator, shared by all copies.
  const geo = useMemo(() => {
    const words = brand.specializations.map((label) => {
      const g: BufferGeometry = new TextGeometry(label.toUpperCase(), {
        font,
        size: 1,
        depth: 0.3,
        curveSegments,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.024,
        bevelSegments,
      })
      g.computeBoundingBox()
      const b = g.boundingBox!
      g.center()
      return { geometry: g, width: b.max.x - b.min.x, height: b.max.y - b.min.y }
    })
    const separator = { geometry: diamond(bevelSegments), width: 0.3, height: 0.4 }
    const capHeight = Math.max(...words.map((w) => w.height))
    return { words, separator, capHeight }
  }, [font, curveSegments, bevelSegments])

  // ── Materials: flat accent / white faces, glossy black depth; all clipped by the reveal plane.
  const clip = useMemo(() => new Plane(new Vector3(0, -1, 0), -1e6), [])
  const mat = useMemo(() => {
    const flat = { toneMapped: false, fog: false, clippingPlanes: [clip] }
    const accent = new MeshBasicMaterial({ color: palette.accent, ...flat })
    const white = new MeshBasicMaterial({ color: palette.white, ...flat })
    const side = new MeshPhysicalMaterial({
      color: palette.black,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.8,
      clippingPlanes: [clip],
    })
    return { accent, white, side, all: [accent, white, side] }
  }, [clip])

  useEffect(
    () => () => {
      geo.words.forEach((w) => w.geometry.dispose())
      geo.separator.geometry.dispose()
      mat.all.forEach((m) => m.dispose())
    },
    [geo, mat],
  )

  // ── Layout in geometry units (1 = font size). Mesh 0..n-1 are words, n is the separator.
  const layout = useMemo(() => {
    const n = geo.words.length
    const items: Item[] = []
    const counts = new Array(n + 1).fill(0)
    let cursor = 0
    for (let c = 0; c < COPIES; c++) {
      geo.words.forEach((w, i) => {
        items.push({ mesh: i, index: counts[i]++, base: cursor + w.width / 2, depth: i % 2 === 0 ? DEPTH.accent : DEPTH.white, half: w.width / 2 })
        cursor += w.width + GAP * geo.capHeight
        items.push({ mesh: n, index: counts[n]++, base: cursor + geo.separator.width / 2, depth: DEPTH.separator, half: geo.separator.width / 2 })
        cursor += geo.separator.width + GAP * geo.capHeight
      })
    }
    const maxWidth = Math.max(...geo.words.map((w) => w.width))
    return { items, counts, total: cursor, maxWidth }
  }, [geo])

  const meshSpecs = useMemo(
    () => [
      ...geo.words.map((w, i) => ({ geometry: w.geometry, material: [i % 2 === 0 ? mat.accent : mat.white, mat.side] as Material[] })),
      { geometry: geo.separator.geometry, material: [mat.accent, mat.side] as Material[] },
    ],
    [geo, mat],
  )

  // Scratch objects: the frame loop allocates nothing.
  const tmp = useMemo(
    () => ({ dummy: new Object3D(), ndc: new Vector3(), centre: new Vector3(), top: new Vector3(), bottom: new Vector3(), left: new Vector3() }),
    [],
  )

  useFrame((state, dt) => {
    const g = root.current
    const slot = heroMarquee.slot
    const r = slot?.getBoundingClientRect()
    if (!g || !r || r.height === 0) {
      if (g) g.visible = false
      if (reduced) state.invalidate() // keep checking until the slot exists
      return
    }
    g.visible = r.bottom > 0 && r.top < state.size.height
    if (!g.visible) return

    // Project the DOM slot onto the plane z = Z (exact, via camera rays).
    const cam = state.camera as PerspectiveCamera
    const { width: vw, height: vh } = state.size
    const toPlane = (px: number, py: number, out: Vector3) => {
      tmp.ndc.set((px / vw) * 2 - 1, -(py / vh) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize()
      return out.copy(cam.position).addScaledVector(tmp.ndc, (Z - cam.position.z) / tmp.ndc.z)
    }
    const cy = r.top + r.height / 2
    toPlane(vw / 2, cy, tmp.centre)
    toPlane(vw / 2, r.top, tmp.top)
    toPlane(vw / 2, r.bottom, tmp.bottom)
    toPlane(0, cy, tmp.left)

    const slotHeight = tmp.top.y - tmp.bottom.y
    const screenWidth = 2 * (tmp.centre.x - tmp.left.x)
    const cap = Math.min(slotHeight * CAP_IN_SLOT, (screenWidth * MAX_WORD_SHARE * geo.capHeight) / layout.maxWidth)
    const scale = cap / geo.capHeight
    g.position.copy(tmp.centre)
    g.scale.setScalar(scale)
    g.rotation.x = TILT

    // Reveal: a plane rising through the slot (a wipe — never a fade).
    clip.constant = tmp.bottom.y - slotHeight * 0.1 + heroIntro.marquee * slotHeight * 1.4

    // Motion: constant speed; hovering eases it into a slow drift.
    const m = motion.current
    m.factor = damp(m.factor, heroMarquee.hovered ? HOVER_FACTOR : 1, 3, dt)
    if (!reduced) m.offset += Math.min(dt, 0.05) * SPEED * geo.capHeight * m.factor

    // Gentle arc: flat enough that words leave the screen while still facing the
    // camera (≈14° of turn at the edges) — subtle rotation and depth along the path.
    const halfWidth = (tmp.centre.x - tmp.left.x) / scale
    const radius = Math.max(halfWidth * 4, halfWidth + layout.maxWidth + 2)
    const { total } = layout
    // Camera distance to the strip plane, in geometry units (for perspective culling).
    const distance = (cam.position.z - Z) / scale

    for (const item of layout.items) {
      let s = (item.base - m.offset) % total
      if (s < 0) s += total
      s -= total / 2 // the wrap sits at ±total/2, far beyond either screen edge
      const theta = s / radius
      const x = radius * Math.sin(theta)
      const z = radius * (Math.cos(theta) - 1) + item.depth
      // Cull anything fully off-screen (or round the back of the arc): no mirrored
      // words, and the wrap can never be seen.
      const facing = -x * Math.sin(theta) + (distance - z) * Math.cos(theta) > 0
      const onScreen = facing && Math.abs(x) - item.half < halfWidth * ((distance - z) / distance)
      tmp.dummy.position.set(x, 0, z)
      tmp.dummy.rotation.set(0, theta, Math.sin(theta * 1.6) * 0.035)
      tmp.dummy.scale.setScalar(onScreen ? 1 : 0)
      tmp.dummy.updateMatrix()
      meshes.current[item.mesh]?.setMatrixAt(item.index, tmp.dummy.matrix)
    }
    meshes.current.forEach((mesh) => mesh && (mesh.instanceMatrix.needsUpdate = true))
  })

  return (
    <group ref={root} visible={false}>
      {meshSpecs.map((spec, i) => (
        <instancedMesh
          key={i}
          ref={(mesh) => {
            meshes.current[i] = mesh
          }}
          args={[spec.geometry, spec.material, layout.counts[i]]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}

