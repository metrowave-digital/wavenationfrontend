import { HlsVideoPlayer } from './HlsVideoPlayer'

export function CloudflareStreamPlayer({
  playbackIdOrUrl,
  accountHash,
  posterUrl,
  title,
}: {
  playbackIdOrUrl?: string
  accountHash?: string
  posterUrl?: string
  title?: string
}) {
  const isUrl = playbackIdOrUrl?.startsWith('http')
  const hlsUrl = isUrl
    ? playbackIdOrUrl
    : playbackIdOrUrl && accountHash
      ? `https://customer-${accountHash}.cloudflarestream.com/${playbackIdOrUrl}/manifest/video.m3u8`
      : undefined

  return <HlsVideoPlayer hlsUrl={hlsUrl} posterUrl={posterUrl} title={title} />
}
