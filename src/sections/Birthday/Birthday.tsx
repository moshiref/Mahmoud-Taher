import { Gallery } from '@/components/gallery/Gallery'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { birthday } from '@/content/birthday'
import styles from './Birthday.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Birthday Photography — four images in the portfolio's shared Gallery:
 * shutter reveals on scroll, a gentle lean on hover, and the fullscreen
 * viewer (arrows / Esc / swipe) on click.
 */
export function Birthday() {
  return (
    <section id="birthday" className={styles.birthday} aria-labelledby="birthday-title">
      <header className={styles.head}>
        <Reveal mode="wipe">
          <span className="eyebrow">{birthday.eyebrow}</span>
        </Reveal>
        <div className={styles.titleRow}>
          <SplitReveal as="h2" id="birthday-title" type="chars" className={styles.title}>
            {birthday.title}
          </SplitReveal>
          <Reveal mode="wipe" delay={0.2}>
            <span className={styles.count}>{pad(birthday.images.length)} images</span>
          </Reveal>
        </div>
      </header>

      <Gallery items={[...birthday.images]} label={birthday.title} resetKey="birthday" perRow={2} />
    </section>
  )
}
