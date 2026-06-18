import type { Metadata } from 'next'
import Link from 'next/link'
import { MusicSubmissionForm } from '@wavenation/ui-web'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Submit Music | WaveNation',
  description:
    'Submit clean music, links, press kit details, and artist information for WaveNation airplay consideration.',
}

export default function SubmitMusicPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Artist Submissions</p>
          <h1>Submit your music.</h1>
          <p>
            Send your music to WaveNation for airplay, editorial, playlist, interview, or creator
            spotlight consideration. Please submit links only for now.
          </p>

          <p className={styles.backupNotice}>
            If this form does not work, email{' '}
            <a href="mailto:wavenationfm@gmail.com">wavenationfm@gmail.com</a>.
          </p>
        </div>

        <aside className={styles.guidelines}>
          <p className={styles.eyebrow}>Before You Submit</p>

          <ul>
            <li>Use clean radio edits when available.</li>
            <li>Make sure all download and streaming links are public.</li>
            <li>Only submit music you own or are authorized to submit.</li>
            <li>Include artist socials, press kit links, and a short bio.</li>
          </ul>

          <Link href="/listen-live">Listen to WaveNation FM</Link>
        </aside>
      </section>

      <section className={styles.formSection}>
        <MusicSubmissionForm endpoint="/api/submit-music" />
      </section>
    </main>
  )
}