/**
 * Central GSAP registry. Import gsap and its plugins from here only, so the
 * plugins are registered exactly once and the global defaults stay consistent.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { duration, ease } from '@/config/motion'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

gsap.defaults({ ease: ease.out, duration: duration.base })

// Mobile browsers resize the viewport when the URL bar shows or hides.
// Ignoring those resizes prevents ScrollTrigger from refreshing mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, useGSAP }
