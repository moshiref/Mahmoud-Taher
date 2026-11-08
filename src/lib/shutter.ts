/**
 * Shutter release bus: the 3D lens fires it on click, and DOM listeners
 * (the flash overlay, the viewfinder) react without coupling to the scene.
 */
type Listener = () => void

const listeners = new Set<Listener>()

export function releaseShutter() {
  listeners.forEach((listener) => listener())
}

export function subscribeShutter(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
