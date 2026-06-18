// packages/ui-web/src/components/player/PlayerPopup.tsx

import Link from 'next/link'
import { RiCloseLine, RiExternalLinkLine } from 'react-icons/ri'
import { PlayerActions } from './PlayerActions'
import { PlayerInfo } from './PlayerInfo'
import { PlayerProgress } from './PlayerProgress'
import type { PlayerStatus, PlayerTrack } from './playerTypes'
import styles from './PlayerPopup.module.css'

type PlayerPopupProps = {
  isOpen: boolean
  status: PlayerStatus
  isPlaying: boolean
  isMuted: boolean
  volume: number
  track: PlayerTrack
  queue?: PlayerTrack[]
  recentlyPlayed?: PlayerTrack[]
  defaultArtworkUrl?: string
  listenHref?: string
  metadataEndpoint?: string
  statusMessage?: string
  onClose: () => void
  onPlayToggle: () => void
  onMuteToggle: () => void
  onVolumeChange: (volume: number) => void
  onReload: () => void
  onShare: () => void
}

function TrackList({
  title,
  emptyText,
  items = [],
}: {
  title: string
  emptyText: string
  items?: PlayerTrack[]
}) {
  return (
    <section className={styles.listBlock}>
      <h3>{title}</h3>

      {items.length > 0 ? (
        <div className={styles.trackList}>
          {items.slice(0, 5).map((item, index) => (
            <article key={item.id || `${item.title}-${index}`} className={styles.trackItem}>
              <span>{index + 1}</span>

              <div>
                <p>{item.title}</p>
                <small>{item.artist || item.station || 'WaveNation FM'}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </section>
  )
}

export function PlayerPopup({
  isOpen,
  status,
  isPlaying,
  isMuted,
  volume,
  track,
  queue = [],
  recentlyPlayed = [],
  defaultArtworkUrl,
  listenHref = '/listen-live',
  metadataEndpoint,
  statusMessage,
  onClose,
  onPlayToggle,
  onMuteToggle,
  onVolumeChange,
  onReload,
  onShare,
}: PlayerPopupProps) {
  if (!isOpen) return null

  const hasMetadataEndpoint = Boolean(metadataEndpoint)

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="WaveNation full player"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>WaveNation Player</p>
            <h2>Amplify your vibe.</h2>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close player"
          >
            <RiCloseLine aria-hidden="true" />
          </button>
        </div>

        <div className={styles.hero}>
          <PlayerInfo track={track} defaultArtworkUrl={defaultArtworkUrl} />

          <PlayerProgress status={status} isPlaying={isPlaying} />

          {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}

          <PlayerActions
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            onPlayToggle={onPlayToggle}
            onMuteToggle={onMuteToggle}
            onVolumeChange={onVolumeChange}
            onOpenPopup={() => undefined}
            onReload={onReload}
            onShare={onShare}
          />

          <div className={styles.quickLinks}>
            <Link href={listenHref}>
              Open Listen Page
              <RiExternalLinkLine aria-hidden="true" />
            </Link>

            <span>
              {hasMetadataEndpoint ? 'Metadata connected' : 'Live metadata coming soon'}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <TrackList
            title="Coming Up"
            emptyText="Upcoming tracks and shows will appear here after metadata is connected."
            items={queue}
          />

          <TrackList
            title="Recently Played"
            emptyText="Recently played tracks will appear here after metadata is connected."
            items={recentlyPlayed}
          />
        </div>
      </section>
    </div>
  )
}