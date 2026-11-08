import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { brand } from '@/content/brand'
import { useIntro } from '@/app/providers/IntroProvider'
import { useMotion } from '@/app/providers/MotionProvider'
import styles from './Preloader.module.css'

type Phase = 'opening' | 'waiting' | 'exiting' | 'done'

/** Never hold the visitor hostage if the GPU is slow to warm up. */
const SCENE_TIMEOUT_MS = 2800

/** Marks the header logo as visible once the intro logo has landed in it. */
const landLogo = () => (document.documentElement.dataset.logoLanded = 'true')

/**
 * Title card, kept short (~2.5 s). A accent line of light opens in the dark,
 * the official logo emerges from it, then flies into its place in the navbar
 * while the black curtain dissolves into the hero.
 */
export function Preloader() {
  const { sceneReady, completeIntro } = useIntro()
  const { reducedMotion } = useMotion()
  const root = useRef<HTMLDivElement>(null)
  const logo = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('opening')
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const id = window.setTimeout(() => setTimedOut(true), SCENE_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [])

  // Phase 1 — light, then logo.
  useGSAP(
    () => {
      if (reducedMotion) {
        setPhase('waiting')
        return
      }
      gsap
        .timeline()
        .fromTo(`.${styles.light}`, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.inOut' })
        .fromTo(
          logo.current,
          { clipPath: 'inset(50% 0% 50% 0%)', scale: 1.08 },
          { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1, ease: 'expo.out' },
          0.35,
        )
        .to(`.${styles.light}`, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.6, ease: 'expo.inOut' }, 0.85)
        .fromTo(`.${styles.caption}`, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 0.6)
        .call(() => setPhase('waiting'), undefined, 1.25)
    },
    { scope: root, dependencies: [reducedMotion] },
  )

  const { contextSafe } = useGSAP({ scope: root })

  // Phase 2 — hand the logo to the navbar and reveal the hero.
  useEffect(() => {
    if (phase !== 'waiting' || !(sceneReady || timedOut)) return
    let cancelled = false

    const exit = contextSafe(() => {
      if (cancelled) return
      setPhase('exiting')
      if (reducedMotion) {
        landLogo()
        completeIntro()
        setPhase('done')
        return
      }

      const from = logo.current?.getBoundingClientRect()
      const to = document.querySelector('[data-header-logo]')?.getBoundingClientRect()
      const tl = gsap.timeline({
        onComplete: () => {
          landLogo()
          setPhase('done')
        },
      })
      tl.to(`.${styles.caption}`, { yPercent: -110, duration: 0.5, ease: 'expo.in' })
      if (from && to && from.height > 0) {
        tl.to(
          logo.current,
          {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: to.height / from.height,
            duration: 1,
            ease: 'expo.inOut',
          },
          0.1,
        )
      } else {
        tl.to(logo.current, { autoAlpha: 0, duration: 0.5 }, 0.1)
      }
      tl.to(`.${styles.backdrop}`, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, 0.35)
        // The hero starts its reveal while the logo is still in flight.
        .call(completeIntro, undefined, 0.3)
    })

    document.fonts.ready.then(exit)
    return () => {
      cancelled = true
    }
  }, [phase, sceneReady, timedOut, reducedMotion, completeIntro, contextSafe])

  if (phase === 'done') return null

  return (
    <div ref={root} className={styles.loader} data-phase={phase} role="status" aria-live="polite" aria-label="Loading">
      <div className={styles.backdrop} />
      <div className={styles.light} />
      <div ref={logo} className={styles.logo}>
        <img src={brand.logo} alt={brand.name} decoding="async" />
      </div>
      <div className={styles.captionMask}>
        <span className={`${styles.caption} t-label`}>
          {brand.name} — {brand.role}
        </span>
      </div>
    </div>
  )
}
