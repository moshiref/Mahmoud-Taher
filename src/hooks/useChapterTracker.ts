import type { RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/animation/gsap'
import { setChapterPosition } from '@/lib/scrollStore'

/**
 * Converts scroll position into a continuous chapter value for the 3D rig.
 * Each `[data-chapter]` section after the first contributes 0 → 1 while its
 * top travels from the bottom of the viewport to the top. Summed, that gives
 * e.g. 2.4 = 40 % of the way from chapter 2 into chapter 3.
 *
 * Call it from the page component: parent effects run after children, so
 * every pin inside a section already exists and offsets are measured right.
 */
export function useChapterTracker(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>('[data-chapter]')
      const progress = sections.map(() => 0)
      const commit = () => setChapterPosition(progress.reduce((sum, p) => sum + p, 0))

      sections.slice(1).forEach((section, i) => {
        const record = (self: ScrollTrigger) => {
          progress[i + 1] = self.progress
          commit()
        }
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'top top',
          onUpdate: record,
          onRefresh: record,
        })
      })
    },
    { scope },
  )
}
