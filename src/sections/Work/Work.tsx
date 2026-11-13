import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { RouteLink } from '@/components/navigation/RouteLink'
import { HighlightLink } from '@/components/ui/HighlightLink'
import buttonStyles from '@/components/ui/Button.module.css'
import { collections } from '@/content/products'
import { reels } from '@/content/reels'
import { ugc } from '@/content/ugc'
import { events } from '@/content/events'
import styles from './Work.module.css'

const BEHANCE_URL = 'https://www.behance.net/mahmoudtaher500'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Work — the entry point to the portfolio's categories: Products (leading
 * to /products and its collections), Reels (/reels), UGC (/ugc) and
 * Event's (/events).
 */
export function Work() {
  return (
    <section id="work" data-chapter className={styles.work} aria-labelledby="work-title">
      <header className={styles.head}>
        <Reveal mode="wipe">
          <span className="eyebrow">Selected work</span>
        </Reveal>
        <SplitReveal as="h2" id="work-title" type="chars" className={styles.title}>
          Work
        </SplitReveal>
      </header>

      <Reveal mode="wipe" start="top 95%">
        <HighlightLink
          to="/products"
          className={styles.category}
          contentClassName={styles.categoryRow}
          label="Products — view all collections"
        >
          <span className={styles.categoryIndex}>01</span>
          <span className={styles.categoryName}>Products</span>
          <span className={styles.categoryMeta}>{pad(collections.length)} collections</span>
        </HighlightLink>
      </Reveal>

      <Reveal as="ul" stagger mode="wipe" start="top 98%" className={styles.collections}>
        {collections.map((c) => (
          <li key={c.slug}>
            <RouteLink to={`/products/${c.slug}`} className={styles.collection}>
              <span>{c.title}</span>
              <span className={styles.collectionCount}>{c.items.length ? pad(c.items.length) : 'Soon'}</span>
            </RouteLink>
          </li>
        ))}
      </Reveal>

      <Reveal mode="wipe" start="top 95%">
        <HighlightLink to="/reels" className={styles.category} contentClassName={styles.categoryRow} label="Reels — view all reels">
          <span className={styles.categoryIndex}>02</span>
          <span className={styles.categoryName}>Reels</span>
          <span className={styles.categoryMeta}>{pad(reels.length)} reels</span>
        </HighlightLink>
      </Reveal>

      <Reveal mode="wipe" start="top 95%">
        <HighlightLink to="/ugc" className={styles.category} contentClassName={styles.categoryRow} label="UGC — view all UGC projects">
          <span className={styles.categoryIndex}>03</span>
          <span className={styles.categoryName}>UGC</span>
          <span className={styles.categoryMeta}>{pad(ugc.length)} projects</span>
        </HighlightLink>
      </Reveal>

      <Reveal mode="wipe" start="top 95%">
        <HighlightLink to="/events" className={styles.category} contentClassName={styles.categoryRow} label="Event's — view all event projects">
          <span className={styles.categoryIndex}>04</span>
          <span className={styles.categoryName}>Event's</span>
          <span className={styles.categoryMeta}>{pad(events.length)} projects</span>
        </HighlightLink>
      </Reveal>

      {/* Closing call-out: after every category, the way out to the full archive. */}
      <Reveal start="top 95%" className={styles.more}>
        <p className={styles.moreText}>To see more of my work</p>
        <a
          href={BEHANCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonStyles.button} ${styles.moreButton}`}
          data-variant="primary"
          data-size="md"
          aria-label="Watch more of my work on Behance (opens in a new tab)"
        >
          <span>Watch</span>
          <svg className={styles.moreArrow} viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
      </Reveal>
    </section>
  )
}
