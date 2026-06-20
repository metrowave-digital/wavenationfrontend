import { MuxVideoPlayer } from '@wavenation/ui-web'
import { getMuxPlayerTokens } from '../lib/mux-sever'

type VODPlayerItem = {
  id?: string | number
  title: string
  provider?: string
  muxPlaybackId?: string | null
  signedPlayback?: boolean | null
  poster?: string | null
  posterUrl?: string | null
  image?: string | null
  hlsUrl?: string | null
  embedUrl?: string | null
  access?: {
    isLocked?: boolean
  }
}

type VODPlayerProps = {
  item: VODPlayerItem
  viewerUserId?: string | number | null
}

function readEnvColor(value: string | undefined, fallback: string) {
  return value && value.trim() ? value.trim() : fallback
}

function normalizeMaxResolution(value: string | undefined) {
  if (
    value === '720p' ||
    value === '1080p' ||
    value === '1440p' ||
    value === '2160p'
  ) {
    return value
  }

  return '1080p'
}

export async function VODPlayer({ item, viewerUserId }: VODPlayerProps) {
  const tokens = await getMuxPlayerTokens({
    playbackId: item.muxPlaybackId,
    signed: item.signedPlayback || item.access?.isLocked,
  })

  return (
    <MuxVideoPlayer
      playbackId={item.muxPlaybackId}
      title={item.title}
      videoId={item.id}
      viewerUserId={viewerUserId || 'anonymous'}
      poster={item.poster || item.posterUrl || item.image || undefined}
      streamType="on-demand"
      tokens={tokens}
      accentColor={readEnvColor(
        process.env.NEXT_PUBLIC_WAVENATION_MUX_PLAYER_ACCENT_COLOR,
        '#E92C63'
      )}
      primaryColor={readEnvColor(
        process.env.NEXT_PUBLIC_WAVENATION_MUX_PLAYER_PRIMARY_COLOR,
        '#FFFFFF'
      )}
      secondaryColor={readEnvColor(
        process.env.NEXT_PUBLIC_WAVENATION_MUX_PLAYER_SECONDARY_COLOR,
        '#0B0D0F'
      )}
      maxResolution={normalizeMaxResolution(
        process.env.NEXT_PUBLIC_WAVENATION_MUX_MAX_RESOLUTION
      )}
      debug={process.env.NEXT_PUBLIC_WAVENATION_MUX_DEBUG === 'true'}
    />
  )
}