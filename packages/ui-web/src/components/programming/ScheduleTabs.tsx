import Link from 'next/link'
import type { ScheduleTab } from './types'
import styles from './ScheduleTabs.module.css'

type ScheduleTabsProps = {
  tabs: ScheduleTab[]
}

export function ScheduleTabs({ tabs }: ScheduleTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="Schedule tabs">
      {tabs.map((tab) => (
        <Link key={tab.href} className={tab.active ? styles.active : undefined} href={tab.href}>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
