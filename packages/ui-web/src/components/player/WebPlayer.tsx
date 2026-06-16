// packages/ui-web/src/components/player/WebPlayer.tsx

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MobileDock } from './MobileDock'
import { PlayerActions } from './PlayerActions'
import { PlayerInfo } from './PlayerInfo'
import { PlayerPopup } from './PlayerPopup'
import { PlayerProgress } from './PlayerProgress'
import type { PlayerStatus, PlayerTrack, WebPlayerProps } from './playerTypes'
import styles from './WebPlayer.module.css'

const FALLBACK_TRACK: PlayerTrack = {
  title: 'WaveNation FM',
  artist: 'Streaming Live 24/7',
  album: 'AMPLIFY YOUR VIBE',
  station: 'WaveNation FM',
  liveLabel: 'Live Now',
}

const DEFAULT_QUEUE: PlayerTrack[] = [
  {
    id: 'queue-1',
    title: 'The Morning Vibe',
    artist: 'WaveNation FM Programming',
    album: 'Coming up on WaveNation',
  },
  {
    id: 'queue-2',
    title: 'Southern Soul Saturdays',
    artist: 'WaveNation FM Programming',
    album: 'Weekend rotation',
  },
  {
    id: 'queue-3',
    title: 'Indie Uncensored / Soul Stories',
    artist: 'WaveNation FM Programming',
    album: 'Creator spotlight block',
  },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function clampVolume(value: number) {
  if (Number.isNaN(value)) return 0.8
  return Math.min(1, Math.max(0, value))
}

export function WebPlayer({
  streamUrl,
  streamType = 'audio/mpeg',
  metadataEndpoint,
  station,
  track,
  queue = DEFAULT_QUEUE,
  recentlyPlayed = [],
  defaultArtworkUrl,
  listenHref = '/listen',
  watchHref = '/watch',
  profileHref = '/api/auth/login',
  autoPlay = true,
  defaultVolume = 0.8,
  startMuted = false,
  showMobileDock = true,
  className,
  crossOrigin,
  onPlay,
  onPause,
  onOpenPopup,
  onClosePopup,
  onShare,
  onReload,
  onMuteChange,
  onError,
}: WebPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(startMuted)
  const [volume, setVolume] = useState(() => clampVolume(defaultVolume))
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const resolvedTrack = useMemo<PlayerTrack>(() => {
    return {
      ...FALLBACK_TRACK,
      ...track,
      station: track?.station || station?.name || FALLBACK_TRACK.station,
      artworkUrl: track?.artworkUrl || station?.logoUrl || defaultArtworkUrl,
    }
  }, [defaultArtworkUrl, station?.logoUrl, station?.name, track])

  const analyticsBase = useMemo(
    () => ({
      station: station?.name || resolvedTrack.station,
      streamUrl,
      track: resolvedTrack,
    }),
    [resolvedTrack, station?.name, streamUrl],
  )

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    setIsPlaying(false)
    setStatus('paused')
    setStatusMessage('WaveNation FM is paused.')
    onPause?.({ action: 'pause', ...analyticsBase })
  }, [analyticsBase, onPause])

  const play = useCallback(
    async (origin: 'manual' | 'autoplay' = 'manual') => {
      const audio = audioRef.current
      if (!audio || !streamUrl) return

      try {
        setStatus('loading')
        setStatusMessage(origin === 'autoplay' ? 'Starting WaveNation FM…' : 'Connecting to WaveNation FM…')

        audio.volume = volume
        audio.muted = isMuted

        await audio.play()

        setIsPlaying(true)
        setStatus('playing')
        setStatusMessage('WaveNation FM is live.')
        onPlay?.({ action: 'play', ...analyticsBase })
      } catch (error) {
        setIsPlaying(false)
        setStatus(origin === 'autoplay' ? 'blocked' : 'error')
        setStatusMessage(
          origin === 'autoplay'
            ? 'Autoplay was blocked by the browser. Tap play to start WaveNation FM.'
            : 'The live stream could not start. Try reloading the player.',
        )
        onError?.(error)
      }
    },
    [analyticsBase, isMuted, onError, onPlay, streamUrl, volume],
  )

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      pause()
      return
    }

    void play('manual')
  }, [isPlaying, pause, play])

  const handleMuteToggle = useCallback(() => {
    setIsMuted((current) => {
      const next = !current
      const audio = audioRef.current

      if (audio) {
        audio.muted = next
      }

      onMuteChange?.({
        action: next ? 'mute' : 'unmute',
        isMuted: next,
        ...analyticsBase,
      })

      return next
    })
  }, [analyticsBase, onMuteChange])

  const handleVolumeChange = useCallback(
    (nextVolume: number) => {
      const safeVolume = clampVolume(nextVolume)
      const audio = audioRef.current

      setVolume(safeVolume)

      if (audio) {
        audio.volume = safeVolume
      }

      if (safeVolume > 0 && isMuted) {
        setIsMuted(false)
        if (audio) audio.muted = false
      }
    },
    [isMuted],
  )

  const handleOpenPopup = useCallback(() => {
    setIsPopupOpen(true)
    onOpenPopup?.({ action: 'open_popup', ...analyticsBase })
  }, [analyticsBase, onOpenPopup])

  const handleClosePopup = useCallback(() => {
    setIsPopupOpen(false)
    onClosePopup?.({ action: 'close_popup', ...analyticsBase })
  }, [analyticsBase, onClosePopup])

  const handleReload = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const shouldResume = isPlaying

    audio.pause()
    audio.load()

    setStatus('loading')
    setStatusMessage('Reloading the live stream…')
    onReload?.({ action: 'reload', ...analyticsBase })

    if (shouldResume) {
      window.setTimeout(() => {
        void play('manual')
      }, 250)
    }
  }, [analyticsBase, isPlaying, onReload, play])

  const handleShare = useCallback(async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const shareUrl = listenHref.startsWith('http') ? listenHref : `${origin}${listenHref}`
      const shareData = {
        title: 'WaveNation FM',
        text: 'Listen live to WaveNation FM — AMPLIFY YOUR VIBE.',
        url: shareUrl,
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setStatusMessage('Listen link copied to clipboard.')
      }

      onShare?.({ action: 'share', ...analyticsBase })
    } catch (error) {
      onError?.(error)
    }
  }, [analyticsBase, listenHref, onError, onShare])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.muted = isMuted
  }, [isMuted, volume])

  useEffect(() => {
    if (!autoPlay || !streamUrl) return

    const timeout = window.setTimeout(() => {
      void play('autoplay')
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [autoPlay, play, streamUrl])

  return (
    <>
      <aside className={cx(styles.root, className)} aria-label="Persistent WaveNation web player">
        <audio
          ref={audioRef}
          src={streamUrl}
          preload={autoPlay ? 'auto' : 'none'}
          autoPlay={autoPlay}
          crossOrigin={crossOrigin}
          onPlaying={() => {
            setIsPlaying(true)
            setStatus('playing')
            setStatusMessage('WaveNation FM is live.')
          }}
          onPause={() => {
            setIsPlaying(false)
            if (status !== 'error' && status !== 'blocked') setStatus('paused')
          }}
          onWaiting={() => {
            setStatus('loading')
            setStatusMessage('Buffering WaveNation FM…')
          }}
          onCanPlay={() => {
            if (!isPlaying && status === 'loading') setStatus('paused')
          }}
          onError={(event) => {
            setIsPlaying(false)
            setStatus('error')
            setStatusMessage('The live stream is temporarily unavailable. Try reloading the player.')
            onError?.(event)
          }}
        >
          <source src={streamUrl} type={streamType} />
        </audio>

        <div className={styles.bar}>
          <div className={styles.content}>
            <PlayerInfo track={resolvedTrack} defaultArtworkUrl={defaultArtworkUrl} compact />

            <div className={styles.progressWrap}>
              <PlayerProgress status={status} isPlaying={isPlaying} />
              <p className={styles.message} aria-live="polite">
                {statusMessage || 'WaveNation FM is ready.'}
              </p>
            </div>

            <PlayerActions
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              disabled={!streamUrl}
              onPlayToggle={handlePlayToggle}
              onMuteToggle={handleMuteToggle}
              onVolumeChange={handleVolumeChange}
              onOpenPopup={handleOpenPopup}
              onReload={handleReload}
              onShare={handleShare}
            />
          </div>
        </div>
      </aside>

      <PlayerPopup
        isOpen={isPopupOpen}
        status={status}
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        track={resolvedTrack}
        queue={queue}
        recentlyPlayed={recentlyPlayed}
        defaultArtworkUrl={defaultArtworkUrl}
        listenHref={listenHref}
        metadataEndpoint={metadataEndpoint}
        statusMessage={statusMessage}
        onClose={handleClosePopup}
        onPlayToggle={handlePlayToggle}
        onMuteToggle={handleMuteToggle}
        onVolumeChange={handleVolumeChange}
        onReload={handleReload}
        onShare={handleShare}
      />

      {showMobileDock ? (
        <MobileDock
          isPlaying={isPlaying}
          watchHref={watchHref}
          profileHref={profileHref}
          onPlayToggle={handlePlayToggle}
        />
      ) : null}
    </>
  )
}