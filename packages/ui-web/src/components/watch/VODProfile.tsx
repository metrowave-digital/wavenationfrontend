import styles from './Watch.module.css'
import type { VODItem } from './types'
import { formatRuntime } from './utils'
import { AccessGate } from './AccessGate'
import { VastVideoPlayer } from './VastVideoPlayer'

export function VODProfile({ item }: { item: VODItem }) {
  const meta = [item.vodType, item.show?.title, item.season ? `Season ${item.season}` : null, item.episodeNumber ? `Episode ${item.episodeNumber}` : null, formatRuntime(item.runtimeSeconds)].filter(Boolean)

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.profileHero}>
          <div className={styles.profilePoster}>
            {item.poster?.url ? <img src={item.poster.url} alt={item.poster.alt || item.title} /> : <div className={styles.cardFallback} />}
          </div>
          <div>
            <p className={styles.eyebrow}>WaveNation VOD</p>
            <h1 className={styles.title}>{item.title}</h1>
            {meta.length ? <div className={styles.metaPills}>{meta.map((part) => <span key={String(part)} className={styles.pill}>{part}</span>)}</div> : null}
            {item.description ? <p className={styles.subtitle}>{item.description}</p> : null}
            {item.sponsor ? <div className={styles.sponsorStrip}>Presented by <strong>{item.sponsor.name}</strong></div> : null}
          </div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          {item.access.isLocked ? (
            <AccessGate access={item.access} />
          ) : (
            <VastVideoPlayer
              hlsUrl={item.hlsUrl}
              mp4Url={item.fallbackMp4Url}
              posterUrl={item.poster?.url}
              title={item.title}
              ads={item.ads}
            />
          )}
        </div>
      </div>
    </section>
  )
}
