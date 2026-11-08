/** Single source of truth for timing so every animation shares one rhythm. */
export const ease = {
  /** Long, cinematic deceleration — the default for reveals. */
  out: 'expo.out',
  inOut: 'expo.inOut',
  soft: 'power3.out',
  snap: 'power4.inOut',
} as const

export const duration = {
  fast: 0.45,
  base: 0.9,
  slow: 1.4,
  epic: 2.2,
} as const

export const stagger = {
  chars: 0.025,
  words: 0.06,
  lines: 0.12,
  items: 0.1,
} as const

export const lenisOptions = {
  lerp: 0.085,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
} as const
