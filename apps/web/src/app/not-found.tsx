import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.code}>404</p>
        <h1>This wave drifted off signal.</h1>
        <p>
          The page you are looking for may have moved, been renamed, or never made it on air. Head back home or keep exploring the latest from WaveNation.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>Back Home</Link>
          <Link href="/news" className={styles.secondary}>Latest News</Link>
          <Link href="/listen" className={styles.secondary}>Listen Live</Link>
        </div>
      </section>
    </main>
  )
}
