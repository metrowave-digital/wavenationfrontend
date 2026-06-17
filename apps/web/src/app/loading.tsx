import styles from './loading.module.css'

export default function Loading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading WaveNation content">
      <div className={styles.visualizer} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <p>Amplifying your vibe...</p>
    </main>
  )
}
