import styles from './ChartTable.module.css'
import type { ChartEntrySummary } from './types'

type ChartTableProps = {
  entries: ChartEntrySummary[]
  emptyText?: string
}

function movementLabel(entry: ChartEntrySummary) {
  switch (entry.movementDirection) {
    case 'new':
      return 'New'
    case 're_entry':
      return 'Re-Entry'
    case 'up':
      return entry.movementValue ? `Up ${entry.movementValue}` : 'Up'
    case 'down':
      return entry.movementValue ? `Down ${entry.movementValue}` : 'Down'
    case 'drop_off':
      return 'Drop-Off'
    default:
      return 'Same'
  }
}

function movementClass(entry: ChartEntrySummary) {
  switch (entry.movementDirection) {
    case 'new':
    case 're_entry':
      return styles.new
    case 'up':
      return styles.up
    case 'down':
    case 'drop_off':
      return styles.down
    default:
      return styles.same
  }
}

function badgeLabels(entry: ChartEntrySummary) {
  return [
    entry.badgeLabel,
    entry.isNewEntry ? 'New Entry' : undefined,
    entry.isReEntry ? 'Re-Entry' : undefined,
    entry.isIndieSpotlight ? 'Indie Spotlight' : undefined,
    entry.isPremiere ? 'Premiere' : undefined,
    entry.isStaffPick ? 'Staff Pick' : undefined,
  ].filter((badge): badge is string => Boolean(badge))
}

export function ChartTable({ entries, emptyText = 'Chart entries will appear here once the chart is published.' }: ChartTableProps) {
  if (entries.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>
  }

  return (
    <ol className={styles.table}>
      {entries.map((entry, index) => {
        const position = entry.position ?? index + 1
        const badges = badgeLabels(entry)

        return (
          <li key={`${entry.id ?? position}-${entry.title}-${index}`} className={styles.row}>
            <div className={styles.rank}>
              <span>{position}</span>
              <strong className={movementClass(entry)}>{movementLabel(entry)}</strong>
            </div>

            <div className={styles.artwork}>
              {entry.artwork?.url ? <img src={entry.artwork.url} alt={entry.artwork.alt || entry.title} loading="lazy" /> : <span />}
            </div>

            <div className={styles.main}>
              <h3>{entry.title}</h3>
              <p>{entry.artistName || 'WaveNation Music Team'}</p>
              {entry.publicNote ? <p className={styles.note}>{entry.publicNote}</p> : null}
              {badges.length > 0 ? (
                <div className={styles.badges}>
                  {badges.map((badge) => (
                    <span key={badge}>{badge}</span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.stats}>
              <div>
                <span>Last</span>
                <strong>{entry.lastWeekPosition ?? '—'}</strong>
              </div>
              <div>
                <span>Peak</span>
                <strong>{entry.peakPosition ?? position}</strong>
              </div>
              <div>
                <span>Weeks</span>
                <strong>{entry.weeksOnChart ?? '—'}</strong>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
