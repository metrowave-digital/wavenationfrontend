import styles from './Watch.module.css'
import type { EventItem, LiveChannel } from './types'
import { LiveChannelSwitcher } from './LiveChannelSwitcher'
import { WatchRail } from './WatchRail'
import { formatDateTime } from './utils'

export function WatchLiveLayout({ channels, events }: { channels: LiveChannel[]; events: EventItem[] }) {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Watch Live</p>
          <h1 className={styles.title}>WaveNation One</h1>
          <p className={styles.subtitle}>Three live channels, live virtual events.</p>
          <LiveChannelSwitcher channels={channels} />
        </div>
      </section>
      <WatchRail
        eyebrow="Live Events"
        title="Upcoming Streams"
        subtitle="Virtual, hybrid, and livestream events."
        items={events.map((event) => ({ id: event.id, title: event.title, description: event.summary, href: event.watchHref, image: event.posterImage || event.heroImage, badge: event.eventType, meta: formatDateTime(event.startDate, event.timezone), locked: event.access.isLocked }))}
        actions={[{ label: 'All Events', href: '/events', variant: 'secondary' }]}
        emptyText="No upcoming livestream events are published yet."
      />
    </>
  )
}
