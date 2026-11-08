/**
 * Which parts of the page need the WebGL scene to animate every frame.
 *
 * The hero (portrait, 3D marquee) and About's 3D "08" register their elements
 * here; an IntersectionObserver tracks whether any of them is near the
 * viewport. When none is — further down the home page, or on the products,
 * reels and UGC pages — the scene stops its 60 fps loop and only redraws when
 * something changes (scroll, resize, pointer). No layout reads per frame.
 */
type Listener = () => void

const visible = new Set<Element>()
const listeners = new Set<Listener>()
let observer: IntersectionObserver | null = null

const notify = () => listeners.forEach((listener) => listener())

const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      notify()
    },
    // Start animating a little before the element arrives, stop a little after it leaves.
    { rootMargin: '25% 0px' },
  ))

/** Marks `el` as needing continuous 3D animation while it is on screen. Returns the cleanup. */
export function watchLiveRegion(el: Element) {
  getObserver().observe(el)
  return () => {
    getObserver().unobserve(el)
    visible.delete(el)
    notify()
  }
}

/** True while at least one registered region is on (or near) the screen. */
export const sceneIsLive = () => visible.size > 0

export function onSceneActivity(listener: Listener) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
