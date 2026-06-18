import Link from 'next/link'
import { TalentCard } from './TalentCard'
import styles from './TalentDirectory.module.css'
import type { TalentDirectoryProps } from './types'

export function TalentDirectory({
  eyebrow = 'WaveNation Talent',
  title,
  description,
  talent,
  filters = [],
  emptyTitle = 'No talent found',
  emptyMessage = 'Check back soon as new WaveNation personalities are added.',
}: TalentDirectoryProps) {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </section>

      {filters.length ? (
        <nav className={styles.filters} aria-label="Filter talent">
          {filters.map((filter) => (
            <Link key={filter.href + filter.label} href={filter.href} aria-current={filter.isActive ? 'page' : undefined}>
              {filter.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {talent.length ? (
        <section className={styles.grid}>
          {talent.map((person) => <TalentCard key={person.id} talent={person} />)}
        </section>
      ) : (
        <section className={styles.empty}>
          <h2>{emptyTitle}</h2>
          <p>{emptyMessage}</p>
        </section>
      )}
    </div>
  )
}
