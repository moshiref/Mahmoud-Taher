import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { RouteLink } from '@/components/navigation/RouteLink'
import { Gallery, type GalleryImage } from '@/components/gallery/Gallery'
// Same page shell as the product collections.
import styles from './CollectionPage.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

interface BehancePageProps {
  /** Page heading, e.g. "Reels" or "UGC". */
  title: string
  items: GalleryImage[]
  /** Stable id for this page (heading id, gallery reset). */
  slug: string
}

/**
 * /reels and /ugc — vertical thumbnails in the shared gallery; each opens
 * its Behance project in a new tab. Only the heading and items differ.
 */
export function BehancePage({ title, items, slug }: BehancePageProps) {
  return (
    <main id="main" className={styles.page} aria-labelledby={`${slug}-title`}>
      <header className={styles.intro}>
        <Reveal mode="wipe">
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <RouteLink to="/#work">Work</RouteLink>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
        </Reveal>
        <SplitReveal key={slug} as="h1" id={`${slug}-title`} type="chars" className={styles.title}>
          {title}
        </SplitReveal>
        <Reveal mode="wipe" delay={0.2}>
          <p className={styles.meta}>{pad(items.length)} projects</p>
        </Reveal>
      </header>

      <Gallery items={items} label={title} resetKey={slug} captions={false} perRow={3} alternate={false} />

      <Reveal as="nav" mode="wipe" start="top 98%" className={styles.pager}>
        <RouteLink to="/#work" className={styles.textLink}>
          Back to work
        </RouteLink>
        <RouteLink to="/products" className={`${styles.textLink} ${styles.nextLink}`}>
          <span className={styles.nextLabel}>Next</span>
          <span className={styles.nextTitle}>
            Products
          </span>
        </RouteLink>
      </Reveal>
    </main>
  )
}
