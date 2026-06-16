'use client'

import Link from 'next/link'
import styles from './MegaMenu.module.css'
import type { HeaderNavItem } from './types'

type MegaMenuProps = {
  item?: HeaderNavItem | null
  onClose?: () => void
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function getAccentClass(accent?: string | null) {
  switch (accent) {
    case 'magenta':
      return styles.accentMagenta
    case 'green':
      return styles.accentGreen
    case 'news':
      return styles.accentNews
    case 'brand':
      return styles.accentBrand
    case 'blue':
    default:
      return styles.accentBlue
  }
}

export function MegaMenu({ item, onClose }: MegaMenuProps) {
  if (!item) return null

  const columns = item.columns ?? []
  const featured = item.featured ?? null
  const hasColumns = columns.length > 0
  const hasFeatured =
    Boolean(featured?.eyebrow) ||
    Boolean(featured?.title) ||
    Boolean(featured?.description) ||
    Boolean(featured?.href)

  if (!hasColumns && !hasFeatured) return null

  return (
    <div className={styles.menu} role="menu" aria-label={`${item.label ?? 'Navigation'} menu`}>
      <div className={styles.inner}>
        {hasFeatured ? (
          <div className={cx(styles.featured, getAccentClass(featured?.accent))}>
            {featured?.eyebrow ? <p className={styles.eyebrow}>{featured.eyebrow}</p> : null}

            {featured?.href ? (
              <Link href={featured.href} onClick={onClose} className={styles.featuredTitle}>
                {featured?.title ?? item.label ?? 'Featured'}
              </Link>
            ) : featured?.title ? (
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
            ) : null}

            {featured?.description ? (
              <p className={styles.featuredDescription}>{featured.description}</p>
            ) : null}
          </div>
        ) : null}

        {hasColumns ? (
          <div className={styles.columns}>
            {columns.map((column, columnIndex) => {
              const links = column.links ?? []
              const columnKey =
                column.id ?? column.label ?? `${item.id ?? item.label ?? 'mega'}-column-${columnIndex}`

              return (
                <section key={columnKey} className={styles.column}>
                  {column.label ? <h3 className={styles.columnTitle}>{column.label}</h3> : null}

                  {links.length > 0 ? (
                    <div className={styles.linkList}>
                      {links.map((link, linkIndex) => {
                        const linkKey = link.id ?? link.label ?? `${columnKey}-link-${linkIndex}`

                        if (!link.label || !link.href) return null

                        return (
                          <Link
                            key={linkKey}
                            href={link.href}
                            onClick={onClose}
                            className={styles.link}
                            role="menuitem"
                          >
                            <span>{link.label}</span>

                            {link.badge && link.badge !== 'none' ? (
                              <span className={styles.badge}>{link.badge}</span>
                            ) : null}
                          </Link>
                        )
                      })}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}