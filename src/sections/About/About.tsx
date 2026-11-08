import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { about } from '@/content/about'
import { useMotion } from '@/app/providers/MotionProvider'
import { aboutScene } from '@/lib/aboutScene'
import { watchLiveRegion } from '@/lib/sceneActivity'
import { hasWebGL } from '@/lib/device'
import { ServicesIndex } from './ServicesIndex'
import styles from './About.module.css'

/**
 * About — a typographic editorial layout (no imagery):
 *   opener   — eyebrow + headline, full width
 *   band     — the 3D "08" (scenes/about/ExperienceNumber3D) + caption | biography
 *   services — the six services as a compact 3 × 2 index (ServicesIndex)
 *   vision   — a closing row: label | statement
 * All copy comes from src/content/about.ts.
 */
export function About() {
  const root = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()
  const [webgl] = useState(hasWebGL)

  // Hand the number's slot to the 3D scene.
  useEffect(() => {
    aboutScene.slot = slot.current
    // The number turns with scroll and rises in: the scene animates while it is on screen.
    const stopLive = slot.current ? watchLiveRegion(slot.current) : undefined
    return () => {
      aboutScene.slot = null
      stopLive?.()
    }
  }, [])

  useGSAP(
    () => {
      if (reducedMotion) {
        aboutScene.reveal = 1
        return
      }
      aboutScene.reveal = 0
      // The number rises into its slot as the band enters.
      gsap.to(aboutScene, {
        reveal: 1,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: `.${styles.experience}`, start: 'top 85%', once: true },
      })
    },
    { dependencies: [reducedMotion], scope: root },
  )

  const heading = about.intro.heading.replace(/\.$/, '')

  return (
    <section ref={root} id="about" data-chapter className={styles.about} aria-labelledby="about-title">
      <header className={styles.opener}>
        <Reveal mode="wipe">
          <span className="eyebrow">{about.intro.eyebrow}</span>
        </Reveal>
        <SplitReveal as="h2" id="about-title" type="lines" className={styles.heading}>
          {heading}
          {about.intro.heading.endsWith('.') && <span className={styles.dot}>.</span>}
        </SplitReveal>
      </header>

      <div className={styles.band}>
        {/* Experience */}
        <div className={styles.lead}>
          <div className={styles.experience}>
            <div ref={slot} className={styles.numberSlot} data-experience-slot aria-hidden="true">
              {!webgl && <span className={styles.numberFallback}>{about.experience.display}</span>}
            </div>
            <p className="sr-only">{about.experience.text}</p>
            <div className={styles.caption}>
              <SplitReveal as="p" type="words" className={styles.captionText}>
                {about.experience.caption}
              </SplitReveal>
              <SplitReveal as="p" type="lines" className={styles.role}>
                {about.title}
              </SplitReveal>
            </div>
          </div>
        </div>

        {/* Biography */}
        <div className={styles.bio}>
          {about.biography.map((paragraph, i) => (
            <SplitReveal key={i} as="p" type="lines" className={i === 0 ? styles.bioLead : styles.bioBody}>
              {paragraph}
            </SplitReveal>
          ))}
        </div>
      </div>

      {/* Services: compact 3 × 2 index */}
      {/* Services: compact 3 × 2 index with a travelling highlight */}
      <ServicesIndex />

      {/* Vision: closing row */}
      <figure className={styles.vision}>
        <Reveal as="figcaption" mode="wipe" start="top 98%" className={styles.visionLabel}>
          <span className="eyebrow">{about.vision.heading}</span>
        </Reveal>
        <SplitReveal as="blockquote" type="lines" start="top 98%" className={styles.visionText}>
          {about.vision.text}
        </SplitReveal>
      </figure>
    </section>
  )
}
