import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  Color,
  ExtrudeGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Plane,
  Shape,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Group,
  type PerspectiveCamera,
} from 'three'
import { heroStage, palette } from '@/config/scene'
import { brand } from '@/content/brand'
import { heroIntro } from '@/lib/heroIntro'
import { currentPath } from '@/lib/router'
import { scrollState } from '@/lib/scrollStore'
import { releaseShutter } from '@/lib/shutter'
import { livePose } from '../rig/poses'
import { damp, SNAP } from '../utils/damp'
import { portraitFragment, rimFragment, silhouetteVertex } from './silhouetteShaders'

/** Shield outline — a rectangle with chamfered lower corners, echoing the logo's silhouette. */
function shieldShape(w: number, h: number) {
  const c = w * 0.2
  const s = new Shape()
  s.moveTo(-w / 2, h / 2)
  s.lineTo(w / 2, h / 2)
  s.lineTo(w / 2, -h / 2 + c)
  s.lineTo(w / 2 - c, -h / 2)
  s.lineTo(-w / 2 + c, -h / 2)
  s.lineTo(-w / 2, -h / 2 + c)
  s.closePath()
  return s
}

const SLAB_DEPTH = 0.22
const ALPHA_GRID = 64

/**
 * The hero set: the official portrait standing in front of a black shield
 * slab (the site's own black), edged by a soft white backlight.
 * Everything is revealed by the intro values in lib/heroIntro.
 */
export function HeroStage({ reduced }: { reduced: boolean }) {
  const layout = useThree((s) => (s.size.width / s.size.height < 1 ? heroStage.portrait : heroStage.landscape))
  const texture = useTexture(brand.portrait.src)
  const group = useRef<Group>(null)
  const portrait = useRef<Group>(null)
  const hovered = useRef(false)

  // Never leave the page with a pointer cursor if the scene unmounts mid-hover.
  useEffect(() => () => void (document.documentElement.style.cursor = ''), [])

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    texture.needsUpdate = true
  }, [texture])

  const aspect = brand.portrait.width / brand.portrait.height
  const ph = layout.portrait.height
  const pw = ph * aspect

  // ── Slab: black face matching the site background, glossy black edges that catch
  //    the studio light; revealed by a rising clip plane.
  const clip = useMemo(() => new Plane(new Vector3(0, -1, 0), 0), [])
  const slab = useMemo(() => {
    const geometry = new ExtrudeGeometry(shieldShape(layout.slab.width, layout.slab.height), {
      depth: SLAB_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    })
    const face = new MeshBasicMaterial({ color: palette.black, toneMapped: false, fog: false, clippingPlanes: [clip] })
    const edge = new MeshPhysicalMaterial({
      color: palette.black,
      roughness: 0.25,
      clearcoat: 1,
      envMapIntensity: 1.5,
      clippingPlanes: [clip],
    })
    return { geometry, materials: [face, edge] }
  }, [layout, clip])
  useEffect(
    () => () => {
      slab.geometry.dispose()
      slab.materials.forEach((m) => m.dispose())
    },
    [slab],
  )

  // ── The three silhouette layers. Built imperatively (not via JSX props) so the
  //    frame loop drives these exact uniform objects; disposed explicitly below.
  const layers = useMemo(() => {
    const common = { vertexShader: silhouetteVertex, transparent: true, depthWrite: false }
    return {
      portrait: new ShaderMaterial({
        ...common,
        fragmentShader: portraitFragment,
        uniforms: { uMap: { value: texture }, uReveal: { value: 0 }, uLine: { value: new Color(palette.accent) } },
      }),
      rim: new ShaderMaterial({
        ...common,
        fragmentShader: rimFragment,
        uniforms: { uMap: { value: texture }, uReveal: { value: 0 }, uStrength: { value: 0 }, uRadius: { value: new Vector2(0.012, 0.009) } },
      }),
    }
  }, [texture])
  useEffect(() => () => Object.values(layers).forEach((m) => m.dispose()), [layers])

  // Coarse alpha grid so hover only registers on the person, not empty pixels.
  const alphaGrid = useMemo(() => {
    const img = texture.image as CanvasImageSource & { width: number; height: number }
    const canvas = document.createElement('canvas')
    const w = ALPHA_GRID
    const h = Math.round(ALPHA_GRID / aspect)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx || !img) return null
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    return { w, h, data }
  }, [texture, aspect])

  const isOpaqueAt = (uv?: Vector2) => {
    if (!uv || !alphaGrid) return false
    const x = Math.min(alphaGrid.w - 1, Math.floor(uv.x * alphaGrid.w))
    const y = Math.min(alphaGrid.h - 1, Math.floor((1 - uv.y) * alphaGrid.h))
    return alphaGrid.data[(y * alphaGrid.w + x) * 4 + 3] > 128
  }

  const slabBottom = layout.slab.position[1] - layout.slab.height / 2

  useFrame((state, dt) => {
    const g = group.current
    const p = portrait.current
    if (!g || !p) return
    // The hero set belongs to the home page only.
    g.visible = currentPath() === '/'
    if (!g.visible) return
    const k = reduced ? SNAP : 1

    // The set is glued to the hero section in screen space: it scrolls exactly
    // with the DOM copy (type never slides over the face) while the camera's
    // descent only brings the marquee up. Uses the scroll-driven camera height,
    // not the pointer drift, so depth parallax survives.
    const cam = state.camera as PerspectiveCamera
    const unitsPerPx = (2 * cam.position.z * Math.tan((cam.fov * Math.PI) / 360)) / state.size.height
    g.position.y = livePose.camera.y + scrollState.y * unitsPerPx

    // Rising clip plane: keeps everything below `constant` in world Y.
    clip.constant = slabBottom - 0.1 + heroIntro.slab * (layout.slab.height + 0.3)

    layers.portrait.uniforms.uReveal.value = heroIntro.portrait
    layers.rim.uniforms.uReveal.value = heroIntro.portrait
    layers.rim.uniforms.uStrength.value = heroIntro.rim * (hovered.current ? 0.55 : 0.32)

    // Subject drifts a touch against the set for layered parallax.
    p.position.x = damp(p.position.x, layout.portrait.position[0] + scrollState.pointer.x * 0.08, 3 * k, dt)
    p.position.y = damp(p.position.y, layout.portrait.position[1] + scrollState.pointer.y * 0.04, 3 * k, dt)
    g.rotation.y = damp(g.rotation.y, scrollState.pointer.x * 0.04, 2 * k, dt)
  })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const over = currentPath() === '/' && isOpaqueAt(e.uv)
    if (over !== hovered.current) {
      hovered.current = over
      // The portrait is clickable (shutter), so show the native pointer over the person.
      document.documentElement.style.cursor = over ? 'pointer' : ''
    }
  }
  const onOut = () => {
    hovered.current = false
    document.documentElement.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!reduced && currentPath() === '/' && isOpaqueAt(e.uv)) releaseShutter()
  }

  return (
    <group ref={group}>
      <mesh
        geometry={slab.geometry}
        material={slab.materials}
        position={[layout.slab.position[0], layout.slab.position[1], layout.slab.position[2] - SLAB_DEPTH]}
      />

      <group ref={portrait} position={layout.portrait.position}>
        {/* Mirrored horizontally about its own centre: same box, same pixels.
            Hit-testing still samples the texture by UV, so hover stays exact. */}
        <group scale-x={-1}>
          <mesh material={layers.rim} position-z={-0.02}>
            <planeGeometry args={[pw, ph]} />
          </mesh>
          <mesh material={layers.portrait} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>
            <planeGeometry args={[pw, ph]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
