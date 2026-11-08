import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { RouteLink } from '@/components/navigation/RouteLink'
import { HighlightLink } from '@/components/ui/HighlightLink'
import { collections } from '@/content/products'
import { reels } from '@/content/reels'
import { ugc } from '@/content/ugc'
import styles from './Work.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Work — the entry point to the portfolio's categories: Products (leading
 * to /products and its collections), Reels (/reels) and UGC (/ugc).
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
    </section>
  )
}
