import Link from 'next/link'
import styles from './NewsTicker.module.css'
import type { NewsTickerArticle, NewsTickerSettings } from './types'

type NewsTickerProps = {
  settings?: NewsTickerSettings | null
  articles?: NewsTickerArticle[]
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function isValidInject(validUntil?: string | null) {
  if (!validUntil) return true
  return new Date(validUntil).getTime() > Date.now()
}

export function NewsTicker({ settings, articles = [], className }: NewsTickerProps) {
  const manualItems =
    settings?.manualInjects
      ?.filter((item) => item?.label && isValidInject(item.validUntil))
      .map((item) => ({
        id: item.id ?? item.label ?? 'manual',
        label: item.label ?? '',
        href: item.href || '/updates',
        eyebrow: item.isBreaking ? 'Breaking' : 'Update',
        accent: item.accentOverride ?? undefined,
      })) ?? []

  const tickerItems = [...manualItems, ...articles].filter((item) => item.label)

  if (!tickerItems.length) {
    return null
  }

  const label = settings?.defaultLabel || 'LATEST STORIES'
  const speed = settings?.scrollSpeed ?? 40
  const isCrisis = Boolean(settings?.isCrisisMode)

  const cssVars = {
    '--wn-ticker-duration': `${Math.max(12, speed)}s`,
    '--wn-crisis-bg': settings?.crisisPrimaryColor || '#ff0000',
    '--wn-crisis-text': settings?.crisisTextColor || '#ffffff',
  } as React.CSSProperties

  return (
    <section
      className={cx(styles.ticker, isCrisis && styles.crisis, className)}
      style={cssVars}
      aria-label="WaveNation latest stories ticker"
    >
      <div className={styles.label}>{label}</div>

      <div className={styles.viewport}>
        <div className={styles.track}>
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={item.href || '/news'}
              className={styles.item}
              style={item.accent ? ({ '--item-accent': item.accent } as React.CSSProperties) : undefined}
            >
              <span className={styles.dot} aria-hidden="true" />
              {item.eyebrow ? <span className={styles.eyebrow}>{item.eyebrow}</span> : null}
              <span className={styles.title}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}