import styles from './Watch.module.css'
import type { WatchCardItem } from './types'
import { WatchCard } from './WatchCard'

export function WatchGrid({ items, emptyText = 'No video content is available yet.' }: { items: WatchCardItem[]; emptyText?: string }) {
  if (!items.length) return <div className={styles.empty}>{emptyText}</div>
  return <div className={styles.grid}>{items.map((item) => <WatchCard key={`${item.href || item.id}-${item.title}`} item={item} />)}</div>
}
