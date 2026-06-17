'use client'

import { useEffect } from 'react'
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

function getSafeHref(href?: string | null) {
  return href && href.trim().length > 0 ? href : '#'
}

export function MobileMenu({ isOpen, onClose, siteSettings, items }: MobileMenuProps) {
  const safeItems = items ?? []

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.top}>
          <HeaderBrand siteSettings={siteSettings} />

          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className={styles.intro}>
          <p className={styles.eyebrow}>Menu</p>
          <h2 id="mobile-navigation-title">Explore WaveNation</h2>
        </div>

        <nav className={styles.nav} aria-label="Mobile primary navigation">
          {safeItems.length > 0 ? (
            safeItems.map((item, itemIndex) => {
              const columns = item.columns ?? []
              const itemKey = item.id ?? item.label ?? `mobile-nav-item-${itemIndex}`

              return (
                <section key={itemKey} className={styles.group}>
                  <Link href={getSafeHref(item.href)} onClick={onClose} className={styles.mainLink}>
                    <span>{item.label ?? 'Untitled'}</span>
                    <span aria-hidden="true" className={styles.mainLinkArrow}>
                      →
                    </span>
                  </Link>

                  {columns.length > 0 ? (
                    <div className={styles.columns}>
                      {columns.map((column, columnIndex) => {
                        const links = column.links ?? []
                        const columnKey = column.id ?? column.label ?? `${itemKey}-column-${columnIndex}`

                        return (
                          <div key={columnKey} className={styles.column}>
                            {column.label ? <p className={styles.columnTitle}>{column.label}</p> : null}

                            {links.length > 0 ? (
                              <div className={styles.linkList}>
                                {links.map((link, linkIndex) => {
                                  const linkKey = link.id ?? link.label ?? `${columnKey}-link-${linkIndex}`

                                  return (
                                    <Link
                                      key={linkKey}
                                      href={getSafeHref(link.href)}
                                      onClick={onClose}
                                      className={styles.subLink}
                                    >
                                      <span>{link.label ?? 'Untitled'}</span>
                                      {link.badge ? <span className={styles.badge}>{link.badge}</span> : null}
                                    </Link>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </section>
              )
            })
          ) : (
            <div className={styles.emptyState}>
              <p>Navigation is loading.</p>
              <Link href="/" onClick={onClose}>
                Go home
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </div>
  )
}