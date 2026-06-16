import Link from 'next/link'
import styles from './News.module.css'

type NewsCollectionShellProps = {
  eyebrow?: string
  title: string
  description?: string | null
  accent?: string | null
  actions?: React.ReactNode
  children: React.ReactNode
}

export function NewsCollectionShell({
  eyebrow = 'WaveNation News',
  title,
  description,
  accent,
  actions,
  children,
}: NewsCollectionShellProps) {
  return (
    <section className={styles.collection} style={{ '--accent': accent || '#00b3ff' } as React.CSSProperties}>
      <div className={styles.collectionHeader}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>

        {actions ? <div className={styles.collectionActions}>{actions}</div> : null}
      </div>

      {children}
    </section>
  )
}

export function NewsEmptyState({
  title = 'No stories found yet.',
  description = 'Fresh WaveNation coverage will appear here as soon as it is published.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.eyebrow}>Nothing here yet</p>
      <h2>{title}</h2>
      <p>{description}</p>

      <div className={styles.emptyActions}>
        <Link href="/news">Back to News</Link>
        <Link href="/listen">Listen Live</Link>
        <Link href="/watch">Watch</Link>
      </div>
    </div>
  )
}