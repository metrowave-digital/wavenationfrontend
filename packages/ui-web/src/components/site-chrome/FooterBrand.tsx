import Image from 'next/image'
import Link from 'next/link'
import styles from './FooterBrand.module.css'
import type { SiteSettings } from './types'

type FooterBrandProps = {
  siteSettings?: SiteSettings | null
}

export function FooterBrand({ siteSettings }: FooterBrandProps) {
  const title = siteSettings?.siteTitle || 'WaveNation'
  const tagline = siteSettings?.tagline || 'Amplify Your Vibe'
  const logo = siteSettings?.logoLight?.sizes?.thumb?.url || siteSettings?.logoLight?.url

  return (
    <Link href="/" className={styles.brand}>
      {logo ? (
        <Image src={logo} alt={siteSettings?.logoLight?.alt || title} width={58} height={58} className={styles.logo} />
      ) : null}

      <span>
        <strong>{title}</strong>
        <em>{tagline}</em>
      </span>
    </Link>
  )
}