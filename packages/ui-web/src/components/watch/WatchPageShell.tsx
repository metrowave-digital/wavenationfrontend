import type { ReactNode } from 'react'
import styles from './Watch.module.css'
import { cx } from './utils'

export function WatchPageShell({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <main className={cx(styles.shell, className)}>
      {(eyebrow || title || subtitle) && (
        <section className={styles.section}>
          <div className={styles.container}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? <h1 className={styles.title}>{title}</h1> : null}
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </section>
      )}
      {children}
    </main>
  )
}
