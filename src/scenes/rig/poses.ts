import { MathUtils, Vector3 } from 'three'
import { chapters } from '@/config/sections'
import { chapterPoses, portraitPoseOverrides, type ChapterPose, type Vec3 } from '@/config/scene'

export interface SampledPose {
  camera: Vector3
  target: Vector3
  fov: number
}

export function resolvePoses(portraitScreen: boolean): ChapterPose[] {
  return chapters.map((id) =>
    portraitScreen ? { ...chapterPoses[id], ...portraitPoseOverrides[id] } : chapterPoses[id],
  )
}

/** Live target pose for the current scroll position, written by the camera rig. */
export const livePose: SampledPose = {
  camera: new Vector3(),
  target: new Vector3(),
  fov: 35,
}

const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)

const lerpVec = (out: Vector3, a: Vec3, b: Vec3, f: number) =>
  out.set(MathUtils.lerp(a[0], b[0], f), MathUtils.lerp(a[1], b[1], f), MathUtils.lerp(a[2], b[2], f))

/** Samples the chapter timeline at `t` (0 → chapters - 1) without allocating. */
export function samplePose(poses: ChapterPose[], t: number, out: SampledPose) {
  const max = poses.length - 1
  if (max === 0) {
    const [only] = poses
    out.camera.set(...only.camera)
    out.target.set(...only.target)
    out.fov = only.fov
    return out
  }
  const clamped = MathUtils.clamp(t, 0, max)
  const i = Math.min(Math.floor(clamped), max - 1)
  const f = smootherstep(clamped - i)
  const a = poses[i]
  const b = poses[i + 1]

  lerpVec(out.camera, a.camera, b.camera, f)
  lerpVec(out.target, a.target, b.target, f)
  out.fov = MathUtils.lerp(a.fov, b.fov, f)
  return out
}
