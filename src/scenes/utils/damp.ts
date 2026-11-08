import { MathUtils, type Vector3 } from 'three'

/** Frame-rate independent exponential smoothing for vectors. */
export function damp3(current: Vector3, target: Vector3, lambda: number, dt: number) {
  current.x = MathUtils.damp(current.x, target.x, lambda, dt)
  current.y = MathUtils.damp(current.y, target.y, lambda, dt)
  current.z = MathUtils.damp(current.z, target.z, lambda, dt)
}

export const damp = MathUtils.damp

/** In reduced-motion mode every damp snaps instantly. */
export const SNAP = 1000
