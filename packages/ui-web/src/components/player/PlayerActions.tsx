// packages/ui-web/src/components/player/PlayerActions.tsx

import {
  RiArrowUpSLine,
  RiPauseFill,
  RiPlayFill,
  RiRefreshLine,
  RiShareLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from 'react-icons/ri'
import styles from './PlayerActions.module.css'

type PlayerActionsProps = {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  disabled?: boolean
  compact?: boolean
  onPlayToggle: () => void
  onMuteToggle: () => void
  onVolumeChange: (volume: number) => void
  onOpenPopup: () => void
  onReload: () => void
  onShare: () => void
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function PlayerActions({
  isPlaying,
  isMuted,
  volume,
  disabled = false,
  compact = false,
  onPlayToggle,
  onMuteToggle,
  onVolumeChange,
  onOpenPopup,
  onReload,
  onShare,
  className,
}: PlayerActionsProps) {
  return (
    <div className={cx(styles.actions, compact && styles.compact, className)}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={onReload}
        disabled={disabled}
        aria-label="Reload live stream"
      >
        <RiRefreshLine aria-hidden="true" />
      </button>

      <button
        type="button"
        className={cx(styles.playButton, isPlaying && styles.isPlaying)}
        onClick={onPlayToggle}
        disabled={disabled}
        aria-label={isPlaying ? 'Pause WaveNation FM' : 'Play WaveNation FM'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <RiPauseFill aria-hidden="true" /> : <RiPlayFill aria-hidden="true" />}
      </button>

      <div className={styles.volumeGroup}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onMuteToggle}
          disabled={disabled}
          aria-label={isMuted ? 'Unmute player' : 'Mute player'}
          aria-pressed={isMuted}
        >
          {isMuted || volume === 0 ? (
            <RiVolumeMuteLine aria-hidden="true" />
          ) : (
            <RiVolumeUpLine aria-hidden="true" />
          )}
        </button>

        <label className={styles.volumeLabel}>
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
            disabled={disabled}
            aria-label="Player volume"
          />
        </label>
      </div>

      <button
        type="button"
        className={styles.iconButton}
        onClick={onShare}
        disabled={disabled}
        aria-label="Share WaveNation FM"
      >
        <RiShareLine aria-hidden="true" />
      </button>

      <button
        type="button"
        className={styles.expandButton}
        onClick={onOpenPopup}
        aria-label="Open full player"
      >
        <RiArrowUpSLine aria-hidden="true" />
        <span>Open</span>
      </button>
    </div>
  )
}