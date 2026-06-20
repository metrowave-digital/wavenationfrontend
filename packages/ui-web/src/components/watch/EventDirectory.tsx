import styles from './Watch.module.css'
import type { EventItem } from './types'
import { WatchGrid } from './WatchGrid'
import { formatDateTime } from './utils'

export function EventDirectory({ events, title = 'Events', subtitle }: { events: EventItem[]; title?: string; subtitle?: string }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>WaveNation Live</p>
            <h1 className={styles.title}>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </div>
        <WatchGrid
          items={events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.summary,
            href: event.href,
            image: event.posterImage || event.heroImage,
            badge: event.eventStatus,
            meta: formatDateTime(event.startDate, event.timezone),
            isLive: event.eventStatus === 'live',
            locked: event.access.isLocked,
          }))}
          emptyText="No public events are available yet."
        />
      </div>
    </section>
  )
}
