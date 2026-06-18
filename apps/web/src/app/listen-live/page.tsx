import type { Metadata } from 'next'
import Link from 'next/link'
import { ListenLivePanel, ScheduleList, ScheduleTabs } from '@wavenation/ui-web'
import {
  getScheduleWindow,
  normalizeDisplayTimeZone,
  type DisplayTimeZone,
} from '@/lib/wavenation-schedules'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Listen Live | WaveNation FM',
  description:
    'Listen to WaveNation FM live and see what shows are coming up over the next 48 hours.',
}

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

const streamUrl =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_URL || 'https://streaming.live365.com/a49099'

const streamType =
  process.env.NEXT_PUBLIC_WAVENATION_RADIO_STREAM_TYPE || 'audio/mpeg'

function timezoneHref(zone: DisplayTimeZone) {
  return `/listen-live?tz=${zone}`
}

export default async function ListenLivePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}

  const displayZone = normalizeDisplayTimeZone(params.tz)
  const schedule = await getScheduleWindow({ displayZone, days: 8 })

  const liveRadio = schedule.liveNow.filter((item) => item.medium === 'radio')
  const currentShow = liveRadio[0]

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>WaveNation FM</p>
          <h1>Listen live.</h1>
          <p>
            Stream WaveNation FM in real time, check what is coming up over the next 48 hours,
            and see the radio shows that aired earlier today.
          </p>

          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#radio-player">
              Start Listening
            </a>

            <Link className={styles.secondaryButton} href="/schedule">
              Full Schedule
            </Link>

            <Link className={styles.secondaryButton} href="/submit-music">
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
          imageUrl={currentShow?.imageUrl}
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
            Press play to start the live stream. Some browsers may require a click before audio
            begins.
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
  )
}