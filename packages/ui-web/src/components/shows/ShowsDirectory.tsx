import Link from 'next/link'
import { ShowCard } from './ShowCard'
import styles from './ShowsDirectory.module.css'
import type { ShowsDirectoryProps } from './types'

export function ShowsDirectory({
  eyebrow,
  title,
  description,
  shows,
  filters = [],
  emptyTitle = 'No shows found',
  emptyMessage = 'Check back soon for new programming.',
  ctaLabel = 'View full schedule',
  ctaHref = '/schedule',
}: ShowsDirectoryProps) {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        <Link href={ctaHref} className={styles.heroAction}>{ctaLabel}</Link>
      </section>

      {filters.length ? (
        <nav className={styles.filters} aria-label="Filter shows">
          {filters.map((filter) => (
            <Link key={filter.href + filter.label} href={filter.href} aria-current={filter.isActive ? 'page' : undefined}>
              {filter.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {shows.length ? (
        <section className={styles.grid} aria-label={title}>
          {shows.map((show) => <ShowCard key={`${show.type}-${show.id}`} show={show} />)}
        </section>
      ) : (
        <section className={styles.empty}>
          <h2>{emptyTitle}</h2>
          <p>{emptyMessage}</p>
        </section>
      )}
    </div>
  )
}
