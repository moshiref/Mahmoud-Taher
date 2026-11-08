export type DeviceTier = 'low' | 'high'

/**
 * Coarse capability heuristic used to pick render quality up front.
 * The scene also adapts at runtime through drei's PerformanceMonitor.
 */
export function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high'
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 768
  return small || coarse || cores <= 4 || memory <= 4 ? 'low' : 'high'
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
