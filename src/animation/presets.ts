/**
 * Reusable animation recipes. Components and sections compose these instead
 * of re-declaring tween settings, so the motion language stays coherent.
 */
import { gsap } from './gsap'
import { duration, ease, stagger } from '@/config/motion'

type Targets = gsap.TweenTarget
type ScrollVars = ScrollTrigger.Vars | undefined

/** Default viewport position at which scroll reveals start. */
export const REVEAL_START = 'top 85%'

/** Masked lines / words / chars sliding up from below their mask. */
export function riseIn(targets: Targets, vars: gsap.TweenVars = {}) {
  return gsap.from(targets, {
    yPercent: 115,
    duration: duration.slow,
    ease: ease.out,
    stagger: stagger.lines,
    ...vars,
  })
}

/**
 * Clip-path wipe with a slight lift. Use for anything accent: fading accent
 * through opacity passes through olive/gold mid-tones, a wipe never does.
 */
export function wipeIn(targets: Targets, vars: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { clipPath: 'inset(100% 0% 0% 0%)', y: 18 },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      y: 0,
      duration: duration.slow,
      ease: ease.out,
      stagger: stagger.items,
      clearProps: 'clipPath',
      ...vars,
    },
  )
}

/** Soft fade-and-lift for blocks of UI (white/neutral content only — see wipeIn). */
export function fadeUp(targets: Targets, vars: gsap.TweenVars = {}) {
  return gsap.from(targets, {
    y: 40,
    autoAlpha: 0,
    duration: duration.base,
    ease: ease.soft,
    stagger: stagger.items,
    ...vars,
  })
}

/**
 * Image-mask transition: the frame opens with a clip-path wipe while the
 * media inside settles from an over-scaled state, like a lens pulling focus.
 */
export function maskReveal(frame: Element, media: Element | null, scrollTrigger?: ScrollVars) {
  const tl = gsap.timeline({ scrollTrigger, defaults: { duration: duration.epic, ease: ease.out } })
  tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
  if (media) tl.fromTo(media, { scale: 1.35 }, { scale: 1 }, 0)
  return tl
}

/**
 * Pins `pin` and translates `track` horizontally by its overflow, so vertical
 * scrolling drives a horizontal gallery. Returns the tween, which nested
 * triggers can use as their `containerAnimation`.
 */
export function horizontalPin(
  track: HTMLElement,
  pin: HTMLElement,
  onUpdate?: (self: ScrollTrigger) => void,
) {
  const distance = () => track.scrollWidth - window.innerWidth
  return gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate,
    },
  })
}

/** Continuous scrubbed drift for parallax layers. `speed` is in yPercent. */
export function parallax(target: Element, speed: number, trigger: Element = target) {
  return gsap.fromTo(
    target,
    { yPercent: -speed },
    {
      yPercent: speed,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  )
}
