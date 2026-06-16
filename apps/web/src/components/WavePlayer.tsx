// apps/web/src/components/WavePlayer.tsx

'use client'

import { WebPlayer, type PlayerTrack } from '@wavenation/ui-web'

function envBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

const streamUrl =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_URL || 'https://streaming.live365.com/a49099'

const streamType = process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_TYPE || 'audio/mpeg'

const stationName = process.env.NEXT_PUBLIC_WAVENATION_RADIO_STATION_NAME || 'WaveNation FM'

const listenHref = process.env.NEXT_PUBLIC_WAVENATION_LISTEN_URL || '/listen'
const watchHref = process.env.NEXT_PUBLIC_WAVENATION_WATCH_URL || '/watch'
const profileHref = process.env.NEXT_PUBLIC_WAVENATION_PROFILE_URL || '/api/auth/login'

const defaultArtworkUrl =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_DEFAULT_ARTWORK || '/images/wavenation-player-default.jpg'

const fallbackTrack: PlayerTrack = {
  title: process.env.NEXT_PUBLIC_WAVENATION_RADIO_FALLBACK_TITLE || 'WaveNation FM',
  artist: process.env.NEXT_PUBLIC_WAVENATION_RADIO_FALLBACK_ARTIST || 'Streaming Live 24/7',
  album: process.env.NEXT_PUBLIC_WAVENATION_RADIO_FALLBACK_ALBUM || 'AMPLIFY YOUR VIBE',
  artworkUrl: defaultArtworkUrl,
  station: stationName,
  liveLabel: 'Live Now',
}

export function WavePlayer() {
  return (
    <WebPlayer
      streamUrl={streamUrl}
      streamType={streamType}
      metadataEndpoint={process.env.NEXT_PUBLIC_WAVENATION_METADATA_URL}
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
      autoPlay={envBoolean(process.env.NEXT_PUBLIC_WAVENATION_PLAYER_AUTOPLAY, true)}
      defaultVolume={0.82}
      startMuted={false}
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