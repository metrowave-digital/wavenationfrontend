import Link from 'next/link'
import { MusicArtwork } from './MusicArtwork'
import styles from './MusicCard.module.css'
import type { MusicAccent, MusicImage, PlatformLink } from './types'

type MusicCardProps = {
  href: string
  title: string
  eyebrow?: string
  description?: string
  image?: MusicImage
  meta?: string
  badge?: string
  accent?: MusicAccent
  tags?: string[]
  platformLinks?: PlatformLink[]
  variant?: 'standard' | 'compact' | 'feature'
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function MusicCard({
  href,
  title,
  eyebrow,
  description,
  image,
  meta,
  badge,
  accent = 'electric_blue',
  tags = [],
  platformLinks = [],
  variant = 'standard',
  className,
}: MusicCardProps) {
  return (
    <article className={cx(styles.card, styles[variant], className)}>
      <Link href={href} className={styles.artworkLink} aria-label={title}>
        <MusicArtwork image={image} title={title} eyebrow={badge} accent={accent} shape={variant === 'feature' ? 'wide' : 'square'} />
      </Link>

      <div className={styles.body}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h3>
          <Link href={href}>{title}</Link>
        </h3>
        {description ? <p className={styles.description}>{description}</p> : null}
        {meta ? <p className={styles.meta}>{meta}</p> : null}

        {tags.length > 0 ? (
          <div className={styles.tags} aria-label="Tags">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}

        {platformLinks.length > 0 ? (
          <div className={styles.platforms} aria-label="Available platforms">
            {platformLinks.slice(0, 4).map((platform) => (
              <span key={`${platform.key}-${platform.url}`}>{platform.label}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
