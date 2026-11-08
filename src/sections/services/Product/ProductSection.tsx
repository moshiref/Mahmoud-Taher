import { useRef } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { MaskMedia } from '@/components/motion/MaskMedia'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal } from '@/components/motion/Reveal'
import { MediaSlot } from '@/components/media/MediaSlot'
import { product } from '@/content/services'
import { useMotion } from '@/app/providers/MotionProvider'
import { isFinePointer } from '@/lib/device'
import { ServiceHeader } from '../ServiceHeader'
import styles from './ProductSection.module.css'

/**
 * Product Photography — "the set". The hero shot opens from an inset frame
 * to full bleed, and a studio spotlight follows the pointer (or sweeps by
 * itself on touch), so the visitor literally lights the product.
 */
export function ProductSection() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const light = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    (_, contextSafe) => {
      const el = stage.current
      const spot = light.current
      if (!el || !spot || reducedMotion || !contextSafe) return

      // Image-masking transition: inset frame → full-bleed photograph.
      const open = { trigger: el, start: 'top 90%', end: 'top 10%', scrub: true }
      gsap.fromTo(el, { clipPath: 'inset(12% 14% 12% 14% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: open })
      gsap.fromTo(el.querySelector('[data-media-content]'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: open })

      // Spotlight position lives in CSS custom properties on the overlay.
      const pos = { x: 50, y: 45 }
      const apply = () => {
        spot.style.setProperty('--x', `${pos.x}%`)
        spot.style.setProperty('--y', `${pos.y}%`)
      }
      apply()

      if (isFinePointer()) {
        const onMove = contextSafe((e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          gsap.to(pos, {
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: true,
            onUpdate: apply,
          })
        })
        el.addEventListener('pointermove', onMove)
        return () => el.removeEventListener('pointermove', onMove)
      }

      gsap.to(pos, {
        keyframes: [
          { x: 28, y: 38 },
          { x: 70, y: 52 },
          { x: 46, y: 30 },
          { x: 50, y: 45 },
        ],
        duration: 9,
        ease: 'sine.inOut',
        repeat: -1,
        onUpdate: apply,
      })
    },
    { dependencies: [reducedMotion], scope: root },
  )

  return (
    <section ref={root} id={product.id} data-chapter className={styles.product} aria-labelledby={`${product.id}-title`}>
      <ServiceHeader service={product} className={styles.header} />

      <div ref={stage} className={styles.stage}>
        <MediaSlot media={product.stage} fill />
        <div ref={light} className={styles.light} aria-hidden="true" />
        <span className={`${styles.hint} t-label`}>Move to light the set</span>
      </div>

      <div className={styles.body}>
        <Reveal as="ol" stagger className={styles.pillars}>
          {product.pillars.map((pillar, i) => (
            <li key={pillar} className={styles.pillar}>
              <span className="t-index">0{i + 1}</span>
              <span>{pillar}</span>
            </li>
          ))}
        </Reveal>

        <div className={styles.details}>
          {product.details.map((media, i) => (
            <Parallax key={media.label} speed={i === 1 ? -8 : 6} className={styles.detail}>
              <MaskMedia className={styles.detailFrame}>
                <MediaSlot media={media} fill />
              </MaskMedia>
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  )
}
