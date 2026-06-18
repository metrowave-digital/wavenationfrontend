import Link from 'next/link'
import type { ProgrammingOccurrence } from './types'
import styles from './ScheduleCard.module.css'

type ScheduleCardProps = {
  item: ProgrammingOccurrence
  compact?: boolean
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function ScheduleCard({ item, compact = false }: ScheduleCardProps) {
  const meta = [
    item.medium === 'radio' ? 'Radio' : 'TV',
    item.format,
    item.programmingType,
  ].filter(Boolean)

  return (
    <article className={cx(styles.card, compact && styles.compact, item.isLive && styles.live)}>
      <div className={styles.artwork}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" />
        ) : (
          <span>{item.medium === 'radio' ? 'FM' : 'TV'}</span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topline}>
          <span className={cx(styles.badge, item.medium === 'tv' && styles.tvBadge)}>
            {item.isLive ? 'Live Now' : item.medium === 'radio' ? 'Radio' : 'TV'}
          </span>
          <span className={styles.time}>{item.displayTimeRange}</span>
        </div>

        <h3>{item.title}</h3>

        {!compact && item.description ? <p>{item.description}</p> : null}

        <div className={styles.meta}>
          {meta.map((label) => (
            <span key={label}>{label}</span>
          ))}
          {item.hosts?.slice(0, 2).map((host) => (
            <span key={host}>{host}</span>
          ))}
        </div>
      </div>

      <Link className={styles.cta} href={item.ctaHref}>
        {item.ctaLabel}
      </Link>
    </article>
  )
}
