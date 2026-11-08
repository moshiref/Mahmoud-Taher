import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { RouteLink } from '@/components/navigation/RouteLink'
import { Gallery } from '@/components/gallery/Gallery'
import { collections, findCollection } from '@/content/products'
import styles from './CollectionPage.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/** /products/:slug — one collection: title, editorial gallery, fullscreen viewer. */
export function CollectionPage({ slug }: { slug: string }) {
  const collection = findCollection(slug)

  if (!collection) {
    return (
      <main id="main" className={styles.page}>
        <header className={styles.intro}>
          <h1 className={styles.title}>Not found</h1>
          <p className={styles.meta}>This collection doesn&rsquo;t exist.</p>
          <RouteLink to="/products" className={styles.textLink}>
            View all products
          </RouteLink>
        </header>
      </main>
    )
  }

  const position = collections.indexOf(collection)
  const next = collections[(position + 1) % collections.length]
  const count = collection.items.length

  return (
    <main id="main" className={styles.page} aria-labelledby="collection-title">
      <header className={styles.intro}>
        <Reveal mode="wipe">
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <RouteLink to="/#work">Work</RouteLink>
            <span aria-hidden="true">/</span>
            <RouteLink to="/products">Products</RouteLink>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{collection.title}</span>
          </nav>
        </Reveal>
        <SplitReveal key={collection.slug} as="h1" id="collection-title" type="chars" className={styles.title}>
          {collection.title}
        </SplitReveal>
        <Reveal mode="wipe" delay={0.2}>
          <p className={styles.meta}>{count ? `${pad(count)} projects` : 'In preparation'}</p>
        </Reveal>
      </header>

      {count ? (
        <Gallery
          items={collection.items}
          label={collection.title}
          resetKey={collection.slug}
          captions={collection.captions ?? true}
          still
        />
      ) : (
        <EmptyState />
      )}

      <Reveal as="nav" mode="wipe" start="top 98%" className={styles.pager}>
        <RouteLink to="/products" className={styles.textLink}>
          All products
        </RouteLink>
        <RouteLink to={`/products/${next.slug}`} className={`${styles.textLink} ${styles.nextLink}`}>
          <span className={styles.nextLabel}>Next collection</span>
          <span className={styles.nextTitle}>
            {next.title}
          </span>
        </RouteLink>
      </Reveal>
    </main>
  )
}

function EmptyState() {
  return (
    <Reveal mode="wipe" className={styles.empty}>
      <p>This collection is in preparation.</p>
      <RouteLink to="/products/menu" className={styles.textLink}>
        See For Menu meanwhile
      </RouteLink>
    </Reveal>
  )
}
