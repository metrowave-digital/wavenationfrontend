import type { ReactNode } from 'react'
import styles from './WaveShell.module.css'

export type WaveShellProps = {
  children: ReactNode
}

export function WaveShell({ children }: WaveShellProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>WaveNation Frontend</p>
        <h1>Stream culture. Live 24/7.</h1>
        <p>
          The public frontend foundation for WaveNation web, mobile, and TV experiences.
        </p>
      </section>

      {children}
    </main>
  )
}