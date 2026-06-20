import type { Metadata } from 'next'
import Link from 'next/link'
import { ListenLivePanel, ScheduleList, ScheduleTabs } from '@wavenation/ui-web'
import { RouteAnalytics } from '../components/RouteAnalytics'
import {
  getScheduleWindow,
  normalizeDisplayTimeZone,
  type DisplayTimeZone,
} from '@/lib/wavenation-schedules'
import styles from './page.module.css'

export const revalidate = 300

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pagePath = '/listen-live'
const pageUrl = new URL(pagePath, siteBaseUrl).toString()

const pageTitle = 'Listen Live | WaveNation FM'
const pageDescription =
  'Listen to WaveNation FM live, stream the radio station in real time, and see what shows are coming up over the next 48 hours.'

const ogImageUrl = new URL('/images/og/listen-live.jpg', siteBaseUrl).toString()
const defaultPlayerImageUrl = '/images/wavenation-player-default.jpg'

const streamUrl =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_URL ||
  'https://streaming.live365.com/a49099'

const streamType =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_TYPE || 'audio/mpeg'

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
    'listen live',
    'WaveNation FM',
    'WaveNation radio',
    'live radio stream',
    'urban radio',
    'R&B radio',
    'hip-hop radio',
    'southern soul radio',
    'gospel radio',
    'online radio station',
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
        alt: 'Listen live to WaveNation FM.',
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

function timezoneHref(zone: DisplayTimeZone) {
  return `/listen-live?tz=${zone}`
}

const listenLiveJsonLd = {
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
  mainEntity: {
    '@type': 'RadioStation',
    name: 'WaveNation FM',
    url: pageUrl,
    broadcastFrequency: 'Online',
    areaServed: 'United States',
    slogan: 'AMPLIFY YOUR VIBE',
  },
  potentialAction: {
    '@type': 'ListenAction',
    name: 'Listen to WaveNation FM live',
    target: pageUrl,
  },
}

export default async function ListenLivePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}

  const displayZone = normalizeDisplayTimeZone(params.tz)
  const schedule = await getScheduleWindow({ displayZone, days: 8 })

  const liveRadio = schedule.liveNow.filter((item) => item.medium === 'radio')
  const currentShow = liveRadio[0]

  return (
    <>
      <RouteAnalytics
        page="listen_live"
        route={pagePath}
        section="radio"
        title={pageTitle}
        properties={{
          displayZone,
          hasCurrentShow: Boolean(currentShow),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listenLiveJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>WaveNation FM</p>

            <h1>Listen live.</h1>

            <p>
              Stream WaveNation FM in real time, check what is coming up over the next 48
              hours, and see the radio shows that aired earlier today.
            </p>

            <div className={styles.actions}>
              <a
                className={styles.primaryButton}
                href="#radio-player"
                data-analytics-event="listen_live_start_click"
                data-analytics-label="Start Listening"
              >
                Start Listening
              </a>

              <Link
                className={styles.secondaryButton}
                href="/schedule"
                data-analytics-event="listen_live_full_schedule_click"
                data-analytics-label="Full Schedule"
              >
                Full Schedule
              </Link>

              <Link
                className={styles.secondaryButton}
                href="/submit-music"
                data-analytics-event="listen_live_submit_music_click"
                data-analytics-label="Submit Music"
              >
                Submit Music
              </Link>
            </div>
          </div>

          <ListenLivePanel
            title={currentShow?.title ?? 'WaveNation FM'}
            subtitle={currentShow ? 'On air now' : 'Streaming live 24/7'}
            description={
              currentShow?.description ??
              'Your home for music, culture, creator voices, and live radio energy.'
            }
            imageUrl={currentShow?.imageUrl || defaultPlayerImageUrl}
            imageAlt={currentShow?.imageAlt ?? 'WaveNation FM'}
            meta={currentShow?.displayTimeRange ?? `Live stream • ${displayZone}`}
            isLive={Boolean(currentShow)}
          />
        </section>

        <section
          id="radio-player"
          className={styles.playerShell}
          aria-label="WaveNation FM live stream player"
        >
          <div>
            <p className={styles.eyebrow}>Live Stream</p>

            <h2>WaveNation FM Radio Stream</h2>

            <p>
              Press play to start the live stream. Some browsers may require a click before
              audio begins.
            </p>
          </div>

          <audio className={styles.audio} controls preload="none">
            <source src={streamUrl} type={streamType} />
            Your browser does not support the audio element.
          </audio>
        </section>

        <section className={styles.toolbar} aria-label="Schedule timezone switcher">
          <div>
            <p className={styles.eyebrow}>Schedule Time</p>

            <h2>Showing {displayZone === 'CT' ? 'Central Time' : 'Eastern Time'}</h2>
          </div>

          <ScheduleTabs
            tabs={[
              {
                label: 'Eastern Time',
                href: timezoneHref('ET'),
                active: displayZone === 'ET',
              },
              {
                label: 'Central Time',
                href: timezoneHref('CT'),
                active: displayZone === 'CT',
              },
            ]}
          />
        </section>

        <section className={styles.sectionGrid}>
          <div className={styles.sectionPanel}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Coming Up</p>

              <h2>Next 48 hours</h2>

              <p>All upcoming radio shows currently scheduled for the next two days.</p>
            </div>

            <ScheduleList
              items={schedule.upcomingRadio48}
              emptyTitle="No upcoming radio shows are scheduled yet."
              emptyText="Add active recurring or absolute radio schedule entries in the CMS."
            />
          </div>

          <div className={styles.sectionPanel}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Recently Played</p>

              <h2>Earlier today</h2>

              <p>Previous scheduled radio shows from today, newest first.</p>
            </div>

            <ScheduleList
              items={schedule.recentlyPlayedRadioToday}
              emptyTitle="No earlier radio shows yet today."
              emptyText="Recently played shows will appear after a scheduled show ends."
              compact
            />
          </div>
        </section>
      </main>
    </>
  )
}