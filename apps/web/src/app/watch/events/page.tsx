import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { EventDirectory, WatchPageShell } from '@wavenation/ui-web'
import { WatchEventsAnalytics } from './WatchEventsAnalytics'
import { getEvents } from '@/lib/wavenation-watch'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch/events'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'Live Events | WaveNation Watch'
const pageDescription =
  'Watch WaveNation virtual events, hybrid events, livestreams, concerts, town halls, creator workshops, and cultural broadcasts.'

const fallbackOgImage = '/images/og/wavenation-watch-events.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type EventDirectoryEvents = ComponentProps<typeof EventDirectory>['events']
type EventDirectoryEvent = EventDirectoryEvents[number]
type EventImage = NonNullable<EventDirectoryEvent['heroImage']>
type WatchEvents = Awaited<ReturnType<typeof getEvents>>

const fallbackEventImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Watch Events',
  width: 1200,
  height: 630,
} as EventImage

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
        alt: 'WaveNation Watch Events',
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

async function getSafeEvents(): Promise<WatchEvents> {
  try {
    return await getEvents({
      virtualOnly: true,
      includeCompleted: true,
      limit: 96,
    })
  } catch (error) {
    console.error('[WatchEventsPage] Failed to load watch events:', error)
    return [] as WatchEvents
  }
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return fallbackOgImageUrl
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

function getStructuredData(events: EventDirectoryEvents) {
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
        '@id': `${pageUrl}#watch-events-list`,
        name: 'WaveNation Watch Events',
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
              event.socialCard?.url ||
                event.heroImage?.url ||
                event.posterImage?.url
            ),
          },
        })),
      },
    ],
  } as const
}

export default async function WatchEventsPage() {
  const events = await getSafeEvents()
  const safeEvents = Array.isArray(events) ? events : []

  const directoryEvents: EventDirectoryEvents = safeEvents.map((event) => ({
    ...event,
    heroImage: event.heroImage || event.posterImage || fallbackEventImage,
    posterImage: event.posterImage || event.heroImage || fallbackEventImage,
    socialCard: event.socialCard || event.heroImage || event.posterImage || fallbackEventImage,
  }))

  const lockedCount = directoryEvents.filter(
    (event) => event.access.isLocked
  ).length

  return (
    <WatchPageShell>
      <WatchEventsAnalytics
        eventCount={directoryEvents.length}
        lockedCount={lockedCount}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(directoryEvents)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <EventDirectory
        events={directoryEvents}
        title="Watch Events"
        subtitle="Virtual, hybrid, and livestream events with Restream embed support, Restream chat, and Cloudflare-ready playback."
      />
    </WatchPageShell>
  )
}