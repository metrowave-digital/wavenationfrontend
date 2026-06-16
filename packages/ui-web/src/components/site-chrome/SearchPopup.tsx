'use client'

import {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import styles from './SearchPopup.module.css'

type SearchSuggestion = {
  label: string
  href: string
  eyebrow?: string
}

type SearchPopupProps = {
  isOpen: boolean
  onClose: () => void
  searchPath?: string
  placeholder?: string
  suggestions?: SearchSuggestion[]
  quickTerms?: string[]
}

const DEFAULT_QUICK_TERMS = [
  'Music',
  'Southern Soul',
  'Culture',
  'Playlists',
  'Creators',
  'WaveNation TV',
]

const DEFAULT_SUGGESTIONS: SearchSuggestion[] = [
  {
    eyebrow: 'Radio',
    label: 'Listen to WaveNation FM',
    href: '/listen',
  },
  {
    eyebrow: 'Watch',
    label: 'Watch WaveNation One',
    href: '/watch',
  },
  {
    eyebrow: 'News',
    label: 'Latest music and culture stories',
    href: '/news',
  },
]

export function SearchPopup({
  isOpen,
  onClose,
  searchPath = '/search',
  placeholder = 'Search music, culture, news, shows...',
  suggestions = DEFAULT_SUGGESTIONS,
  quickTerms = DEFAULT_QUICK_TERMS,
}: SearchPopupProps) {
  const router = useRouter()
  const titleId = useId()
  const descriptionId = useId()
  const inputId = useId()

  const panelRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const [query, setQuery] = useState('')

  const trimmedQuery = query.trim()
  const canSearch = trimmedQuery.length > 0

  const visibleSuggestions = useMemo(
    () => suggestions.filter((item) => item.label && item.href).slice(0, 4),
    [suggestions],
  )

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 50)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = originalOverflow
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusableElements = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  function submitSearch(value: string) {
    const nextQuery = value.trim()
    if (!nextQuery) return

    const params = new URLSearchParams({ q: nextQuery })
    router.push(`${searchPath}?${params.toString()}`)
    onClose()
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitSearch(query)
  }

  function onBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  function onQuickTermClick(term: string) {
    setQuery(term)
    submitSearch(term)
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
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

        <button type="button" className={styles.close} onClick={onClose} aria-label="Close search">
          <span aria-hidden="true">×</span>
        </button>

        <div className={styles.header}>
          <p className={styles.eyebrow}>Search WaveNation</p>
          <h2 id={titleId}>Find your next wave.</h2>
          <p id={descriptionId} className={styles.description}>
            Search stories, artists, playlists, shows, creators, videos, and culture coverage.
          </p>
        </div>

        <form className={styles.form} onSubmit={onSubmit} role="search">
          <label className={styles.label} htmlFor={inputId}>
            Search query
          </label>

          <div className={styles.inputWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M10.8 3.5a7.3 7.3 0 0 1 5.78 11.75l3.58 3.58a1 1 0 0 1-1.42 1.42l-3.58-3.58A7.3 7.3 0 1 1 10.8 3.5Zm0 2a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6Z" />
              </svg>
            </span>

            <input
              id={inputId}
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
            />

            {query.length > 0 ? (
              <button
                type="button"
                className={styles.clear}
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label="Clear search"
              >
                Clear
              </button>
            ) : null}
          </div>

          <button type="submit" className={styles.submit} disabled={!canSearch}>
            Search
          </button>
        </form>

        <div className={styles.quickArea} aria-label="Popular searches">
          <p className={styles.sectionLabel}>Popular searches</p>

          <div className={styles.quickTerms}>
            {quickTerms.map((term) => (
              <button
                key={term}
                type="button"
                className={styles.quickTerm}
                onClick={() => onQuickTermClick(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {visibleSuggestions.length > 0 && (
  <div className={styles.suggestions} aria-label="Suggested destinations">
    <p className={styles.sectionLabel}>Quick links</p>

    <div className={styles.suggestionGrid}>
      {visibleSuggestions.map((item) => (
        <a
          key={`${item.label}-${item.href}`}
          className={styles.suggestionCard}
          href={item.href}
        >
          {item.eyebrow && <span>{item.eyebrow}</span>}
          <strong>{item.label}</strong>
        </a>
      ))}
    </div>
  </div>
)}
      </section>
    </div>
  )
}