import styles from './Watch.module.css'
import { WatchButtons } from './WatchButtons'
import type { WatchAccessState } from './types'

export function AccessGate({ access }: { access: WatchAccessState }) {
  if (!access.isLocked) return null

  return (
    <section className={styles.gate}>
      <p className={styles.eyebrow}>{access.label}</p>
      <h2>Unlock this experience</h2>
      <p className={styles.subtitle}>{access.message || 'This video requires a WaveNation+ membership, ticket, or pay-per-view unlock.'}</p>
      {access.priceDisplay ? <p className={styles.pill}>{access.priceDisplay}</p> : null}
      <WatchButtons
        actions={[
          { label: access.primaryLabel || 'Join WaveNation+', href: access.primaryHref || '/watch/plus', variant: 'primary' },
          { label: access.secondaryLabel || 'Sign in', href: access.secondaryHref || '/api/auth/login', variant: 'secondary' },
        ]}
      />
    </section>
  )
}
