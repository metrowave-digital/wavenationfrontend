import styles from './ShowArtwork.module.css'
import type { ShowType } from './types'

type ShowArtworkProps = {
  title: string
  type: ShowType
  imageUrl?: string
  imageAlt?: string
  size?: 'card' | 'hero' | 'thumb'
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function ShowArtwork({ title, type, imageUrl, imageAlt, size = 'card' }: ShowArtworkProps) {
  return (
    <div className={cx(styles.artwork, styles[type], styles[size])}>
      {imageUrl ? (
        <img src={imageUrl} alt={imageAlt || title} loading="lazy" />
      ) : (
        <div className={styles.fallback} aria-hidden="true">
          <span>{type}</span>
          <strong>{title.slice(0, 2).toUpperCase()}</strong>
        </div>
      )}
      <span className={styles.glow} aria-hidden="true" />
    </div>
  )
}
