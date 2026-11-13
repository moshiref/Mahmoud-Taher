import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/animation/gsap'
import { useMotion } from '@/app/providers/MotionProvider'
import { matchRoute, routeKey, useLocationPath, type Route } from '@/lib/router'
import { HomePage } from '@/pages/HomePage'
import { ProductsPage } from '@/pages/ProductsPage'
import { CollectionPage } from '@/pages/CollectionPage'
import { BehancePage } from '@/pages/BehancePage'
import { reels } from '@/content/reels'
import { ugc } from '@/content/ugc'
import { events } from '@/content/events'
import styles from './PageRouter.module.css'

/**
 * Renders the page for the current URL and choreographs route changes:
 * a black curtain with a accent hairline wipes up over the screen, the page
 * swaps (and scroll resets) behind it, then the curtain lifts away.
 * Same-page hash links (e.g. "/#about") just scroll.
 */
export function PageRouter() {
  const location = useLocationPath()
  const target = matchRoute(location)
  const [shown, setShown] = useState<Route>(target)
  const curtain = useRef<HTMLDivElement>(null)
  const { lenis, reducedMotion, scrollTo } = useMotion()
  const busy = useRef(false)
  // Bumped when a transition ends, so a navigation made mid-transition still lands.
  const [settled, setSettled] = useState(0)

  /**
   * Swap pages at the top of the document. The new page's scroll animations
   * are created as it mounts, so the old page's scroll position must be gone
   * by then — otherwise they start "already passed" (reveals fire off-screen,
   * and self-killing `once` triggers can break ScrollTrigger's setup).
   */
  const swap = (next: Route) => {
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    setShown(next)
  }

  // Route change: curtain in → swap → curtain out.
  useEffect(() => {
    if (routeKey(target) === routeKey(shown) || busy.current) return
    const el = curtain.current
    if (reducedMotion || !el) {
      swap(target)
      return
    }
    busy.current = true
    gsap
      .timeline({
        onComplete: () => {
          busy.current = false
          setSettled((n) => n + 1)
        },
      })
      .set(el, { visibility: 'visible' })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut' })
      .fromTo(`.${styles.line}`, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, 0.25)
      .call(() => swap(target))
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut' }, '+=0.12')
      .set(el, { visibility: 'hidden' })
    // `shown` is deliberately not a dependency: it is the value this effect replaces.
  }, [location, reducedMotion, settled])

  // After a page swap (or a hash change on the same page): reset scroll, honour the hash.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh()
      // Lenis still holds the previous page's scroll limit until its own resize fires.
      lenis?.resize()
      const section = hash ? document.getElementById(hash) : null
      if (section) scrollTo(section)
    }, 60)
    return () => window.clearTimeout(id)
  }, [routeKey(shown)])

  // Hash-only changes while staying on the home page.
  useEffect(() => {
    if (routeKey(target) !== routeKey(shown)) return
    const hash = window.location.hash.slice(1)
    const section = hash ? document.getElementById(hash) : null
    if (section) scrollTo(section)
  }, [location])

  return (
    <>
      {shown.name === 'home' && <HomePage />}
      {shown.name === 'products' && <ProductsPage />}
      {shown.name === 'collection' && <CollectionPage slug={shown.slug} />}
      {shown.name === 'reels' && <BehancePage key="reels" title="Reels" slug="reels" items={reels} />}
      {shown.name === 'ugc' && <BehancePage key="ugc" title="UGC" slug="ugc" items={ugc} />}
      {shown.name === 'events' && <BehancePage key="events" title="Event's" slug="events" items={events} />}
      <div ref={curtain} className={styles.curtain} aria-hidden="true">
        <span className={styles.line} />
      </div>
    </>
  )
}
