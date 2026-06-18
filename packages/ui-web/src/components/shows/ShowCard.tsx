import Link from 'next/link'
import { ShowArtwork } from './ShowArtwork'
import styles from './ShowCard.module.css'
import type { UnifiedShow } from './types'

type ShowCardProps = {
  show: UnifiedShow
  priority?: boolean
  variant?: 'standard' | 'feature' | 'compact'
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function peopleLabel(show: UnifiedShow) {
  const people = show.hosts?.length ? show.hosts : show.talent
  if (!people?.length) return undefined
  return people.map((person) => person.name).slice(0, 2).join(', ')
}

export function ShowCard({ show, variant = 'standard' }: ShowCardProps) {
  const people = peopleLabel(show)

  return (
    <article className={cx(styles.card, styles[show.type], styles[variant])}>
      <Link href={show.href} className={styles.mediaLink} aria-label={`View ${show.title}`}>
        <ShowArtwork
          title={show.title}
          type={show.type}
          imageUrl={show.imageUrl}
          imageAlt={show.imageAlt}
          size={variant === 'compact' ? 'thumb' : 'card'}
        />
      </Link>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.badge}>{show.type}</span>
          {show.statusLabel ? <span>{show.statusLabel}</span> : null}
          {show.scheduleLabel ? <span>{show.scheduleLabel}</span> : null}
        </div>

        <h3>
          <Link href={show.href}>{show.title}</Link>
        </h3>

        {people ? <p className={styles.people}>{people}</p> : null}

        {show.shortDescription || show.description ? (
          <p className={styles.description}>{show.shortDescription || show.description}</p>
        ) : null}

        <div className={styles.footer}>
          <Link href={show.primaryActionHref} className={styles.primaryAction}>
            {show.primaryActionLabel}
          </Link>
          {show.secondaryActionHref && show.secondaryActionLabel ? (
            <Link href={show.secondaryActionHref} className={styles.secondaryAction}>
              {show.secondaryActionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
