import Image from 'next/image'
import Link from 'next/link'
import styles from './HeaderBrand.module.css'
import type { SiteSettings } from './types'

type HeaderBrandProps = {
  siteSettings?: SiteSettings | null
  isCompact?: boolean
}

export function HeaderBrand({ siteSettings, isCompact = false }: HeaderBrandProps) {
  const title = siteSettings?.siteTitle || 'WaveNation'
  const tagline = siteSettings?.tagline || 'Amplify Your Vibe'
  const logo = siteSettings?.logoLight?.sizes?.thumb?.url || siteSettings?.logoLight?.url

  return (
    <Link className={`${styles.brand} ${isCompact ? styles.compact : ''}`} href="/" aria-label={`${title} home`}>
      {logo ? (
        <Image
          className={styles.logo}
          src={logo}
          alt={siteSettings?.logoLight?.alt || title}
          width={48}
          height={48}
          priority
        />
      ) : (
        <span className={styles.mark} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}

      <span className={styles.copy}>
        <strong>{title}</strong>
        <span>{tagline}</span>
      </span>
    </Link>
  )
}