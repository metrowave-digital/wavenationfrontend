// packages/ui-web/src/components/player/PlayerInfo.tsx

import type { PlayerTrack } from './playerTypes'
import styles from './PlayerInfo.module.css'

type PlayerInfoProps = {
  track: PlayerTrack
  defaultArtworkUrl?: string
  compact?: boolean
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function PlayerInfo({
  track,
  defaultArtworkUrl,
  compact = false,
  className,
}: PlayerInfoProps) {
  const artworkUrl = track.artworkUrl || defaultArtworkUrl
  const title = track.title || 'WaveNation FM'
  const artist = track.artist || 'Streaming Live 24/7'
  const album = track.album || 'AMPLIFY YOUR VIBE'
  const station = track.station || 'WaveNation FM'
  const liveLabel = track.liveLabel || 'Live Now'

  return (
    <div className={cx(styles.info, compact && styles.compact, className)}>
      <div className={styles.artworkWrap} aria-hidden={!artworkUrl}>
        {artworkUrl ? (
          <img className={styles.artwork} src={artworkUrl} alt={`${station} artwork`} />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className={styles.copy}>
        <div className={styles.liveRow}>
          <span className={styles.liveDot} aria-hidden="true" />
          <span className={styles.liveLabel}>{liveLabel}</span>
          <span className={styles.station}>{station}</span>
        </div>

        <p className={styles.title}>{title}</p>
        <p className={styles.artist}>{artist}</p>
        {!compact ? <p className={styles.album}>{album}</p> : null}
      </div>
    </div>
  )
}