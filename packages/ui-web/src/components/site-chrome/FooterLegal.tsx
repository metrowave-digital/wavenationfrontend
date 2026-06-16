import Link from 'next/link'
import styles from './FooterLegal.module.css'
import type { FooterLink } from './types'

type FooterLegalProps = {
  links?: FooterLink[] | null
}

export function FooterLegal({ links }: FooterLegalProps) {
  const safeLinks = links ?? []

  return (
    <div className={styles.legal}>
      <p>© {new Date().getFullYear()} WaveNation Media. All rights reserved.</p>

      <nav aria-label="Legal links">
        {safeLinks.map((link) => (
          <Link key={link.id ?? link.label} href={link.href || '#'}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}