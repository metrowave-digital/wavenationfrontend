import Link from 'next/link'
import styles from './MusicFilterTabs.module.css'
import type { MusicTab } from './types'

type MusicFilterTabsProps = {
  label: string
  tabs: MusicTab[]
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function MusicFilterTabs({ label, tabs, className }: MusicFilterTabsProps) {
  if (tabs.length === 0) return null

  return (
    <nav className={cx(styles.tabs, className)} aria-label={label}>
      {tabs.map((tab) => (
        <Link key={`${tab.label}-${tab.href}`} href={tab.href} className={tab.isActive ? styles.active : undefined}>
          <span>{tab.label}</span>
          {typeof tab.count === 'number' ? <strong>{tab.count}</strong> : null}
        </Link>
      ))}
    </nav>
  )
}
