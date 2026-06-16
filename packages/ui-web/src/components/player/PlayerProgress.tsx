// packages/ui-web/src/components/player/PlayerProgress.tsx

import type { PlayerStatus } from './playerTypes'
import styles from './PlayerProgress.module.css'

type PlayerProgressProps = {
  status: PlayerStatus
  isPlaying: boolean
  label?: string
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const BARS = Array.from({ length: 18 }, (_, index) => index)

export function PlayerProgress({
  status,
  isPlaying,
  label = 'Live stream signal',
  className,
}: PlayerProgressProps) {
  return (
    <div
      className={cx(styles.progress, isPlaying && styles.playing, className)}
      role="meter"
      aria-label={label}
      aria-valuetext={status === 'playing' ? 'Live stream playing' : 'Live stream paused'}
    >
      <div className={styles.rail}>
        <span className={styles.liveLine} />
        <div className={styles.bars} aria-hidden="true">
          {BARS.map((bar) => (
            <span key={bar} style={{ animationDelay: `${bar * 64}ms` }} />
          ))}
        </div>
      </div>

      <div className={styles.labels}>
        <span>{status === 'playing' ? 'Live signal active' : 'Live radio'}</span>
        <span>24/7</span>
      </div>
    </div>
  )
}