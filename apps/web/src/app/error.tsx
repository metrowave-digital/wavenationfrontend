'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './error.module.css'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('WaveNation route error:', error)
  }, [error])

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Signal Error</p>
        <h1>Something interrupted the stream.</h1>
        <p>
          The page hit a temporary issue. Try again, return home, or keep listening while we reconnect the experience.
        </p>
        {error.digest ? <small>Error digest: {error.digest}</small> : null}
        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.primary}>Try Again</button>
          <Link href="/" className={styles.secondary}>Back Home</Link>
        </div>
      </section>
    </main>
  )
}
