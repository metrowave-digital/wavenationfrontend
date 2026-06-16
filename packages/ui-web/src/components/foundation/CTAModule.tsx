import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './CTAModule.module.css'

export type CTAAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export type CTAModuleProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: CTAAction[]
  media?: ReactNode
  variant?: 'banner' | 'split' | 'compact' | 'centered'
  accent?: 'blue' | 'magenta' | 'green'
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function CTAModule({
  eyebrow = 'Amplify Your Vibe',
  title,
  description,
  actions = [],
  media,
  variant = 'split',
  accent = 'blue',
  className,
}: CTAModuleProps) {
  return (
    <section className={cx(styles.cta, styles[variant], styles[accent], className)}>
      <div className={styles.content}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}

        {actions.length ? (
          <div className={styles.actions}>
            {actions.map((action) => (
              <Link
                key={`${action.label}-${action.href}`}
                href={action.href}
                className={cx(styles.action, styles[action.variant ?? 'primary'])}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {media ? <div className={styles.media}>{media}</div> : null}
    </section>
  )
}