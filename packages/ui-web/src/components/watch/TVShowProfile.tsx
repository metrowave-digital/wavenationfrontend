import styles from './Watch.module.css'
import type { TVShow, VODItem } from './types'
import { WatchGrid } from './WatchGrid'
import { WatchButtons } from './WatchButtons'

export function TVShowProfile({ show, episodes = [] }: { show: TVShow; episodes?: VODItem[] }) {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.profileHero}>
            <div className={styles.profilePoster}>
              {show.heroBanner?.url || show.posterArt?.url ? <img src={show.heroBanner?.url || show.posterArt?.url} alt={show.heroBanner?.alt || show.posterArt?.alt || show.title} /> : <div className={styles.cardFallback} />}
            </div>
            <div>
              <p className={styles.eyebrow}>{show.network || 'WaveNation One'}</p>
              <h1 className={styles.title}>{show.title}</h1>
              <div className={styles.metaPills}>{[show.format, show.ageRating, show.showStatus].filter(Boolean).map((part) => <span key={String(part)} className={styles.pill}>{part}</span>)}</div>
              {show.description ? <p className={styles.subtitle}>{show.description}</p> : null}
              <WatchButtons actions={[{ label: 'View Episodes', href: `/watch/shows/${show.slug}/episodes`, variant: 'primary' }, { label: 'Watch Live', href: '/watch-live', variant: 'secondary' }]} />
            </div>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Episodes</p>
              <h2 className={styles.title}>Watch Now</h2>
            </div>
          </div>
          <WatchGrid items={episodes.map((episode) => ({ id: episode.id, title: episode.title, description: episode.description, href: episode.href, image: episode.poster, badge: episode.vodType, locked: episode.access.isLocked }))} emptyText="Episodes for this show are coming soon." />
        </div>
      </section>
    </>
  )
}
