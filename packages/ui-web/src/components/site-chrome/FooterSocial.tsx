import Link from 'next/link'
import styles from './FooterSocial.module.css'
import type { SiteSettings } from './types'

type FooterSocialProps = {
  siteSettings?: SiteSettings | null
}

export function FooterSocial({ siteSettings }: FooterSocialProps) {
  const links = [
    ['Instagram', siteSettings?.instagramUrl],
    ['X', siteSettings?.twitterUrl],
    ['YouTube', siteSettings?.youtubeUrl],
    ['TikTok', siteSettings?.tiktokUrl],
    ['Facebook', siteSettings?.facebookUrl],
  ].filter(([, href]) => href)

  if (!links.length) return null

  return (
    <nav className={styles.social} aria-label="Social links">
      {links.map(([label, href]) => (
        <Link key={label} href={href || '#'} target="_blank" rel="noreferrer">
          {label}
        </Link>
      ))}
    </nav>
  )
}