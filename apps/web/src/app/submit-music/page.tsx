import type { Metadata } from 'next'
import Link from 'next/link'
import { MusicSubmissionForm } from '@wavenation/ui-web'
import { SubmitMusicAnalytics } from './SubmitMusicAnalytics'
import styles from './page.module.css'

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pagePath = '/submit-music'
const pageUrl = new URL(pagePath, siteBaseUrl).toString()

const pageTitle = 'Submit Music | WaveNation'
const pageDescription =
  'Submit clean music, streaming links, press kit details, and artist information for WaveNation FM airplay, playlist, editorial, interview, and creator spotlight consideration.'

const ogImageUrl = new URL('/images/og/submit-music.jpg', siteBaseUrl).toString()

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  keywords: [
    'submit music to WaveNation',
    'submit music for radio airplay',
    'independent artist submissions',
    'clean radio edits',
    'WaveNation FM',
    'urban radio submissions',
    'R&B submissions',
    'hip-hop submissions',
    'southern soul submissions',
    'gospel music submissions',
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Submit music to WaveNation for airplay and editorial consideration.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

const submitMusicJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${pageUrl}#webpage`,
  url: pageUrl,
  name: pageTitle,
  description: pageDescription,
  isPartOf: {
    '@type': 'WebSite',
    name: 'WaveNation',
    url: siteBaseUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'WaveNation Media',
    url: siteBaseUrl,
  },
  potentialAction: {
    '@type': 'CommunicateAction',
    name: 'Submit music for WaveNation consideration',
    target: pageUrl,
  },
}

export default function SubmitMusicPage() {
  return (
    <>
      <SubmitMusicAnalytics />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(submitMusicJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Artist Submissions</p>

            <h1>Submit your music.</h1>

            <p>
              Send your music to WaveNation for airplay, editorial, playlist, interview, or
              creator spotlight consideration. Please submit links only for now.
            </p>

            <p className={styles.backupNotice}>
              If this form does not work, email{' '}
              <a
                href="mailto:wavenationfm@gmail.com"
                data-analytics-event="submit_music_backup_email_click"
                data-analytics-label="Backup email"
              >
                wavenationfm@gmail.com
              </a>
              .
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

            <Link
              href="/listen-live"
              data-analytics-event="submit_music_listen_live_click"
              data-analytics-label="Listen to WaveNation FM"
            >
              Listen to WaveNation FM
            </Link>
          </aside>
        </section>

        <section className={styles.formSection} data-wn-submit-music-form>
          <MusicSubmissionForm endpoint="/api/submit-music" />
        </section>
      </main>
    </>
  )
}