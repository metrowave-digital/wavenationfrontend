import styles from './Watch.module.css'

export function StrimmEmbedPlayer({ embedUrl, title = 'WaveNation live channel' }: { embedUrl?: string; title?: string }) {
  if (!embedUrl) return <div className={styles.empty}>Add the Strimm embed URL to your channel environment variables.</div>
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
