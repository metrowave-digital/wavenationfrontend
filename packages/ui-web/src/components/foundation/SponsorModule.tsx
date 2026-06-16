import type { ReactNode } from 'react'
import styles from './SponsorModule.module.css'

export type SponsorItem = {
  id?: string
  name: string
  logoUrl?: string
  href?: string
  label?: string
}

export type SponsorModuleProps = {
  eyebrow?: string
  title?: string
  description?: string
  sponsors?: SponsorItem[]
  children?: ReactNode
  variant?: 'strip' | 'panel' | 'grid'
  disclosure?: string
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function SponsorModule({
  eyebrow = 'Brand Partners',
  title = 'Sponsored by partners who support the culture.',
  description,
  sponsors = [],
  children,
  variant = 'panel',
  disclosure = 'Sponsored placement',
  className,
}: SponsorModuleProps) {
  return (
    <section className={cx(styles.sponsor, styles[variant], className)} aria-label="Sponsor module">
      <div className={styles.header}>
        <p className={styles.disclosure}>{disclosure}</p>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {title ? <h2>{title}</h2> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>

      {sponsors.length ? (
        <div className={styles.logos}>
          {sponsors.map((sponsor) => {
            const content = (
              <>
                {sponsor.logoUrl ? (
                  <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} />
                ) : (
                  <span className={styles.logoFallback}>{sponsor.name.slice(0, 2)}</span>
                )}
                <span className={styles.name}>{sponsor.label || sponsor.name}</span>
              </>
            )

            return sponsor.href ? (
              <a
                key={sponsor.id ?? sponsor.name}
                href={sponsor.href}
                className={styles.logoCard}
                rel="sponsored noopener noreferrer"
                target={sponsor.href.startsWith('http') ? '_blank' : undefined}
              >
                {content}
              </a>
            ) : (
              <div key={sponsor.id ?? sponsor.name} className={styles.logoCard}>
                {content}
              </div>
            )
          })}
        </div>
      ) : null}

      {children ? <div className={styles.extra}>{children}</div> : null}
    </section>
  )
}