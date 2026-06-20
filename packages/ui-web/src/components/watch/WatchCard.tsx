import Link from 'next/link'
import styles from './Watch.module.css'
import type { WatchCardItem } from './types'
import { cx } from './utils'

export function WatchCard({ item, as = 'link' }: { item: WatchCardItem; as?: 'link' | 'article' }) {
  const content = (
    <>
      {item.badge || item.isLive ? <span className={styles.badge}>{item.isLive ? 'Live' : item.badge}</span> : null}
      {item.locked ? <span className={cx(styles.badge, styles.lockedBadge)}>Locked</span> : null}
      <div className={styles.cardMedia}>
        {item.image?.url ? (
          <img className={styles.cardImage} src={item.image.url} alt={item.image.alt || item.title} />
        ) : (
          <div className={styles.cardFallback} />
        )}
      </div>
      <div className={styles.cardBody}>
        {item.eyebrow ? <p className={styles.eyebrow}>{item.eyebrow}</p> : null}
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.description ? <p className={styles.cardText}>{item.description}</p> : null}
        {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
      </div>
    </>
  )

  if (as === 'article' || !item.href) return <article className={styles.card}>{content}</article>
  return <Link className={styles.card} href={item.href}>{content}</Link>
}
