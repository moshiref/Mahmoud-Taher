import type { ChapterId } from './sections'

export type Vec3 = [number, number, number]

export interface ChapterPose {
  camera: Vec3
  target: Vec3
  fov: number
}

/**
 * Camera key poses, one per chapter. When later sections ship, add a pose
 * here and the camera will travel between them as you scroll.
 */
export const chapterPoses: Record<ChapterId, ChapterPose> = {
  hero: { camera: [0, 0, 10], target: [0, 0, 0], fov: 35 },
  // Same shot as the hero: About's 3D lives in DOM-anchored slots, so the
  // camera holds still and the page scrolls past it.
  about: { camera: [0, 0, 10], target: [0, 0, 0], fov: 35 },
  work: { camera: [0, 0, 10], target: [0, 0, 0], fov: 35 },
  contact: { camera: [0, 0, 10], target: [0, 0, 0], fov: 35 },
}

/** Portrait-orientation screens get a narrower, taller framing. */
export const portraitPoseOverrides: Partial<Record<ChapterId, Partial<ChapterPose>>> = {
  hero: { camera: [0, 0, 10], target: [0, 0, 0], fov: 43 },
  about: { camera: [0, 0, 10], target: [0, 0, 0], fov: 43 },
  work: { camera: [0, 0, 10], target: [0, 0, 0], fov: 43 },
  contact: { camera: [0, 0, 10], target: [0, 0, 0], fov: 43 },
}

/**
 * Hero stage layout in world units (camera at z = 10). `landscape` matches
 * the desktop DOM layout (name left, portrait right of centre); `portrait`
 * matches the stacked mobile layout (portrait top, copy below).
 */
export const heroStage = {
  landscape: {
    portrait: { position: [1.5, -0.3, 0] as Vec3, height: 6.1 },
    slab: { position: [1.8, 0.02, -1.4] as Vec3, width: 4.3, height: 5.35 },
  },
  portrait: {
    portrait: { position: [0, 1.05, 0] as Vec3, height: 4.7 },
    slab: { position: [0.15, 1.55, -1.4] as Vec3, width: 3.5, height: 4.4 },
  },
}

/** The brand's only three colours. Never add others to the scene. */
export const palette = {
  black: '#000000',
  /** The logo's primary colour — see --c-accent in styles/tokens.css. */
  accent: '#AA9000',
  white: '#FFFFFF',
} as const
