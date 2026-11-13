import { useRef } from 'react'
import { useChapterTracker } from '@/hooks/useChapterTracker'
import { Hero } from '@/sections/Hero/Hero'
import { About } from '@/sections/About/About'
import { Work } from '@/sections/Work/Work'
import { Contact } from '@/sections/Contact/Contact'

/**
 * Home: hero, About, Work (links to /products, /reels, /ugc, /events) and Contact.
 * Section order must match `chapters` in config/sections.ts.
 */
export function HomePage() {
  const main = useRef<HTMLElement>(null)
  useChapterTracker(main)

  return (
    <main ref={main} id="main">
      <Hero />
      <About />
      <Work />
      <Contact />
    </main>
  )
}
