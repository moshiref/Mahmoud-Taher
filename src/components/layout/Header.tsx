import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/animation/gsap'
import { wipeIn } from '@/animation/presets'
import { Magnetic } from '@/components/motion/Magnetic'
import { Button } from '@/components/ui/Button'
import { duration, ease, stagger } from '@/config/motion'
import { chapters, navItems } from '@/config/sections'
import { brand } from '@/content/brand'
import { useIntro } from '@/app/providers/IntroProvider'
import { useMotion } from '@/app/providers/MotionProvider'
import { useActiveChapter } from '@/hooks/useActiveChapter'
import { isFinePointer } from '@/lib/device'
import { matchRoute, navigate, useLocationPath } from '@/lib/router'
import styles from './Header.module.css'

const mailto = `mailto:${brand.email}`

/**
 * Cinematic navigation: transparent over the hero, settling into a blurred
 * black bar once you scroll. The logo arrives from the intro sequence, nav
 * links carry a drawn underline that tracks the active section, and the
 * accent CTA is magnetic. Below 900px it becomes a full-screen menu.
 */
export function Header() {
  const { scrollTo, reducedMotion, lenis } = useMotion()
  const { introDone } = useIntro()
  const route = matchRoute(useLocationPath())
  const chapter = chapters[useActiveChapter()]
  // On the products pages the Work item stays lit.
  const activeTarget = route.name === 'home' ? chapter : 'work'
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const logoTilt = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  openRef.current = open

  // Entrance, scrolled background, and hide-on-scroll-down.
  useGSAP(
    () => {
      const el = header.current
      if (!el || !introDone) return
      if (!reducedMotion) {
        wipeIn('[data-nav-reveal]', { y: -10, duration: duration.base, stagger: 0.06, delay: 0.55 })
      }
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll()
          el.dataset.scrolled = String(y > 24)
          el.dataset.hidden = String(!openRef.current && self.direction === 1 && y > window.innerHeight * 0.6)
        },
      })
    },
    { dependencies: [introDone, reducedMotion], scope: header },
  )

  // Logo interaction: a restrained 3D tilt toward the pointer.
  useGSAP(
    (_, contextSafe) => {
      const el = logoTilt.current
      if (!el || reducedMotion || !isFinePointer() || !contextSafe) return
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
      const host = el.parentElement!
      const onMove = contextSafe((e: PointerEvent) => {
        const r = host.getBoundingClientRect()
        ry(((e.clientX - r.left) / r.width - 0.5) * 36)
        rx(-((e.clientY - r.top) / r.height - 0.5) * 36)
      })
      const onLeave = contextSafe(() => {
        rx(0)
        ry(0)
      })
      host.addEventListener('pointermove', onMove)
      host.addEventListener('pointerleave', onLeave)
      return () => {
        host.removeEventListener('pointermove', onMove)
        host.removeEventListener('pointerleave', onLeave)
      }
    },
    { dependencies: [reducedMotion], scope: header },
  )

  // Full-screen menu choreography.
  useGSAP(
    () => {
      const el = menu.current
      if (!el) return
      if (open) {
        gsap.set(el, { visibility: 'visible' })
        gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: duration.base, ease: ease.inOut })
        gsap.fromTo(
          el.querySelectorAll('[data-menu-item]'),
          { yPercent: 110 },
          { yPercent: 0, duration: duration.slow, ease: ease.out, stagger: stagger.items, delay: 0.2 },
        )
      } else {
        gsap.to(el, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: duration.fast,
          ease: ease.inOut,
          onComplete: () => void gsap.set(el, { visibility: 'hidden' }),
        })
      }
    },
    { dependencies: [open], scope: menu },
  )

  useEffect(() => {
    if (!lenis || !introDone) return
    if (open) lenis.stop()
    else lenis.start()
  }, [open, lenis, introDone])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 900 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  /**
   * Scrolls to a section if it exists (Contact arrives in a later stage).
   * From the products pages it routes home first, landing on the section.
   */
  const go = (target: string) => {
    // Resume Lenis before scrolling: start() resets any in-flight scroll animation.
    if (openRef.current) lenis?.start()
    setOpen(false)
    if (route.name !== 'home') {
      navigate(target === 'hero' ? '/' : `/#${target}`)
      return
    }
    const section = document.getElementById(target)
    if (section) scrollTo(target === 'hero' ? 0 : section)
  }

  return (
    <>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      <header ref={header} className={styles.header} data-scrolled="false" data-hidden="false" data-open={open}>
        <a
          className={styles.logo}
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            go('hero')
          }}
          aria-label={`${brand.name} — home`}
        >
          <span ref={logoTilt} className={styles.logoTilt}>
            <img className={styles.logoImg} src={brand.logo} alt={brand.name} decoding="async" data-header-logo />
          </span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          <ul>
            {navItems.map((item) => (
              <li key={item.target} data-nav-reveal>
                <a
                  href={route.name === 'home' ? `#${item.target}` : `/#${item.target}`}
                  className={styles.link}
                  data-active={item.target === activeTarget}
                  aria-current={item.target === activeTarget ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item.target)
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Magnetic strength={0.3} className={styles.cta}>
            <span data-nav-reveal style={{ display: 'inline-block' }}>
              <Button href={mailto} size="sm">
                Let’s talk
              </Button>
            </span>
          </Magnetic>

          <button
            className={styles.menuButton}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-nav-reveal
          >
            <span className={styles.burger} data-open={open} />
          </button>
        </div>
      </header>

      <div ref={menu} id="site-menu" className={styles.menu} aria-hidden={!open}>
        <ul className={styles.menuList}>
          {navItems.map((item, i) => (
            <li key={item.target} className={styles.menuItem}>
              <a
                data-menu-item
                href={route.name === 'home' ? `#${item.target}` : `/#${item.target}`}
                className={styles.menuLink}
                data-active={item.target === activeTarget}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault()
                  go(item.target)
                }}
              >
                <span className="t-index">0{i + 1}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.menuFoot}>
          <span data-menu-item style={{ display: 'block' }}>
            <Button href={mailto} tabIndex={open ? 0 : -1}>
              Let’s talk
            </Button>
          </span>
          <a className={`${styles.menuMail} t-label`} href={mailto} tabIndex={open ? 0 : -1}>
            {brand.email}
          </a>
        </div>
      </div>
    </>
  )
}
