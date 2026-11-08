import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@/animation/gsap'
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

/** Generic scroll-triggered entrance for blocks of UI. */
export function Reveal({ as = 'div', children, className, stagger = false, delay = 0, y = 40, start = REVEAL_START, mode = 'fade' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reducedMotion) return
      const targets = stagger ? Array.from(el.children) : el
      const vars = { delay, scrollTrigger: { trigger: el, start, once: true } }
      if (mode === 'wipe') wipeIn(targets, vars)
      else fadeUp(targets, { y, ...vars })
    },
    { dependencies: [reducedMotion, mode], scope: ref },
  )

  return createElement(as, { ref, className }, children)
}
