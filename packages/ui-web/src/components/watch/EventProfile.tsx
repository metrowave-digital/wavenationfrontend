import styles from './Watch.module.css'
import type { EventItem } from './types'
import { formatDateTime } from './utils'
import { WatchButtons } from './WatchButtons'
import { AccessGate } from './AccessGate'
import { RestreamEventEmbed } from './RestreamEventEmbed'
import { RestreamChatPanel } from './RestreamChatPanel'
import { HlsVideoPlayer } from './HlsVideoPlayer'

function EventStream({ event }: { event: EventItem }) {
  if (!event.livestreamUrl && !event.replayUrl) return null
  if (event.access.isLocked) return <AccessGate access={event.access} />

  if (event.livestreamProvider === 'restream') {
    return (
      <div className={styles.twoColumn}>
        <RestreamEventEmbed embedUrl={event.livestreamUrl} title={event.title} posterUrl={event.heroImage?.url} />
        <RestreamChatPanel title="Event Chat" />
      </div>
    )
  }

  return <HlsVideoPlayer hlsUrl={event.livestreamUrl || event.replayUrl} posterUrl={event.heroImage?.url} title={event.title} />
}

export function EventProfile({ event, includeStream = true }: { event: EventItem; includeStream?: boolean }) {
  const time = formatDateTime(event.startDate, event.timezone)
  const endTime = formatDateTime(event.endDate, event.timezone)
  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.profileHero}>
            <div className={styles.profilePoster}>
              {event.heroImage?.url ? <img src={event.heroImage.url} alt={event.heroImage.alt || event.title} /> : <div className={styles.cardFallback} />}
            </div>
            <div>
              <p className={styles.eyebrow}>{event.eventType || 'WaveNation Event'}</p>
              <h1 className={styles.title}>{event.title}</h1>
              <div className={styles.metaPills}>
                {event.eventStatus ? <span className={styles.pill}>{event.eventStatus}</span> : null}
                {time ? <span className={styles.pill}>{time}</span> : null}
                {endTime ? <span className={styles.pill}>Ends {endTime}</span> : null}
                {event.priceDisplay ? <span className={styles.pill}>{event.priceDisplay}</span> : null}
              </div>
              {event.subtitle ? <p className={styles.subtitle}>{event.subtitle}</p> : null}
              {event.summary ? <p className={styles.cardText}>{event.summary}</p> : null}
              <WatchButtons actions={[{ label: event.primaryCTA || 'Get Tickets', href: event.ticketLinks?.[0]?.href || event.watchHref, variant: 'primary' }, { label: 'Watch Event', href: event.watchHref, variant: 'secondary' }]} />
            </div>
          </div>
        </div>
      </section>
      {includeStream ? <section className={styles.section}><div className={styles.container}><EventStream event={event} /></div></section> : null}
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.twoColumn}`}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Event Details</h2>
            {event.location ? <p><strong>Location:</strong> {event.location}</p> : null}
            {event.entryDetails ? <p>{event.entryDetails}</p> : null}
            {event.accessibilityInfo ? <p><strong>Accessibility:</strong> {event.accessibilityInfo}</p> : null}
            {event.parkingInfo ? <p><strong>Parking:</strong> {event.parkingInfo}</p> : null}
          </div>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Schedule</h2>
            {event.schedule?.length ? (
              <div className={styles.scheduleList}>
                {event.schedule.map((item) => <div key={`${item.title}-${item.startTime}`} className={styles.scheduleItem}><strong>{item.title}</strong><br /><span>{formatDateTime(item.startTime, event.timezone)}</span>{item.description ? <p>{item.description}</p> : null}</div>)}
              </div>
            ) : <p className={styles.cardText}>Schedule details are coming soon.</p>}
          </div>
        </div>
      </section>
    </>
  )
}
