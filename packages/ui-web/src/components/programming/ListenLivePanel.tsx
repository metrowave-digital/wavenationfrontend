import styles from './ListenLivePanel.module.css'

type ListenLivePanelProps = {
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  imageAlt?: string
  meta?: string
  isLive?: boolean
}

export function ListenLivePanel({
  title,
  subtitle = 'Live Radio',
  description,
  imageUrl,
  imageAlt,
  meta,
  isLive = false,
}: ListenLivePanelProps) {
  return (
    <article className={styles.panel}>
      <div className={styles.artwork}>
        {imageUrl ? <img src={imageUrl} alt={imageAlt || title} /> : <span>WN</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.statusRow}>
          <span className={isLive ? styles.liveBadge : styles.badge}>{isLive ? 'Live Now' : subtitle}</span>
          {meta ? <span className={styles.meta}>{meta}</span> : null}
        </div>

        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </article>
  )
}
