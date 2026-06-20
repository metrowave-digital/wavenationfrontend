'use client'

import {
  RiCloudy2Line,
  RiMenu3Line,
  RiSearch2Line,
  RiUser3Line,
} from 'react-icons/ri'
import styles from './HeaderActions.module.css'

type HeaderActionsProps = {
  onSearch: () => void
  onWeather: () => void
  onProfile: () => void
  onMenu: () => void
}

export function HeaderActions({
  onSearch,
  onWeather,
  onProfile,
  onMenu,
}: HeaderActionsProps) {
  return (
    <div className={styles.actions} aria-label="Header actions">
      <button
        type="button"
        className={styles.iconButton}
        onClick={onSearch}
        aria-label="Open search"
      >
        <RiSearch2Line className={styles.icon} aria-hidden="true" />
      </button>

      <button
        type="button"
        className={styles.weatherButton}
        onClick={onWeather}
        aria-label="Open weather"
      >
        <span className={styles.weatherIconWrap} aria-hidden="true">
          <RiCloudy2Line className={styles.weatherIcon} />
        </span>

        <span className={styles.weatherCopy}>
          <span>Weather</span>
          <strong>TN / NC</strong>
        </span>
      </button>

      <button
        type="button"
        className={`${styles.iconButton} ${styles.profileButton}`}
        onClick={onProfile}
        aria-label="Open profile"
      >
        <RiUser3Line className={styles.icon} aria-hidden="true" />
      </button>

      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenu}
        aria-label="Open menu"
      >
        <RiMenu3Line className={styles.menuIcon} aria-hidden="true" />
      </button>
    </div>
  )
}