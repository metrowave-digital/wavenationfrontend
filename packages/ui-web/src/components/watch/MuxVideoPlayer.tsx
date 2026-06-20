'use client'

import MuxPlayer from '@mux/mux-player-react/lazy'
import styles from './MuxVideoPlayer.module.css'

export type MuxStreamType =
  | 'on-demand'
  | 'live'
  | 'll-live'
  | 'live:dvr'
  | 'll-live:dvr'

export type MuxPlayerTokens = {
  playback?: string
  thumbnail?: string
  storyboard?: string
  drm?: string
}

export type MuxVideoPlayerProps = {
  playbackId?: string | null
  title?: string
  videoId?: string | number | null
  viewerUserId?: string | number | null
  poster?: string | null
  streamType?: MuxStreamType
  tokens?: MuxPlayerTokens | null
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  accentColor?: string
  primaryColor?: string
  secondaryColor?: string
  maxResolution?: '720p' | '1080p' | '1440p' | '2160p'
  debug?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: () => void
}

function hasTokens(tokens?: MuxPlayerTokens | null) {
  return Boolean(
    tokens?.playback ||
      tokens?.thumbnail ||
      tokens?.storyboard ||
      tokens?.drm
  )
}

export function MuxVideoPlayer({
  playbackId,
  title = 'WaveNation Video',
  videoId,
  viewerUserId,
  poster,
  streamType = 'on-demand',
  tokens,
  autoplay = false,
  muted = false,
  loop = false,
  accentColor = '#E92C63',
  primaryColor = '#FFFFFF',
  secondaryColor = '#0B0D0F',
  maxResolution = '1080p',
  debug = false,
  className,
  onPlay,
  onPause,
  onEnded,
  onError,
}: MuxVideoPlayerProps) {
  if (!playbackId) {
    return (
      <div className={`${styles.emptyState} ${className || ''}`} role="status">
        <span className={styles.emptyEyebrow}>WaveNation Watch</span>
        <strong>Video unavailable</strong>
        <p>This item is missing a Mux playback ID.</p>
      </div>
    )
  }

  const metadata = {
    video_id: String(videoId || playbackId),
    video_title: title,
    viewer_user_id: String(viewerUserId || 'anonymous'),
  }

  return (
    <div className={`${styles.shell} ${className || ''}`}>
      <MuxPlayer
        className={styles.player}
        playbackId={playbackId}
        streamType={streamType}
        metadata={metadata}
        poster={poster || undefined}
        tokens={hasTokens(tokens) ? tokens || undefined : undefined}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        accentColor={accentColor}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        maxResolution={maxResolution}
        debug={debug}
        loading="viewport"
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
      />
    </div>
  )
}