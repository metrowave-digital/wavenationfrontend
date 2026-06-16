'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, type MouseEvent } from 'react'
import styles from './ProfilePopup.module.css'

type ProfileUser = {
  name?: string | null
  email?: string | null
  imageUrl?: string | null
  initials?: string | null
  planLabel?: string | null
}

type ProfileQuickLink = {
  label: string
  href: string
  eyebrow?: string
  description?: string
}

type ProfilePopupProps = {
  isOpen: boolean
  onClose: () => void
  user?: ProfileUser | null
  isAuthenticated?: boolean
  loginHref?: string
  logoutHref?: string
  accountHref?: string
  plusHref?: string
  creatorHubHref?: string
  quickLinks?: ProfileQuickLink[]
}

const DEFAULT_QUICK_LINKS: ProfileQuickLink[] = [
  {
    eyebrow: 'Library',
    label: 'Saved Playlists',
    description: 'Keep your favorite mixes and music collections close.',
    href: '/account/playlists',
  },
  {
    eyebrow: 'Creators',
    label: 'Following',
    description: 'Track shows, artists, DJs, and creator channels.',
    href: '/account/following',
  },
]

function getInitials(user?: ProfileUser | null) {
  if (user?.initials) return user.initials.slice(0, 2).toUpperCase()

  const name = user?.name?.trim()

  if (!name) return 'WN'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ProfilePopup({
  isOpen,
  onClose,
  user,
  isAuthenticated = false,
  loginHref = '/api/auth/login',
  logoutHref = '/api/auth/logout',
  accountHref = '/account',
  plusHref = '/plus',
  creatorHubHref = '/creator-hub',
  quickLinks = DEFAULT_QUICK_LINKS,
}: ProfilePopupProps) {
  const titleId = useId()
  const descriptionId = useId()

  const panelRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const initials = useMemo(() => getInitials(user), [user])
  const displayName = user?.name?.trim() || 'WaveNation listener'
  const displayEmail = user?.email?.trim()
  const planLabel = user?.planLabel?.trim() || (isAuthenticated ? 'Free account' : 'Guest access')

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 50)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = originalOverflow
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusableElements = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements.length) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function onBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onBackdropMouseDown}>
      <section
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className={styles.glow} aria-hidden="true" />

        <button
          ref={closeButtonRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close profile menu"
        >
          <span aria-hidden="true">×</span>
        </button>

        <header className={styles.header}>
          <div className={styles.avatarWrap} aria-hidden="true">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" className={styles.avatarImage} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>

          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>WaveNation Account</p>
            <h2 id={titleId}>Your vibe, everywhere.</h2>
            <p id={descriptionId} className={styles.copy}>
              Sign in to save playlists, follow creators, manage your profile, and unlock
              WaveNation+ features.
            </p>
          </div>
        </header>

        <div className={styles.accountCard}>
          <div>
            <p className={styles.accountName}>{displayName}</p>
            {displayEmail && <p className={styles.accountEmail}>{displayEmail}</p>}
          </div>

          <span className={styles.planBadge}>{planLabel}</span>
        </div>

        <div className={styles.actions} aria-label="Account actions">
          {!isAuthenticated && (
            <Link className={styles.primaryAction} href={loginHref} onClick={onClose}>
              Sign in
            </Link>
          )}

          <Link className={styles.secondaryAction} href={accountHref} onClick={onClose}>
            My account
          </Link>

          <Link className={styles.secondaryAction} href={plusHref} onClick={onClose}>
            WaveNation+
          </Link>

          <Link className={styles.secondaryAction} href={creatorHubHref} onClick={onClose}>
            Creator Hub
          </Link>

          {isAuthenticated && (
            <Link className={styles.dangerAction} href={logoutHref} onClick={onClose}>
              Sign out
            </Link>
          )}
        </div>

        {quickLinks.length > 0 && (
          <div className={styles.quickLinks}>
            <p className={styles.sectionLabel}>Quick access</p>

            <div className={styles.quickGrid}>
              {quickLinks.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  className={styles.quickCard}
                  href={item.href}
                  onClick={onClose}
                >
                  {item.eyebrow && <span>{item.eyebrow}</span>}
                  <strong>{item.label}</strong>
                  {item.description && <small>{item.description}</small>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className={styles.footerNote}>
          One account for radio, TV, playlists, creator channels, and premium experiences.
        </p>
      </section>
    </div>
  )
}