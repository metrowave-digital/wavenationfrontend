import styles from './Watch.module.css'
import type { WatchCardItem, WatchLink } from './types'
import { WatchCard } from './WatchCard'
import { WatchButtons } from './WatchButtons'

export function WatchRail({
  eyebrow,
  title,
  subtitle,
  items,
  actions,
  emptyText = 'Nothing to show yet.',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  items: WatchCardItem[]
  actions?: WatchLink[]
  emptyText?: string
}) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h2 className={styles.title}>{title}</h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <WatchButtons actions={actions} />
        </div>
        {items.length ? <div className={styles.rail}>{items.map((item) => <WatchCard key={`${item.href || item.id}-${item.title}`} item={item} />)}</div> : <div className={styles.empty}>{emptyText}</div>}
      </div>
    </section>
  )
}
