import { createElement, useRef, type ElementType } from 'react'
import { gsap, SplitText, useGSAP } from '@/animation/gsap'
import { useMotion } from '@/app/providers/MotionProvider'

interface ScrubTextProps {
  as?: ElementType
  text: string
  className?: string
  /** ScrollTrigger range; end it early when the text sits near the page end. */
  start?: string
  end?: string
}

/**
 * Reading-pace reveal: each word brightens as the scroll position passes it,
 * so the paragraph "illuminates" under the reader's eye.
 */
export function ScrubText({ as = 'p', text, className, start = 'top 80%', end = 'bottom 45%' }: ScrubTextProps) {
  const ref = useRef<HTMLElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reducedMotion) return
      const split = SplitText.create(el, {
        type: 'words',
        autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { opacity: 0.12, filter: 'blur(4px)' },
            {
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'none',
              stagger: 0.1,
              scrollTrigger: { trigger: el, start, end, scrub: 0.6 },
            },
          )
        },
      })
      return () => split.revert()
    },
    { dependencies: [reducedMotion, text, start, end], scope: ref, revertOnUpdate: true },
  )

  return createElement(as, { ref, className }, text)
}
