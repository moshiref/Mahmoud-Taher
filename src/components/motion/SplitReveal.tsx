import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { ScrollTrigger, SplitText, useGSAP } from '@/animation/gsap'
import { REVEAL_START, riseIn } from '@/animation/presets'
import { duration, stagger } from '@/config/motion'
import { useIntro } from '@/app/providers/IntroProvider'
import { useMotion } from '@/app/providers/MotionProvider'

export type SplitMode = 'lines' | 'words' | 'chars'

interface SplitRevealProps {
  as?: ElementType
  children: ReactNode
  className?: string
  id?: string
  /** Granularity of the reveal. Every mode is masked per line. */
  type?: SplitMode
  /** 'scroll' plays on entering the viewport, 'intro' after the preloader. */
  play?: 'scroll' | 'intro'
  delay?: number
  start?: string
}

/**
 * Masked text reveal built on GSAP SplitText. `autoSplit` re-splits on
 * resize and font load, and the tween returned from `onSplit` is rebuilt
 * with it, so line breaks always stay correct.
 */
export function SplitReveal({
  as = 'div',
  children,
  className,
  id,
  type = 'lines',
  play = 'scroll',
  delay = 0,
  start = REVEAL_START,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const { reducedMotion } = useMotion()
  const { introDone } = useIntro()

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!el || reducedMotion || !contextSafe) return
      if (play === 'intro' && !introDone) {
        el.style.visibility = 'hidden'
        return
      }

      // Scroll reveals split and animate only when the text reaches the screen
      // (until then it is just hidden): splitting every heading up front was a
      // large share of the intro's main-thread work on phones.
      if (play === 'scroll') {
        el.style.visibility = 'hidden'
        let split: SplitText | undefined
        const trigger = ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: contextSafe(() => {
            el.style.visibility = ''
            split = splitAndRise(el)
          }),
        })
        return () => {
          trigger.kill()
          split?.revert()
          el.style.visibility = ''
        }
      }

      el.style.visibility = ''
      const split = splitAndRise(el)
      return () => split.revert()
    },
    { dependencies: [reducedMotion, introDone, play, type], scope: ref, revertOnUpdate: true },
  )

  function splitAndRise(el: HTMLElement) {
    return SplitText.create(el, {
      type: type === 'lines' ? 'lines' : `lines,${type}`,
      mask: 'lines',
      autoSplit: true,
      linesClass: 'split-line',
      onSplit(self) {
        const targets = type === 'chars' ? self.chars : type === 'words' ? self.words : self.lines
        return riseIn(targets, {
          delay,
          duration: type === 'chars' ? duration.slow : duration.epic * 0.75,
          stagger: type === 'chars' ? stagger.chars : type === 'words' ? stagger.words : stagger.lines,
          rotate: type === 'chars' ? 8 : 0,
          transformOrigin: '0% 100%',
        })
      },
    })
  }

  return createElement(as, { ref, className, id }, children)
}
