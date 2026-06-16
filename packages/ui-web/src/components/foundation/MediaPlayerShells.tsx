'use client'

import type { ReactNode } from 'react'
import styles from './MediaPlayerShells.module.css'

export type PlayerAccent = 'blue' | 'magenta' | 'green'

export type AudioTrack = {
  title: string
  artist?: string
  album?: string
  artworkUrl?: string
  station?: string
  liveLabel?: string
}

export type AudioPlayerShellProps = {
  track: AudioTrack
  isPlaying?: boolean
  progress?: number
  elapsedLabel?: string
  durationLabel?: string
  queue?: ReactNode
  actions?: ReactNode
  accent?: PlayerAccent
  onPlayToggle?: () => void
  onSkipPrevious?: () => void
  onSkipNext?: () => void
  className?: string
}

export type VideoPlayerShellProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  src?: string
  posterUrl?: string
  captionsSrc?: string
  isLive?: boolean
  aspectRatio?: '16/9' | '9/16' | '1/1' | '21/9'
  metaItems?: string[]
  actions?: ReactNode
  children?: ReactNode
  accent?: PlayerAccent
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function AudioPlayerShell({
  track,
  isPlaying = false,
  progress = 0,
  elapsedLabel = '0:00',
  durationLabel = 'Live',
  queue,
  actions,
  accent = 'blue',
  onPlayToggle,
  onSkipPrevious,
  onSkipNext,
  className,
}: AudioPlayerShellProps) {
  const safeProgress = Math.max(0, Math.min(progress, 100))

  return (
    <section className={cx(styles.audioShell, styles[accent], className)} aria-label="Audio player">
      <div className={styles.artwork}>
        {track.artworkUrl ? (
          <img src={track.artworkUrl} alt={track.album ? `${track.album} artwork` : ''} />
        ) : (
          <div className={styles.artworkFallback}>WN</div>
        )}
      </div>

      <div className={styles.audioMain}>
        <div className={styles.nowPlaying}>
          <p className={styles.liveLabel}>
            <span aria-hidden="true" />
            {track.liveLabel || track.station || 'WaveNation FM'}
          </p>

          <h2>{track.title}</h2>

          {track.artist ? <p className={styles.artist}>{track.artist}</p> : null}
          {track.album ? <p className={styles.album}>{track.album}</p> : null}
        </div>

        <div className={styles.audioControls}>
          <button type="button" onClick={onSkipPrevious} aria-label="Previous track">
            ‹‹
          </button>

          <button
            type="button"
            onClick={onPlayToggle}
            className={styles.playButton}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button type="button" onClick={onSkipNext} aria-label="Next track">
            ››
          </button>
        </div>

        <div className={styles.progressArea}>
          <span>{elapsedLabel}</span>
          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${safeProgress}%` }} />
          </div>
          <span>{durationLabel}</span>
        </div>
      </div>

      {actions ? <div className={styles.playerActions}>{actions}</div> : null}
      {queue ? <div className={styles.queue}>{queue}</div> : null}
    </section>
  )
}

export function VideoPlayerShell({
  title,
  subtitle,
  eyebrow = 'WaveNation One',
  src,
  posterUrl,
  captionsSrc,
  isLive = false,
  aspectRatio = '16/9',
  metaItems = [],
  actions,
  children,
  accent = 'magenta',
  className,
}: VideoPlayerShellProps) {
  return (
    <section className={cx(styles.videoShell, styles[accent], className)} aria-label="Video player">
      <div className={cx(styles.videoFrame, styles[`ratio${aspectRatio.replace('/', '')}`])}>
        {src ? (
          <video className={styles.video} controls poster={posterUrl} preload="metadata">
            <source src={src} />
            {captionsSrc ? (
              <track kind="captions" src={captionsSrc} srcLang="en" label="English captions" default />
            ) : null}
          </video>
        ) : (
          <div className={styles.videoPlaceholder}>
            <span className={styles.cornerBug}>WN</span>
            <strong>{isLive ? 'Live Video Feed' : 'Video Shell'}</strong>
            <p>Connect Cloudflare Stream, YouTube Live, or your VOD source here.</p>
          </div>
        )}

        {isLive ? <span className={styles.liveBadge}>Live</span> : null}
      </div>

      <div className={styles.videoMeta}>
        <div>
          {eyebrow ? <p className={styles.videoEyebrow}>{eyebrow}</p> : null}
          <h2>{title}</h2>
          {subtitle ? <p className={styles.videoSubtitle}>{subtitle}</p> : null}

          {metaItems.length ? (
            <ul className={styles.metaList}>
              {metaItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {actions ? <div className={styles.videoActions}>{actions}</div> : null}
      </div>

      {children ? <div className={styles.videoExtra}>{children}</div> : null}
    </section>
  )
}