import Link from 'next/link'
import styles from './FooterNav.module.css'
import type { FooterColumn } from './types'

type FooterNavProps = {
  columns?: FooterColumn[] | null
}

export function FooterNav({ columns }: FooterNavProps) {
  const safeColumns = columns ?? []

  return (
    <nav className={styles.nav} aria-label="Footer navigation">
      {safeColumns.map((column) => {
        const safeLinks = column.links ?? []

        return (
          <section key={column.id ?? column.label} className={styles.column}>
            <h2>{column.label}</h2>

            <ul>
              {safeLinks.map((link) => (
                <li key={link.id ?? link.label}>
                  <Link href={link.href || '#'}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}