/**
 * A tiny History-API router: no dependency, five routes.
 *
 *   /                    home
 *   /products            products landing
 *   /products/:slug      one collection
 *   /reels               reels (thumbnails linking to Behance)
 *   /ugc                 UGC (same page as reels)
 *
 * `navigate()` pushes a URL; `useLocationPath()` re-renders on change; the
 * non-React `currentPath()` lets the WebGL scene read the route per frame.
 * (Hosting must rewrite unknown paths to index.html — Vite dev/preview do.)
 */
import { useSyncExternalStore } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'products' }
  | { name: 'collection'; slug: string }
  | { name: 'reels' }
  | { name: 'ugc' }

type Listener = () => void
const listeners = new Set<Listener>()
const emit = () => listeners.forEach((listener) => listener())

if (typeof window !== 'undefined') window.addEventListener('popstate', emit)

const normalise = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

export const currentPath = () => normalise(window.location.pathname)

/** Full location (path + hash) — the router's subscription key. */
const snapshot = () => window.location.pathname + window.location.hash

export function navigate(to: string) {
  if (to === snapshot()) return
  window.history.pushState(null, '', to)
  emit()
}

export function useLocationPath() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    snapshot,
    () => '/',
  )
}

export function matchRoute(path: string): Route {
  const clean = normalise(path.split('#')[0])
  if (clean === '/products') return { name: 'products' }
  if (clean === '/reels') return { name: 'reels' }
  if (clean === '/ugc') return { name: 'ugc' }
  const collection = /^\/products\/([\w-]+)$/.exec(clean)
  if (collection) return { name: 'collection', slug: collection[1] }
  return { name: 'home' }
}

export const routeKey = (route: Route) => (route.name === 'collection' ? `collection:${route.slug}` : route.name)
