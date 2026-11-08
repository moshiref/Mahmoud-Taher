import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { MediaSlot } from '@/components/media/MediaSlot'
import { ugc } from '@/content/services'
import { useMotion } from '@/app/providers/MotionProvider'
import { ServiceHeader } from '../ServiceHeader'
import styles from './UgcSection.module.css'

/** Initial "tossed on a table" rotation per phone — an unpolished, human pile. */
const PILE = [-7, 4, -2, 6, -4]
const CYCLE_MS = 2200

/**
 * UGC Creation — authentic, phone-native content. Unbranded phone frames
 * start as a casual pile and fan out as you scroll; content formats cycle,
 * lifting the matching phone, so the section feels alive and personal.
 */
export function UgcSection() {
  const root = useRef<HTMLElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const phones = gsap.utils.toArray<HTMLElement>('[data-phone]')
        const mid = (phones.length - 1) / 2
        const spread = () => (stack.current?.offsetWidth ?? 800) * 0.2

        gsap.set(phones, { rotation: (i) => PILE[i % PILE.length], x: (i) => (i - mid) * 6, y: (i) => i * -4 })
        gsap.to(phones, {
          x: (i) => (i - mid) * spread(),
          y: (i) => Math.abs(i - mid) * 34,
          rotation: (i) => (i - mid) * 7,
          ease: 'power2.inOut',
          stagger: { each: 0.04, from: 'center' },
          scrollTrigger: {
            trigger: stack.current,
            start: 'top 80%',
            end: 'center 50%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // Cycle through formats; pause while the visitor is choosing one.
  useEffect(() => {
    if (reducedMotion || paused) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % ugc.formats.length), CYCLE_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion, paused])

  return (
    <section ref={root} id={ugc.id} data-chapter className={styles.ugc} aria-labelledby={`${ugc.id}-title`}>
      <div className={styles.copy}>
        <ServiceHeader service={ugc} />
        <ul
          className={styles.formats}
          aria-label="Content formats"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {ugc.formats.map((format, i) => (
            <li key={format}>
              <button
                className={styles.chip}
                data-active={i === active}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-pressed={i === active}
              >
                {format}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div ref={stack} className={styles.stack}>
        {ugc.clips.map((clip, i) => (
          <article
            key={clip.label}
            className={styles.phone}
            data-phone
            data-active={i === active}
            style={{ zIndex: i === active ? 10 : i }}
          >
            <div className={styles.screen}>
              <MediaSlot media={clip} fill compact />
              <PhoneChrome format={ugc.formats[i % ugc.formats.length]} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Generic, platform-neutral social UI so the clips read as native content. */
function PhoneChrome({ format }: { format: string }) {
  return (
    <div className={styles.chrome} aria-hidden="true">
      <div className={styles.status}>
        <span>9:41</span>
        <span className={styles.island} />
        <span className={styles.battery} />
      </div>
      <div className={styles.actions}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.meta}>
        <span className={styles.tag}>{format}</span>
        <span className={styles.line} />
        <span className={styles.line} data-short />
      </div>
    </div>
  )
}
