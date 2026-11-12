import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { wipeIn } from '@/animation/presets'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Typewriter } from '@/components/motion/Typewriter'
import { Button } from '@/components/ui/Button'
import { Viewfinder } from '@/components/viewfinder/Viewfinder'
import { brand } from '@/content/brand'
import { useIntro } from '@/app/providers/IntroProvider'
import { useMotion } from '@/app/providers/MotionProvider'
import { hasWebGL, isFinePointer } from '@/lib/device'
import { completeHeroIntro, heroIntro } from '@/lib/heroIntro'
import { heroMarquee } from '@/lib/heroMarquee'
import { watchLiveRegion } from '@/lib/sceneActivity'
import styles from './Hero.module.css'

/**
 * The opening shot. The portrait, accent slab and light live in the WebGL
 * scene (scenes/hero); this component owns the typography and conducts the
 * whole sequence — 3D reveal values included — from one GSAP timeline.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const services = useRef<HTMLDivElement>(null)
  const [webgl] = useState(hasWebGL)
  const { introDone } = useIntro()
  const { reducedMotion, scrollTo } = useMotion()
  // The scroll cue only appears when a section actually follows the hero.
  const [next, setNext] = useState<Element | null>(null)
  useEffect(() => setNext(root.current?.nextElementSibling ?? null), [])

  // The hero's 3D (portrait, marquee) animates every frame only while the hero is on screen.
  useEffect(() => (root.current ? watchLiveRegion(root.current) : undefined), [])

  // The 3D services marquee renders into this slot; hovering slows it to a drift.
  useEffect(() => {
    const el = services.current
    if (!el) return
    heroMarquee.slot = el
    const enter = () => (heroMarquee.hovered = true)
    const leave = () => (heroMarquee.hovered = false)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      heroMarquee.slot = null
      heroMarquee.hovered = false
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])


  useGSAP(
    (_, contextSafe) => {
      if (!introDone) return
      if (reducedMotion) {
        completeHeroIntro()
        return
      }

      // Phases 2 & 3 — set, subject, light, then copy.
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to(heroIntro, { dolly: 0, duration: 2.4 }, 0)
        .to(heroIntro, { slab: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
        .to(heroIntro, { portrait: 1, duration: 1.5, ease: 'power3.inOut' }, 0.3)
        .to(heroIntro, { rim: 1, duration: 1.2, ease: 'power2.out' }, 1.3)
        .from(`.${styles.dot}`, { scale: 0, duration: 0.7, ease: 'back.out(3)' }, 1.15)
        .from('[data-hero-line]', { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.95)
        .add(wipeIn('[data-hero-fade]', { duration: 1.1, stagger: 0.08 }), 1.15)
        .add(wipeIn('[data-hero-spec]', { duration: 1, stagger: 0.07 }), 1.4)
        .to(heroIntro, { marquee: 1, duration: 1.3 }, 1.45)
        .add(wipeIn('[data-viewfinder]', { duration: 1.2, y: 0 }), 1.6)

      // Phase 4 — scrolling out: the copy outruns the scroll (parallax, no fade —
      // fading the accent CTA would pass through olive).
      // Landscape only: on portrait layouts the copy already travels 1:1 with the photo.
      gsap.matchMedia().add('(min-aspect-ratio: 1/1)', () => {
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
          .to(content.current, { yPercent: -22, ease: 'none' }, 0)
          .to(`.${styles.specs}`, { y: -60, ease: 'none' }, 0)
      })

      // Phase 4 — pointer parallax: type drifts against the 3D set.
      const el = content.current
      if (!el || !isFinePointer() || !contextSafe) return
      const xTo = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
      const onMove = contextSafe((e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * -18)
        yTo((e.clientY / window.innerHeight - 0.5) * -10)
      })
      window.addEventListener('pointermove', onMove, { passive: true })
      return () => window.removeEventListener('pointermove', onMove)
    },
    { dependencies: [introDone, reducedMotion], scope: root },
  )

  return (
    <section ref={root} id="hero" data-chapter className={styles.hero} aria-labelledby="hero-title">
      <Viewfinder />

      <p className={styles.intro} data-hero-fade>
        <span className={styles.introRule} aria-hidden="true" />
        <Typewriter text={brand.introLabel} />
      </p>

      <div ref={content} className={styles.content}>
        <h1 id="hero-title" className={styles.name} aria-label={`${brand.firstName} ${brand.lastName}`}>
          <SplitReveal as="span" type="chars" play="intro" delay={0.45} className={styles.nameLine}>
            {brand.firstName.toUpperCase()}
          </SplitReveal>
          <span className={styles.nameLine}>
            <SplitReveal as="span" type="chars" play="intro" delay={0.55} className={styles.nameWord}>
              {brand.lastName.toUpperCase()}
            </SplitReveal>
            <span className={styles.dot} aria-hidden="true">
              .
            </span>
          </span>
        </h1>

        <div className={styles.mask}>
          <p className={styles.role} data-hero-line>
            {brand.role}
          </p>
        </div>

        <p className={styles.description} data-hero-fade>
          {brand.description}
        </p>

        <div className={styles.ctas} data-hero-fade>
          <Button
            href="#contact"
            variant="ghost"
            className={styles.talk}
            onClick={(e) => {
              e.preventDefault()
              const contact = document.getElementById('contact')
              if (contact) scrollTo(contact)
            }}
          >
            Let’s talk
          </Button>
        </div>
      </div>

      {/* Services: a 3D marquee (scenes/hero/ServicesMarquee3D) drawn into this slot. */}
      <div ref={services} className={styles.specs} data-hero-spec data-services-slot>
        <ul className={webgl ? 'sr-only' : styles.specsFallback} aria-label="Specializations">
          {brand.specializations.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>

      {next && (
        <button className={styles.scrollCue} onClick={() => scrollTo(next as HTMLElement)} aria-label="Scroll to next section" data-hero-fade>
          <span>Scroll</span>
          <i aria-hidden="true" />
        </button>
      )}
    </section>
  )
}
