import Link from 'next/link'
import { ScheduleList, ScheduleTabs } from '@wavenation/ui-web'
import {
  filterScheduleByView,
  getScheduleWindow,
  groupOccurrencesByDate,
  normalizeDisplayTimeZone,
  normalizeScheduleView,
} from '@/lib/wavenation-schedules'
import styles from '@/app/full-schedule/page.module.css'

type ProgrammingSchedulePageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

function withParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params)
  next.set(key, value)
  return `?${next.toString()}`
}

export async function ProgrammingSchedulePage({ searchParams = {} }: ProgrammingSchedulePageProps) {
  const displayZone = normalizeDisplayTimeZone(searchParams.tz)
  const view = normalizeScheduleView(searchParams.view)
  const schedule = await getScheduleWindow({ displayZone, days: 8 })
  const filtered = filterScheduleByView(schedule.allOccurrences, view)
  const grouped = groupOccurrencesByDate(filtered)
  const baseParams = new URLSearchParams()
  baseParams.set('tz', displayZone)

  const viewTabs = [
    { label: 'All', value: 'all' },
    { label: 'Radio', value: 'radio' },
    { label: 'TV', value: 'tv' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
  ].map((tab) => ({
    label: tab.label,
    href: withParam(baseParams, 'view', tab.value),
    active: view === tab.value,
  }))

  const zoneParams = new URLSearchParams()
  zoneParams.set('view', view)

  const zoneTabs = [
    { label: 'Eastern Time', href: withParam(zoneParams, 'tz', 'ET'), active: displayZone === 'ET' },
    { label: 'Central Time', href: withParam(zoneParams, 'tz', 'CT'), active: displayZone === 'CT' },
  ]

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>WaveNation Schedule</p>
        <h1>Full programming schedule.</h1>
        <p>
          Browse WaveNation FM radio and WaveNation One TV programming. Use the tabs to filter
          by radio, TV, today, or the full weekly view.
        </p>

        <div className={styles.heroActions}>
          <Link href="/listen-live">Listen Live</Link>
          <Link href="/watch">Watch Live</Link>
          <Link href="/submit-music">Submit Music</Link>
        </div>
      </section>

      <section className={styles.controls} aria-label="Schedule controls">
        <div>
          <p className={styles.eyebrow}>Filter</p>
          <ScheduleTabs tabs={viewTabs} />
        </div>

        <div>
          <p className={styles.eyebrow}>Time Zone</p>
          <ScheduleTabs tabs={zoneTabs} />
        </div>
      </section>

      <section className={styles.scheduleShell}>
        {grouped.length > 0 ? (
          grouped.map((group) => (
            <div className={styles.dayGroup} key={group.dateKey}>
              <div className={styles.dayHeader}>
                <p>{group.label}</p>
                <span>{group.items.length} program{group.items.length === 1 ? '' : 's'}</span>
              </div>
              <ScheduleList items={group.items} />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h2>No schedule entries found.</h2>
            <p>Add active radioSchedule or tvSchedule entries in the CMS, then refresh this page.</p>
          </div>
        )}
      </section>
    </main>
  )
}
