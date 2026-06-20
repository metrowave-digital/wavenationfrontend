import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import {
  WatchGrid,
  WatchPageShell,
  formatDateTime,
} from '@wavenation/ui-web'
import { WatchScheduleAnalytics } from './WatchScheduleAnalytics'
import { getEvents } from '@/lib/wavenation-watch'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch/schedule'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'Watch Schedule | WaveNation'
const pageDescription =
  'Upcoming WaveNation video events, livestreams, watch programming, virtual premieres, and live culture broadcasts.'

const fallbackOgImage = '/images/og/wavenation-watch-schedule.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type WatchGridItem = ComponentProps<typeof WatchGrid>['items'][number]
type WatchImage = NonNullable<WatchGridItem['image']>
type WatchEvents = Awaited<ReturnType<typeof getEvents>>

const fallbackWatchImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Watch Schedule',
  width: 1200,
  height: 630,
} as WatchImage

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  applicationName: 'WaveNation',
  authors: [{ name: 'WaveNation Media' }],
  creator: 'WaveNation Media',
  publisher: 'WaveNation Media',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: fallbackOgImage,
        width: 1200,
        height: 630,
        alt: 'WaveNation Watch Schedule',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [fallbackOgImage],
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

function toAbsoluteUrl(url?: string | null) {
  if (!url) return fallbackOgImageUrl
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

async function getSafeEvents(): Promise<WatchEvents> {
  try {
    return await getEvents({ includeCompleted: false, limit: 96 })
  } catch (error) {
    console.error('[WatchSchedulePage] Failed to load watch schedule:', error)
    return [] as WatchEvents
  }
}

function getStructuredData(events: WatchEvents) {
  const safeEvents = Array.isArray(events) ? events : []

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: siteBaseUrl,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: fallbackOgImageUrl,
          width: 1200,
          height: 630,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#watch-schedule-list`,
        name: 'WaveNation Watch Schedule',
        numberOfItems: safeEvents.length,
        itemListElement: safeEvents.slice(0, 24).map((event, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Event',
            name: event.title,
            url: toAbsoluteUrl(event.watchHref),
            startDate: event.startDate || undefined,
            eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
            image: toAbsoluteUrl(
              event.posterImage?.url || event.heroImage?.url
            ),
          },
        })),
      },
    ],
  } as const
}

export default async function WatchSchedulePage() {
  const events = await getSafeEvents()
  const safeEvents = Array.isArray(events) ? events : []

  const gridItems: WatchGridItem[] = safeEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.summary,
    href: event.watchHref,
    image: event.posterImage || event.heroImage || fallbackWatchImage,
    badge: event.eventType,
    meta: event.startDate
      ? formatDateTime(event.startDate, event.timezone)
      : undefined,
    locked: event.access.isLocked,
  }))

  const lockedCount = safeEvents.filter((event) => event.access.isLocked).length

  return (
    <WatchPageShell
      eyebrow="Schedule"
      title="Watch Schedule"
      subtitle="Upcoming WaveNation video events, livestreams, and watch programming. Add dedicated TV schedule data later without changing the route."
    >
      <WatchScheduleAnalytics
        eventCount={safeEvents.length}
        lockedCount={lockedCount}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(safeEvents)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <section className={styles.pageSection}>
        <div className={styles.container}>
          <WatchGrid
            items={gridItems}
            emptyText="No scheduled watch events are published yet."
          />
        </div>
      </section>
    </WatchPageShell>
  )
}