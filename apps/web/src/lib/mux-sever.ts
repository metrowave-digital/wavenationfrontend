import Mux from '@mux/mux-node'

export type MuxPlayerTokens = {
  playback?: string
  thumbnail?: string
  storyboard?: string
  drm?: string
}

type MuxPlaybackPolicy = 'public' | 'signed'
type MuxVideoQuality = 'basic' | 'plus'
type MuxJwtTokenType = 'video' | 'thumbnail' | 'storyboard' | 'drm_license'

let muxClient: Mux | null = null

function getMuxClient() {
  if (muxClient) return muxClient

  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET

  if (!tokenId || !tokenSecret) {
    throw new Error(
      'Missing Mux credentials. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET.'
    )
  }

  muxClient = new Mux({
    tokenId,
    tokenSecret,
  })

  return muxClient
}

export function shouldUseSignedMuxPlayback(value?: boolean | null) {
  if (typeof value === 'boolean') return value
  return process.env.MUX_SIGNED_PLAYBACK === 'true'
}

async function signMuxToken({
  playbackId,
  type,
  expiration,
}: {
  playbackId: string
  type: MuxJwtTokenType
  expiration: string
}) {
  const mux = getMuxClient()

  return mux.jwt.signPlaybackId(playbackId, {
    type,
    expiration,
  })
}

export async function getMuxPlayerTokens({
  playbackId,
  signed,
  expiration = '2h',
}: {
  playbackId?: string | null
  signed?: boolean | null
  expiration?: string
}): Promise<MuxPlayerTokens | undefined> {
  if (!playbackId || !shouldUseSignedMuxPlayback(signed)) {
    return undefined
  }

  const [playbackToken, thumbnailToken, storyboardToken] = await Promise.all([
    signMuxToken({
      playbackId,
      type: 'video',
      expiration,
    }),
    signMuxToken({
      playbackId,
      type: 'thumbnail',
      expiration,
    }),
    signMuxToken({
      playbackId,
      type: 'storyboard',
      expiration,
    }),
  ])

  return {
    playback: playbackToken,
    thumbnail: thumbnailToken,
    storyboard: storyboardToken,
  }
}

function getMuxPlaybackPolicy(): MuxPlaybackPolicy {
  return process.env.MUX_DEFAULT_PLAYBACK_POLICY === 'signed'
    ? 'signed'
    : 'public'
}

function getMuxVideoQuality(): MuxVideoQuality {
  return process.env.MUX_VIDEO_QUALITY === 'plus' ? 'plus' : 'basic'
}

function getMuxCorsOrigin() {
  return (
    process.env.MUX_DIRECT_UPLOAD_CORS_ORIGIN ||
    process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  )
}

export async function createMuxDirectUpload() {
  const mux = getMuxClient()

  return mux.video.uploads.create({
    cors_origin: getMuxCorsOrigin(),
    new_asset_settings: {
      playback_policies: [getMuxPlaybackPolicy()],
      video_quality: getMuxVideoQuality(),
    },
  })
}