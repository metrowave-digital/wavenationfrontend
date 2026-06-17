import Link from 'next/link'
import type { LegalPageContent } from '../../lib/legal-pages'
import { legalConfig, legalPages } from '../../lib/legal-pages'
import styles from './LegalPage.module.css'

type LegalPageProps = {
  page: LegalPageContent
}

export function LegalPage({ page }: LegalPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <p className={styles.eyebrow}>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.lede}>{page.description}</p>
        <div className={styles.metaGrid} aria-label="Policy metadata">
          <span>
            <strong>Effective date</strong>
            {page.effectiveDate}
          </span>
          <span>
            <strong>Brand</strong>
            {legalConfig.companyName}
          </span>
          <span>
            <strong>Contact</strong>
            {legalConfig.supportEmail}
          </span>
        </div>
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Legal pages">
          <p className={styles.sidebarLabel}>Legal Center</p>
          <nav>
            {legalPages.map((item) => (
              <Link
                key={item.slug}
                href={item.slug}
                className={item.slug === page.slug ? styles.activeLink : styles.sideLink}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className={styles.article}>
          {page.sections.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h2>{section.heading}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </main>
  )
}
