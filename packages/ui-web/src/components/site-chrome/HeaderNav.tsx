'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import styles from './HeaderNav.module.css'
import { MegaMenu } from './MegaMenu'
import type { HeaderNavItem } from './types'

type HeaderNavProps = {
  items?: HeaderNavItem[] | null
}

export function HeaderNav({ items }: HeaderNavProps) {
  const safeItems = items ?? []
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openMenu(index: number) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    setActiveIndex(index)
  }

  function scheduleClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }

    closeTimerRef.current = setTimeout(() => {
      setActiveIndex(null)
    }, 180)
  }

  function closeNow() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    setActiveIndex(null)
  }

  if (safeItems.length === 0) return null

  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <div className={styles.navInner}>
        {safeItems.map((item, index) => {
          const columns = item.columns ?? []
          const hasMegaMenu = columns.length > 0 || Boolean(item.featured)
          const isActive = activeIndex === index
          const itemKey = item.id ?? item.label ?? `header-nav-item-${index}`

          return (
            <div
              key={itemKey}
              className={styles.navItem}
              onMouseEnter={() => openMenu(index)}
              onMouseLeave={scheduleClose}
              onFocus={() => openMenu(index)}
            >
              <Link
                href={item.href || '#'}
                className={styles.navLink}
                aria-haspopup={hasMegaMenu ? 'true' : undefined}
                aria-expanded={hasMegaMenu ? isActive : undefined}
                onClick={closeNow}
              >
                <span>{item.label ?? 'Untitled'}</span>
              </Link>

              {hasMegaMenu && isActive ? (
                <div
                  className={styles.megaWrap}
                  onMouseEnter={() => openMenu(index)}
                  onMouseLeave={scheduleClose}
                >
                  <MegaMenu item={item} onClose={closeNow} />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </nav>
  )
}