// packages/ui-web/src/components/player/MobileDock.tsx

import Link from 'next/link'
import {
  RiHome5Line,
  RiNewspaperLine,
  RiPauseFill,
  RiPlayFill,
  RiTvLine,
  RiUser3Line,
} from 'react-icons/ri'
import styles from './MobileDock.module.css'

type MobileDockProps = {
  isPlaying: boolean
  homeHref?: string
  newsHref?: string
  watchHref?: string
  profileHref?: string
  onPlayToggle: () => void
}

export function MobileDock({
  isPlaying,
  homeHref = '/',
  newsHref = '/news',
  watchHref = '/watch',
  profileHref = '/api/auth/login',
  onPlayToggle,
}: MobileDockProps) {
  return (
    <nav className={styles.dock} aria-label="WaveNation mobile dock">
      <Link href={homeHref} className={styles.item}>
        <RiHome5Line aria-hidden="true" />
        <span>Home</span>
      </Link>

      <Link href={newsHref} className={styles.item}>
        <RiNewspaperLine aria-hidden="true" />
        <span>News</span>
      </Link>

      <button
        type="button"
        className={styles.playItem}
        onClick={onPlayToggle}
        aria-label={isPlaying ? 'Pause WaveNation FM' : 'Play WaveNation FM'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <RiPauseFill aria-hidden="true" /> : <RiPlayFill aria-hidden="true" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <Link href={watchHref} className={styles.item}>
        <RiTvLine aria-hidden="true" />
        <span>Watch</span>
      </Link>

      <Link href={profileHref} className={styles.item}>
        <RiUser3Line aria-hidden="true" />
        <span>Profile</span>
      </Link>
    </nav>
  )
}