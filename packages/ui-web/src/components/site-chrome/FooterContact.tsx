import styles from './FooterContact.module.css'
import type { SiteSettings } from './types'

type FooterContactProps = {
  siteSettings?: SiteSettings | null
}

export function FooterContact({ siteSettings }: FooterContactProps) {
  return (
    <address className={styles.contact}>
      {siteSettings?.address ? <span>{siteSettings.address}</span> : null}
      {siteSettings?.phone ? <a href={`tel:${siteSettings.phone.replace(/[^\d+]/g, '')}`}>{siteSettings.phone}</a> : null}
      {siteSettings?.email ? <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a> : null}
    </address>
  )
}