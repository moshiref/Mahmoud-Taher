import { MaskMedia } from '@/components/motion/MaskMedia'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal } from '@/components/motion/Reveal'
import { ScrubText } from '@/components/motion/ScrubText'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { MediaSlot } from '@/components/media/MediaSlot'
import { brand } from '@/content/brand'
import styles from './Studio.module.css'

const portrait = { kind: 'image', alt: '', label: 'Portrait / behind the scenes' } as const

/** The point of view behind the lens: a manifesto that develops as you read. */
export function Studio() {
  return (
    <section id="studio" data-chapter className={styles.studio} aria-labelledby="studio-title">
      <header className={styles.head}>
        <span className="eyebrow">The studio</span>
        <SplitReveal as="h2" id="studio-title" type="words" className={`${styles.title} t-display`}>
          Light is the first decision
        </SplitReveal>
      </header>

      <ScrubText text={brand.manifesto} className={styles.manifesto} />

      <div className={styles.grid}>
        <Parallax speed={-10} className={styles.portraitWrap}>
          <MaskMedia className={styles.portrait}>
            <MediaSlot media={portrait} fill />
          </MaskMedia>
        </Parallax>

        <Reveal stagger className={styles.facts}>
          <div className={styles.fact}>
            <span className="t-label">Based in</span>
            <p>{brand.location}</p>
          </div>
          <div className={styles.fact}>
            <span className="t-label">Formats</span>
            <p>Photo · Vertical video · Live events</p>
          </div>
          <div className={styles.fact}>
            <span className="t-label">Status</span>
            <p>{brand.availability}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
