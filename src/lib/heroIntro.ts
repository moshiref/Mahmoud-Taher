/**
 * Progress values for the hero's 3D reveal. The DOM-side intro timeline
 * (GSAP, in sections/Hero) tweens these; the WebGL stage reads them every
 * frame. 0 = hidden, 1 = fully revealed. `dolly` is 1 → 0 (camera push-in).
 */
export const heroIntro = {
  slab: 0,
  portrait: 0,
  rim: 0,
  /** The 3D services marquee rising into its slot. */
  marquee: 0,
  dolly: 1,
}

export function completeHeroIntro() {
  heroIntro.slab = 1
  heroIntro.portrait = 1
  heroIntro.rim = 1
  heroIntro.marquee = 1
  heroIntro.dolly = 0
}
