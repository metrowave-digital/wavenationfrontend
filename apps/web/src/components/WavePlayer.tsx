'use client'

import { WebPlayer, type PlayerTrack } from '@wavenation/ui-web'

function envBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback

  const normalized = value.trim().toLowerCase()

  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function envNumber(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

const streamUrl =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_URL ||
  'https://streaming.live365.com/a49099'

const streamType =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_TYPE || 'audio/mpeg'

const stationName =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STATION_NAME || 'WaveNation FM'

const listenHref =
  process.env.NEXT_PUBLIC_WAVENATION_LISTEN_URL || '/listen'

const watchHref =
  process.env.NEXT_PUBLIC_WAVENATION_WATCH_URL || '/watch'

const profileHref =
  process.env.NEXT_PUBLIC_WAVENATION_PROFILE_URL || '/api/auth/login'

const defaultArtworkUrl =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_DEFAULT_ARTWORK ||
  '/images/wavenation-player-default.jpg'

const metadataEndpoint =
  process.env.NEXT_PUBLIC_WAVENATION_METADATA_URL || '/api/radio/live365'

const defaultVolume = envNumber(
  process.env.NEXT_PUBLIC_WAVENATION_PLAYER_DEFAULT_VOLUME,
  0.82,
)

const fallbackTrack: PlayerTrack = {
  title:
    process.env.NEXT_PUBLIC_WAVENATION_RADIO_FALLBACK_TITLE ||
    'WaveNation FM',
  artist:
    process.env.NEXT_PUBLIC_WAVENATION_RADIO_FALLBACK_ARTIST ||
    'Streaming Live 24/7',
  album:
    process.env.NEXT_PUBLIC_WAVENATION_RADIO_FALLBACK_ALBUM ||
    'AMPLIFY YOUR VIBE',
  artworkUrl: defaultArtworkUrl,
  station: stationName,
  liveLabel: 'Live Now',
}

export function WavePlayer() {
  return (
    <WebPlayer
      streamUrl={streamUrl}
      streamType={streamType}
      metadataEndpoint={metadataEndpoint}
      station={{
        name: stationName,
        tagline: 'AMPLIFY YOUR VIBE',
        streamUrl,
        streamType,
        listenHref,
        logoUrl: defaultArtworkUrl,
      }}
      track={fallbackTrack}
      defaultArtworkUrl={defaultArtworkUrl}
      listenHref={listenHref}
      watchHref={watchHref}
      profileHref={profileHref}
      autoPlay={envBoolean(
        process.env.NEXT_PUBLIC_WAVENATION_PLAYER_AUTOPLAY,
        true,
      )}
      defaultVolume={defaultVolume}
      startMuted={envBoolean(
        process.env.NEXT_PUBLIC_WAVENATION_PLAYER_START_MUTED,
        false,
      )}
      showMobileDock
      onPlay={(payload) => {
        console.info('[WavePlayer] play', payload)
      }}
      onPause={(payload) => {
        console.info('[WavePlayer] pause', payload)
      }}
      onOpenPopup={(payload) => {
        console.info('[WavePlayer] open popup', payload)
      }}
      onShare={(payload) => {
        console.info('[WavePlayer] share', payload)
      }}
      onError={(error) => {
        console.error('[WavePlayer] error', error)
      }}
    />
  )
}