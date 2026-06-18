import type { ProgrammingOccurrence } from './types'
import { ScheduleCard } from './ScheduleCard'
import styles from './ScheduleList.module.css'

type ScheduleListProps = {
  items: ProgrammingOccurrence[]
  emptyTitle?: string
  emptyText?: string
  compact?: boolean
}

export function ScheduleList({
  items,
  emptyTitle = 'No schedule entries found.',
  emptyText = 'Check back soon for updated WaveNation programming.',
  compact = false,
}: ScheduleListProps) {
  if (!items.length) {
    return (
      <div className={styles.empty}>
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ScheduleCard key={item.occurrenceId} item={item} compact={compact} />
      ))}
    </div>
  )
}
