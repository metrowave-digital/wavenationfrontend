import Link from 'next/link'
import { ShowCard } from './ShowCard'
import styles from './ShowRail.module.css'
import type { UnifiedShow } from './types'

type ShowRailProps = {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  actionLabel?: string
  shows: UnifiedShow[]
  type?: 'radio' | 'podcast' | 'tv' | 'mixed'
}

export function ShowRail({ eyebrow, title, description, href, actionLabel = 'View all', shows, type = 'mixed' }: ShowRailProps) {
  if (!shows.length) return null

  return (
    <section className={styles.section} data-type={type}>
      <div className={styles.header}>
        <div>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {href ? <Link href={href} className={styles.action}>{actionLabel}</Link> : null}
      </div>

      <div className={styles.rail}>
        {shows.map((show) => (
          <div className={styles.item} key={`${show.type}-${show.id}`}>
            <ShowCard show={show} />
          </div>
        ))}
      </div>
    </section>
  )
}
