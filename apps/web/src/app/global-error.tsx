'use client'

import './globals.css'
import styles from './global-error.module.css'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error('WaveNation global error:', error)

  return (
    <html lang="en">
      <body>
        <main className={styles.page}>
          <section className={styles.panel}>
            <p className={styles.eyebrow}>Critical Signal Drop</p>
            <h1>WaveNation needs a quick reset.</h1>
            <p>
              A system-level issue stopped this page from loading. Refresh the experience and try again.
            </p>
            {error.digest ? <small>Error digest: {error.digest}</small> : null}
            <button type="button" onClick={reset}>Reset Experience</button>
          </section>
        </main>
      </body>
    </html>
  )
}
