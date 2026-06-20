import Link from 'next/link'
import styles from './Watch.module.css'
import { cx } from './utils'
import type { WatchLink } from './types'

export function WatchButtons({ actions = [] }: { actions?: WatchLink[] }) {
  if (!actions.length) return null

  return (
    <div className={styles.actions}>
      {actions.map((action) => (
        <Link
          key={`${action.href}-${action.label}`}
          href={action.href}
          className={cx(styles.button, styles[action.variant || 'secondary'])}
        >
          {action.label}
        </Link>
      ))}
    </div>
  )
}
