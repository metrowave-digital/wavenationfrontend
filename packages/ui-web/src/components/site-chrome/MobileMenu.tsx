'use client'

import Link from 'next/link'
import styles from './MobileMenu.module.css'
import { HeaderBrand } from './HeaderBrand'
import type { HeaderNavItem, SiteSettings } from './types'

type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
  siteSettings?: SiteSettings | null
  items?: HeaderNavItem[] | null
}

export function MobileMenu({ isOpen, onClose, siteSettings, items }: MobileMenuProps) {
  const safeItems = items ?? []

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.top}>
          <HeaderBrand siteSettings={siteSettings} />

          <button type="button" onClick={onClose} aria-label="Close menu">
            ×
          </button>
        </div>

        <nav className={styles.nav} aria-label="Mobile primary navigation">
          {safeItems.map((item, itemIndex) => {
            const columns = item.columns ?? []
            const itemKey = item.id ?? item.label ?? `mobile-nav-item-${itemIndex}`

            return (
              <section key={itemKey} className={styles.group}>
                <Link href={item.href || '#'} onClick={onClose} className={styles.mainLink}>
                  {item.label ?? 'Untitled'}
                </Link>

                {columns.length > 0 ? (
                  <div className={styles.columns}>
                    {columns.map((column, columnIndex) => {
                      const links = column.links ?? []
                      const columnKey =
                        column.id ?? column.label ?? `${itemKey}-column-${columnIndex}`

                      return (
                        <div key={columnKey}>
                          {column.label ? <p>{column.label}</p> : null}

                          {links.length > 0
                            ? links.map((link, linkIndex) => {
                                const linkKey =
                                  link.id ?? link.label ?? `${columnKey}-link-${linkIndex}`

                                return (
                                  <Link
                                    key={linkKey}
                                    href={link.href || '#'}
                                    onClick={onClose}
                                  >
                                    {link.label ?? ''}
                                  </Link>
                                )
                              })
                            : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}