// packages/ui-web/src/components/player/playerTypes.ts

export type PlayerTrack = {
  id?: string
  title: string
  artist?: string
  album?: string
  artworkUrl?: string
  station?: string
  liveLabel?: string
  href?: string
}

export type PlayerStation = {
  name: string
  tagline?: string
  streamUrl: string
  streamType?: string
  listenHref?: string
  logoUrl?: string
}

export type PlayerStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'blocked'
  | 'error'

export type PlayerAnalyticsPayload = {
  action:
    | 'play'
    | 'pause'
    | 'open_popup'
    | 'close_popup'
    | 'share'
    | 'reload'
    | 'mute'
    | 'unmute'
  station?: string
  streamUrl?: string
  track?: PlayerTrack
}

export type PlayerAnalyticsHandlers = {
  onPlay?: (payload: PlayerAnalyticsPayload) => void
  onPause?: (payload: PlayerAnalyticsPayload) => void
  onOpenPopup?: (payload: PlayerAnalyticsPayload) => void
  onClosePopup?: (payload: PlayerAnalyticsPayload) => void
  onShare?: (payload: PlayerAnalyticsPayload) => void
  onReload?: (payload: PlayerAnalyticsPayload) => void
  onMuteChange?: (payload: PlayerAnalyticsPayload & { isMuted: boolean }) => void
  onError?: (error: unknown) => void
}

export type WebPlayerProps = PlayerAnalyticsHandlers & {
  streamUrl: string
  streamType?: string
  metadataEndpoint?: string
  station?: PlayerStation
  track?: PlayerTrack
  queue?: PlayerTrack[]
  recentlyPlayed?: PlayerTrack[]
  defaultArtworkUrl?: string
  listenHref?: string
  watchHref?: string
  profileHref?: string
  autoPlay?: boolean
  defaultVolume?: number
  startMuted?: boolean
  showMobileDock?: boolean
  className?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}