import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { ScrollTrigger, useGSAP } from '@/animation/gsap'
import { fadeUp, REVEAL_START, wipeIn } from '@/animation/presets'
import { useMotion } from '@/app/providers/MotionProvider'

interface RevealProps {
  as?: ElementType
  children: ReactNode
  className?: string
  /** Animate direct children in sequence instead of the wrapper itself. */
  stagger?: boolean
  delay?: number
  y?: number
  start?: string
  /** 'wipe' reveals with a clip-path instead of opacity (use for accent content). */
  mode?: 'fade' | 'wipe'
}

/**
 * Generic scroll-triggered entrance for blocks of UI.
 *
 * Content waiting below the fold is only hidden (one inline style); the tween
 * is built when it reaches the screen. Building every page's tweens up front
 * made GSAP parse and measure dozens of elements during the intro — the
 * single biggest main-thread cost on phones.
 */
export function Reveal({
  as = 'div',
  children,
  className,
  stagger = false,
  delay = 0,
  y = 40,
  start = REVEAL_START,
  mode = 'fade',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!el || reducedMotion || !contextSafe) return
      const targets = stagger ? (Array.from(el.children) as HTMLElement[]) : [el]
      const show = () => targets.forEach((t) => (t.style.visibility = ''))
      targets.forEach((t) => (t.style.visibility = 'hidden'))
      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        // contextSafe: tweens made later still revert with this component.
        onEnter: contextSafe(() => {
          show()
          if (mode === 'wipe') wipeIn(targets, { delay })
          else fadeUp(targets, { y, delay })
        }),
      })
      return () => {
        trigger.kill()
        show()
      }
    },
    { dependencies: [reducedMotion, mode], scope: ref },
  )

  return createElement(as, { ref, className }, children)
}
