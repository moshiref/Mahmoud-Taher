import { useRef } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { MediaSlot } from '@/components/media/MediaSlot'
import { events } from '@/content/services'
import { ServiceHeader } from '../ServiceHeader'
import styles from './EventsSection.module.css'

/** Height of each letterbox bar once open: 2.39:1 on landscape, 4:5 on portrait. */
function barHeight() {
  const w = window.innerWidth
  const h = window.innerHeight
  const frameH = Math.min(h * 0.86, w > h ? w / 2.39 : w / 0.8)
  return Math.max((h - frameH) / 2, h * 0.07)
}

/**
 * Event Photography — a film sequence. The screen pins, letterbox bars open
 * to cinemascope, and each frame cuts in with a horizontal wipe and a slow
 * push-in. Captions sit in the lower bar like subtitles; a contact sheet
 * tracks the frame in view.
 */
export function EventsSection() {
  const root = useRef<HTMLElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const caption = useRef<HTMLSpanElement>(null)
  const sheet = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = screen.current
        if (!el) return
        const frames = gsap.utils.toArray<HTMLElement>('[data-event-frame]')
        const n = frames.length
        let current = -1

        const show = (index: number) => {
          if (index === current) return
          current = index
          if (counter.current) counter.current.textContent = String(index + 1).padStart(2, '0')
          sheet.current?.querySelectorAll('li').forEach((li, i) => (li.dataset.active = String(i === index)))
          if (caption.current) {
            gsap.fromTo(
              caption.current,
              { yPercent: 100, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', overwrite: true },
            )
            caption.current.textContent = events.frames[index].caption
          }
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${window.innerHeight * (n + 0.5)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => show(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
          },
        })

        // Opening: bars part from a closed curtain to cinemascope; title card leaves.
        tl.fromTo(`.${styles.bar}`, { height: () => window.innerHeight / 2 }, { height: barHeight, duration: 0.5, ease: 'power2.inOut' }, 0)
          .to(`.${styles.titleCard}`, { autoAlpha: 0, y: -40, duration: 0.35 }, 0.3)

        frames.forEach((frame, i) => {
          const content = frame.querySelector('[data-media-content]')
          const at = i === 0 ? 0 : 0.5 + i - 0.35
          if (i > 0) {
            tl.fromTo(frame, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.inOut' }, at)
          }
          // Slow push-in (Ken Burns) across each frame's screen time.
          if (content) tl.fromTo(content, { scale: 1.18 }, { scale: 1, duration: 1.5 }, at)
        })
        show(0)
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={events.id} data-chapter className={styles.events} aria-labelledby={`${events.id}-title`}>
      <div ref={screen} className={styles.screen}>
        {events.frames.map((frame, i) => (
          <figure key={frame.caption} className={styles.frame} data-event-frame style={{ zIndex: i }}>
            <MediaSlot media={frame.media} fill />
            <figcaption className={`${styles.staticCaption} t-serif`}>{frame.caption}</figcaption>
          </figure>
        ))}

        <div className={styles.titleCard}>
          <ServiceHeader service={events} />
        </div>

        <div className={styles.bar} data-pos="top">
          <span className="t-label">
            Frame <span ref={counter}>01</span> / {String(events.frames.length).padStart(2, '0')}
          </span>
          <span className="t-label">2.39 : 1</span>
        </div>

        <div className={styles.bar} data-pos="bottom">
          <span className={styles.captionMask}>
            <span ref={caption} className={`${styles.caption} t-serif`}>
              {events.frames[0].caption}
            </span>
          </span>
          <ol ref={sheet} className={styles.sheet} aria-hidden="true">
            {events.frames.map((frame, i) => (
              <li key={frame.caption} data-active={i === 0}>
                {String(i + 1).padStart(2, '0')}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
