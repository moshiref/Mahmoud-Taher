import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { RouteLink } from '@/components/navigation/RouteLink'
import { HighlightLink } from '@/components/ui/HighlightLink'
import { collections } from '@/content/products'
import styles from './ProductsPage.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * /products — the landing for all product collections: a centred title, then
 * the collections as an editorial index. Visually static on hover (no image
 * previews, no fill) — the rows are plain links.
 */
export function ProductsPage() {

  return (
    <main id="main" className={styles.page} aria-labelledby="products-title">
      <header className={styles.intro}>
        <Reveal mode="wipe">
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <RouteLink to="/#work">Work</RouteLink>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Products</span>
          </nav>
        </Reveal>
        <SplitReveal as="h1" id="products-title" type="chars" className={styles.title}>
          Products
        </SplitReveal>
        <Reveal mode="wipe" delay={0.2}>
          <p className={styles.meta}>{pad(collections.length)} collections</p>
        </Reveal>
      </header>

      <Reveal as="ol" stagger mode="wipe" className={styles.list}>
        {collections.map((c, i) => {
          const count = c.items.length
          return (
            <li key={c.slug}>
              <HighlightLink
                to={`/products/${c.slug}`}
                className={styles.row}
                contentClassName={styles.rowContent}
                fill={false}
              >
                <span className={styles.index}>{pad(i + 1)}</span>
                <span className={styles.name}>{c.title}</span>
                <span className={styles.status}>{count ? `${pad(count)} projects` : 'In preparation'}</span>
              </HighlightLink>
            </li>
          )
        })}
      </Reveal>

    </main>
  )
}
