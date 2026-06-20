import styles from './MusicArtwork.module.css'
import type { MusicAccent, MusicImage } from './types'

type MusicArtworkProps = {
  image?: MusicImage
  title: string
  eyebrow?: string
  accent?: MusicAccent
  shape?: 'square' | 'wide' | 'circle'
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function getInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

export function MusicArtwork({ image, title, eyebrow, accent = 'electric_blue', shape = 'square', className }: MusicArtworkProps) {
  return (
    <div className={cx(styles.artwork, styles[shape], styles[`accent_${accent}`], className)}>
      {image?.url ? (
        <img src={image.url} alt={image.alt || title} loading="lazy" />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <span>{getInitials(title) || 'WN'}</span>
        </div>
      )}

      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
    </div>
  )
}
