import Link from 'next/link'
import styles from './TalentCard.module.css'
import type { TalentProfileSummary } from './types'

export function TalentCard({ talent }: { talent: TalentProfileSummary }) {
  return (
    <article className={styles.card}>
      <Link href={talent.href} className={styles.imageWrap} aria-label={`View ${talent.name}`}>
        {talent.imageUrl ? (
          <img src={talent.imageUrl} alt={talent.imageAlt || talent.name} loading="lazy" />
        ) : (
          <span>{talent.name.slice(0, 2).toUpperCase()}</span>
        )}
      </Link>
      <div className={styles.body}>
        <div className={styles.metaRow}>
          {talent.role ? <span>{talent.role}</span> : null}
          {talent.isFeatured ? <span>Featured</span> : null}
        </div>
        <h3><Link href={talent.href}>{talent.name}</Link></h3>
        {talent.shortBio ? <p>{talent.shortBio}</p> : null}
        <Link href={talent.href} className={styles.action}>View profile</Link>
      </div>
    </article>
  )
}
