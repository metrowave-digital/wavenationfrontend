'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './DynamicTicker.module.css'
import type { DynamicTickerConfig, DynamicTickerItem } from './types'

type DynamicTickerProps = {
  config?: DynamicTickerConfig | null
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function isActive(item: DynamicTickerItem) {
  const now = Date.now()
  const start = item.scheduledStart ? new Date(item.scheduledStart).getTime() : null
  const end = item.scheduledEnd ? new Date(item.scheduledEnd).getTime() : null

  if (start && now < start) return false
  if (end && now > end) return false

  return true
}

export function DynamicTicker({ config, className }: DynamicTickerProps) {
  const items = useMemo(() => (config?.items ?? []).filter((item) => item?.title && isActive(item)), [config])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, config?.displayDuration ?? 5000)

    return () => window.clearInterval(interval)
  }, [items.length, config?.displayDuration])

  if (!items.length) {
    return null
  }

  const item = items[index]
  const accent = item.accent || '#39ff14'

  return (
    <aside
      className={cx(styles.shell, className)}
      style={
        {
          '--dynamic-accent': accent,
          '--dynamic-transition': `${config?.transitionSpeed ?? 400}ms`,
        } as React.CSSProperties
      }
      aria-label="WaveNation live programming ticker"
    >
      <div className={styles.content}>
        <div className={styles.badge}>
          {item.isLive ? <span className={styles.liveDot} aria-hidden="true" /> : null}
          <span>{item.isLive ? 'Live Now' : item.status || 'On Deck'}</span>
        </div>

        {config?.showVisualizer ? (
          <div className={styles.visualizer} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}

        <div className={styles.copy}>
          <span className={styles.medium}>{item.medium || 'WaveNation'}</span>
          <strong className={styles.title}>{item.title}</strong>
          {item.subtext ? <span className={styles.subtext}>{item.subtext}</span> : null}
        </div>
      </div>
    </aside>
  )
}