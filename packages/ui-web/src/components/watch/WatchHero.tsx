import styles from './Watch.module.css'
import type { WatchImage, WatchLink } from './types'
import { WatchButtons } from './WatchButtons'

export function WatchHero({
  eyebrow = 'WaveNation One',
  title,
  subtitle,
  image,
  badge = 'Live + On Demand',
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  image?: WatchImage
  badge?: string
  actions?: WatchLink[]
}) {
  return (
    <section className={styles.hero}>
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div>
          <span className={styles.liveBadge}><span className={styles.liveDot} />{badge}</span>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          <WatchButtons actions={actions} />
        </div>
        <div className={styles.heroCard} aria-hidden={!image?.url}>
          {image?.url ? <img className={styles.heroImage} src={image.url} alt={image.alt || ''} /> : <div className={styles.cardFallback} />}
          <div className={styles.heroOverlay} />
        </div>
      </div>
    </section>
  )
}
