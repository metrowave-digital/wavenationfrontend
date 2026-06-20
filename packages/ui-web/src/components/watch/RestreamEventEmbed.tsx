import styles from './Watch.module.css'
import { HlsVideoPlayer } from './HlsVideoPlayer'

export function RestreamEventEmbed({
  embedUrl,
  hlsUrl,
  title = 'WaveNation live event',
  posterUrl,
}: {
  embedUrl?: string
  hlsUrl?: string
  title?: string
  posterUrl?: string
}) {
  if (hlsUrl) return <HlsVideoPlayer hlsUrl={hlsUrl} posterUrl={posterUrl} title={title} />
  if (!embedUrl) return <div className={styles.empty}>Add a Restream embed URL to this event’s livestreamUrl field.</div>
  return (
    <div className={styles.playerFrame}>
      <iframe
        className={styles.iframe}
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
