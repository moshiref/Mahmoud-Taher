import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/animation/gsap'
import { lenisOptions } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { scrollState } from '@/lib/scrollStore'

interface MotionContextValue {
  lenis: Lenis | null
  reducedMotion: boolean
  scrollTo: (target: string | number | HTMLElement, options?: { immediate?: boolean }) => void
}

const MotionContext = createContext<MotionContextValue | null>(null)

/**
 * Owns the scroll engine. Lenis is driven by GSAP's ticker so smooth scroll,
 * ScrollTrigger and every tween share one clock. With reduced motion we fall
 * back to native scrolling but keep the shared scroll store up to date.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reducedMotion) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        scrollState.y = window.scrollY
        scrollState.progress = max > 0 ? window.scrollY / max : 0
        scrollState.velocity = 0
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const instance = new Lenis({ ...lenisOptions, autoRaf: false, anchors: false })
    instance.on('scroll', (l: Lenis) => {
      scrollState.y = l.scroll
      scrollState.progress = l.progress
      scrollState.velocity = l.velocity
      scrollState.direction = l.direction === -1 ? -1 : 1
      ScrollTrigger.update()
    })

    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)

    return () => {
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      instance.destroy()
      setLenis(null)
    }
  }, [reducedMotion])

  // Pointer position is consumed by the 3D rig and several hover effects.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const scrollTo = useCallback<MotionContextValue['scrollTo']>(
    (target, options) => {
      if (lenis) {
        lenis.scrollTo(target, { immediate: options?.immediate, duration: 1.6, easing: easeInOutExpo, force: true })
        return
      }
      const behavior: ScrollBehavior = reducedMotion || options?.immediate ? 'auto' : 'smooth'
      if (typeof target === 'number') window.scrollTo({ top: target, behavior })
      else {
        const el = typeof target === 'string' ? document.querySelector(target) : target
        el?.scrollIntoView({ behavior })
      }
    },
    [lenis, reducedMotion],
  )

  return <MotionContext.Provider value={{ lenis, reducedMotion, scrollTo }}>{children}</MotionContext.Provider>
}

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2

export function useMotion() {
  const ctx = useContext(MotionContext)
  if (!ctx) throw new Error('useMotion must be used inside <MotionProvider>')
  return ctx
}
