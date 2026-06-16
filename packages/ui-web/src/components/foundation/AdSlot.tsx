import type { ReactNode } from 'react'
import styles from './AdSlot.module.css'

export type AdSlotSize =
  | 'leaderboard'
  | 'billboard'
  | 'rectangle'
  | 'wideRectangle'
  | 'skyscraper'
  | 'mobileBanner'
  | 'fluid'

export type AdSlotProps = {
  id?: string
  label?: string
  size?: AdSlotSize
  children?: ReactNode
  isEmpty?: boolean
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function AdSlot({
  id,
  label = 'Advertisement',
  size = 'fluid',
  children,
  isEmpty = false,
  className,
}: AdSlotProps) {
  return (
    <aside
      id={id}
      className={cx(styles.adSlot, styles[size], isEmpty && styles.empty, className)}
      aria-label={label}
    >
      <span className={styles.label}>{label}</span>

      <div className={styles.inner}>
        {children || (
          <div className={styles.placeholder}>
            <strong>Ad Slot</strong>
            <span>{getSizeLabel(size)}</span>
          </div>
        )}
      </div>
    </aside>
  )
}

function getSizeLabel(size: AdSlotSize) {
  const labels: Record<AdSlotSize, string> = {
    leaderboard: '728 × 90',
    billboard: '970 × 250',
    rectangle: '300 × 250',
    wideRectangle: '336 × 280',
    skyscraper: '160 × 600',
    mobileBanner: '320 × 50',
    fluid: 'Responsive',
  }

  return labels[size]
}