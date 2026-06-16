import styles from './Footer.module.css'
import { FooterBrand } from './FooterBrand'
import { FooterContact } from './FooterContact'
import { FooterNav } from './FooterNav'
import { FooterSocial } from './FooterSocial'
import { FooterLegal } from './FooterLegal'
import type { FooterConfig, SiteSettings } from './types'

type FooterProps = {
  siteSettings?: SiteSettings | null
  footerConfig?: FooterConfig | null
}

export function Footer({ siteSettings, footerConfig }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandColumn}>
          <FooterBrand siteSettings={siteSettings} />
          <FooterContact siteSettings={siteSettings} />
          <FooterSocial siteSettings={siteSettings} />
        </div>

        <FooterNav columns={footerConfig?.columns ?? []} />
      </div>

      <FooterLegal links={footerConfig?.legalLinks ?? []} />
    </footer>
  )
}