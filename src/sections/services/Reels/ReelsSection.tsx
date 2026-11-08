import { useRef } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { horizontalPin } from '@/animation/presets'
import { MediaSlot } from '@/components/media/MediaSlot'
import { reels } from '@/content/services'
import { ServiceHeader } from '../ServiceHeader'
import styles from './ReelsSection.module.css'

const FPS = 24
/** Nominal timeline length the timecode runs through — decorative only. */
const TIMELINE_SECONDS = 90

function timecode(seconds: number) {
  const total = Math.floor(seconds * FPS)
  const ff = total % FPS
  const s = Math.floor(total / FPS)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`
}

/**
 * Reels Production — an editing timeline. Vertical frames ride a pinned
 * horizontal track under a fixed playhead; the clip crossing the playhead
 * is "in focus" (full scale, accent frame) while the rest recede, and the
 * timecode runs with the scroll. Mobile gets a native swipe carousel.
 */
export function ReelsSection() {
  const root = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const tc = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        if (!track.current || !pin.current) return
        const cards = gsap.utils.toArray<HTMLElement>('[data-reel]')

        // Dynamic framing: scale and dim each clip by its distance from the playhead.
        const frame = () => {
          const centre = window.innerWidth / 2
          for (const card of cards) {
            const r = card.getBoundingClientRect()
            const d = Math.min(1, Math.abs(r.left + r.width / 2 - centre) / (window.innerWidth * 0.55))
            gsap.set(card, { scale: 1 - d * 0.18, opacity: 1 - d * 0.5 })
            card.dataset.active = String(d < 0.16)
          }
        }

        horizontalPin(track.current, pin.current, (self) => {
          if (tc.current) tc.current.textContent = timecode(self.progress * TIMELINE_SECONDS)
          frame()
        })
        frame()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={reels.id} data-chapter className={styles.reels} aria-labelledby={`${reels.id}-title`}>
      <div ref={pin} className={styles.pin}>
        <div className={styles.hud} aria-hidden="true">
          <span className={styles.rec}>
            <i /> REC
          </span>
          <span ref={tc} className={styles.timecode}>
            00:00:00:00
          </span>
          <span>{FPS} FPS · 9:16</span>
        </div>

        <div ref={track} className={styles.track}>
          <ServiceHeader service={reels} className={styles.intro} />

          {reels.clips.map((clip, i) => (
            <figure key={clip.label} className={styles.reel} data-reel>
              <MediaSlot media={clip} ratio="9 / 16" className={styles.media} />
              <figcaption className={`${styles.caption} t-label`}>
                <span>Clip {String(i + 1).padStart(2, '0')}</span>
                <span className={styles.dot} aria-hidden="true" />
              </figcaption>
            </figure>
          ))}

          <div className={styles.outro}>
            <span className="t-label">End of timeline</span>
            <p className="t-serif">Your next reel starts here.</p>
          </div>
        </div>

        <div className={styles.playhead} aria-hidden="true" />
      </div>
    </section>
  )
}
