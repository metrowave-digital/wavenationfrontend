import styles from './PlaylistTrackList.module.css'
import type { PlaylistTrackSummary } from './types'

type PlaylistTrackListProps = {
  tracks: PlaylistTrackSummary[]
  emptyText?: string
}

function badgeLabels(track: PlaylistTrackSummary) {
  return [
    track.isNewThisWeek ? 'New' : undefined,
    track.isFeaturedPlacement ? 'Featured' : undefined,
    track.isIndieSpotlight ? 'Indie Spotlight' : undefined,
    track.explicit ? 'Explicit' : undefined,
  ].filter((label): label is string => Boolean(label))
}

export function PlaylistTrackList({ tracks, emptyText = 'Tracks will appear here once this playlist is published.' }: PlaylistTrackListProps) {
  if (tracks.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>
  }

  return (
    <ol className={styles.list}>
      {tracks.map((track, index) => {
        const badges = badgeLabels(track)
        const position = track.position ?? index + 1

        return (
          <li key={`${track.id ?? position}-${track.title}-${index}`} className={styles.row}>
            <span className={styles.position}>{position}</span>

            <div className={styles.artwork}>
              {track.artwork?.url ? <img src={track.artwork.url} alt={track.artwork.alt || track.title} loading="lazy" /> : <span />}
            </div>

            <div className={styles.main}>
              <h3>{track.title}</h3>
              <p>{track.artistName || 'WaveNation Music Team'}</p>
              {track.editorialNote ? <p className={styles.note}>{track.editorialNote}</p> : null}
            </div>

            <div className={styles.meta}>
              {track.albumOrProject ? <span>{track.albumOrProject}</span> : null}
              {track.duration ? <strong>{track.duration}</strong> : null}
            </div>

            {badges.length > 0 ? (
              <div className={styles.badges}>
                {badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
