'use client'

import { useEffect, useId, useMemo, useRef, type MouseEvent } from 'react'
import styles from './WeatherPopup.module.css'
import type { WeatherSnapshot } from './types'

type WeatherMood = 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'wind' | 'default'

type EnhancedWeatherSnapshot = WeatherSnapshot & {
  feelsLike?: string
  humidity?: string
  wind?: string
  uvIndex?: string
  visibility?: string
  updatedAt?: string
  provider?: string
  alert?: string
}

type WeatherMarketLink = {
  label: string
  href: string
  eyebrow?: string
}

type WeatherPopupProps = {
  isOpen: boolean
  onClose: () => void
  weather?: EnhancedWeatherSnapshot | null
  marketLinks?: WeatherMarketLink[]
}

const FALLBACK_WEATHER: EnhancedWeatherSnapshot = {
  city: 'Nashville, TN / Charlotte, NC',
  temperature: '--',
  condition: 'Weather provider not connected yet',
  highLow: 'Add provider in apps/web',
  details: 'This panel is ready for a weather API or CMS-fed weather snapshot.',
  provider: 'CMS ready',
  wind: '--',
  humidity: '--',
  feelsLike: '--',
}

const DEFAULT_MARKET_LINKS: WeatherMarketLink[] = [
  {
    eyebrow: 'TN',
    label: 'Nashville',
    href: '/weather/nashville',
  },
  {
    eyebrow: 'NC',
    label: 'Charlotte',
    href: '/weather/charlotte',
  },
]

function getWeatherMood(condition?: string): WeatherMood {
  const value = condition?.toLowerCase() ?? ''

  if (value.includes('storm') || value.includes('thunder')) return 'storm'
  if (value.includes('rain') || value.includes('shower')) return 'rain'
  if (value.includes('snow') || value.includes('ice')) return 'snow'
  if (value.includes('wind')) return 'wind'
  if (value.includes('cloud') || value.includes('overcast')) return 'cloud'
  if (value.includes('sun') || value.includes('clear')) return 'sun'

  return 'default'
}

function formatUpdatedAt(value?: string) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function WeatherGlyph({ mood }: { mood: WeatherMood }) {
  if (mood === 'rain') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M17 31h18a9 9 0 0 0 1.3-17.9A13.5 13.5 0 0 0 10.2 18 6.7 6.7 0 0 0 17 31Z" />
        <path d="M17 37l-2 5M25 37l-2 5M33 37l-2 5" />
      </svg>
    )
  }

  if (mood === 'storm') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M17 29h18a8.5 8.5 0 0 0 1.1-16.9A13 13 0 0 0 10.8 17 6.5 6.5 0 0 0 17 29Z" />
        <path d="M25 30l-5 9h6l-3 7 9-11h-6l4-5h-5Z" />
      </svg>
    )
  }

  if (mood === 'cloud') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M15.5 33h20a9.5 9.5 0 0 0 1.2-18.9A14.2 14.2 0 0 0 9.6 19.2 7 7 0 0 0 15.5 33Z" />
      </svg>
    )
  }

  if (mood === 'snow') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M17 29h18a8.5 8.5 0 0 0 1.1-16.9A13 13 0 0 0 10.8 17 6.5 6.5 0 0 0 17 29Z" />
        <path d="M18 38h.1M24 41h.1M31 37h.1" />
      </svg>
    )
  }

  if (mood === 'wind') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M7 18h23a5 5 0 1 0-5-5M10 25h28a5 5 0 1 1-5 5M7 32h17" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 15a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4.2 4.2M33.8 33.8 38 38M38 10l-4.2 4.2M14.2 33.8 10 38" />
    </svg>
  )
}

export function WeatherPopup({
  isOpen,
  onClose,
  weather,
  marketLinks = DEFAULT_MARKET_LINKS,
}: WeatherPopupProps) {
  const titleId = useId()
  const descriptionId = useId()

  const panelRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const data: EnhancedWeatherSnapshot = weather ?? FALLBACK_WEATHER
  const weatherMood = useMemo(() => getWeatherMood(data.condition), [data.condition])
  const updatedLabel = useMemo(() => formatUpdatedAt(data.updatedAt), [data.updatedAt])

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
          aria-label="Close weather"
        >
          <span aria-hidden="true">×</span>
        </button>

        <header className={styles.header}>
          <div className={styles.moodRow}>
            <span className={styles.weatherIcon} data-mood={weatherMood}>
              <WeatherGlyph mood={weatherMood} />
            </span>

            <div>
              <p className={styles.eyebrow}>Weather</p>
              <p className={styles.provider}>{data.provider ?? 'Live snapshot'}</p>
            </div>
          </div>

          <h2 id={titleId}>{data.city}</h2>
        </header>

        <div className={styles.tempBlock} id={descriptionId}>
          <div className={styles.temp}>{data.temperature}</div>
          <div>
            <p className={styles.condition}>{data.condition}</p>
            <p className={styles.meta}>{data.highLow}</p>
          </div>
        </div>

        <div className={styles.metaGrid} aria-label="Weather details">
          <div className={styles.metaItem}>
            <span>Feels like</span>
            <strong>{data.feelsLike ?? '--'}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>Wind</span>
            <strong>{data.wind ?? '--'}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>Humidity</span>
            <strong>{data.humidity ?? '--'}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>UV index</span>
            <strong>{data.uvIndex ?? '--'}</strong>
          </div>

          {data.visibility && (
            <div className={styles.metaItem}>
              <span>Visibility</span>
              <strong>{data.visibility}</strong>
            </div>
          )}
        </div>

        <p className={styles.details}>{data.details}</p>

        {data.alert && (
          <div className={styles.alert} role="status">
            <strong>Weather alert</strong>
            <span>{data.alert}</span>
          </div>
        )}

        {marketLinks.length > 0 && (
          <div className={styles.markets}>
            <p className={styles.sectionLabel}>Coverage markets</p>

            <div className={styles.marketList}>
              {marketLinks.map((market) => (
                <a key={`${market.label}-${market.href}`} className={styles.marketLink} href={market.href}>
                  {market.eyebrow && <span>{market.eyebrow}</span>}
                  <strong>{market.label}</strong>
                </a>
              ))}
            </div>
          </div>
        )}

        {updatedLabel && <p className={styles.updatedAt}>Updated {updatedLabel}</p>}
      </section>
    </div>
  )
}