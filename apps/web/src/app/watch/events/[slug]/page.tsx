import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventProfile, WatchPageShell } from '@wavenation/ui-web'
import { WatchEventDetailAnalytics } from './WatchEventDetailAnalytics'
import { getEventBySlug } from '@/lib/wavenation-watch'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

type EventProfileEvent = ComponentProps<typeof EventProfile>['event']
type EventImage = NonNullable<EventProfileEvent['heroImage']>

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const fallbackOgImage = '/images/og/wavenation-watch-events.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

const fallbackEventImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Watch Event',
  width: 1200,
  height: 630,
} as EventImage

function toAbsoluteUrl(url?: string | null) {
  if (!url) return fallbackOgImageUrl
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

async function getSafeEventBySlug(slug: string) {
  try {
    return await getEventBySlug(slug)
  } catch (error) {
    console.error(`[WatchEventDetailPage] Failed to load event "${slug}":`, error)
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getSafeEventBySlug(slug)

  if (!event) {
    return {
      title: 'Event Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pagePath = `/watch/events/${slug}`
  const pageTitle = `${event.title} | Watch Event`
  const pageDescription =
    event.summary ||
    `Watch ${event.title}, a WaveNation virtual or livestream event.`

  const imageUrl = toAbsoluteUrl(
    event.socialCard?.url || event.heroImage?.url || event.posterImage?.url
  )

  return {
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
          url: imageUrl,
          alt:
            event.socialCard?.alt ||
            event.heroImage?.alt ||
            event.posterImage?.alt ||
            event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
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
}

function getStructuredData(event: EventProfileEvent, slug: string) {
  const pagePath = `/watch/events/${slug}`
  const pageUrl = `${siteBaseUrl}${pagePath}`
  const imageUrl = toAbsoluteUrl(
    event.socialCard?.url || event.heroImage?.url || event.posterImage?.url
  )

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${event.title} | Watch Event`,
        description:
          event.summary ||
          `Watch ${event.title}, a WaveNation virtual or livestream event.`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: siteBaseUrl,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: imageUrl,
        },
      },
      {
        '@type': 'Event',
        '@id': `${pageUrl}#event`,
        name: event.title,
        description:
          event.summary ||
          `WaveNation virtual or livestream event: ${event.title}.`,
        url: pageUrl,
        startDate: event.startDate || undefined,
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        image: [imageUrl],
        isAccessibleForFree: !event.access.isLocked,
        organizer: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: siteBaseUrl,
        },
      },
    ],
  } as const
}

export default async function WatchEventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getSafeEventBySlug(slug)

  if (!event) notFound()

  const profileEvent: EventProfileEvent = {
    ...event,
    heroImage: event.heroImage || event.posterImage || fallbackEventImage,
    posterImage: event.posterImage || event.heroImage || fallbackEventImage,
    socialCard: event.socialCard || event.heroImage || event.posterImage || fallbackEventImage,
  }

  return (
    <WatchPageShell>
      <WatchEventDetailAnalytics
        eventId={String(profileEvent.id)}
        title={profileEvent.title}
        eventType={profileEvent.eventType}
        locked={profileEvent.access.isLocked}
        includeStream
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(profileEvent, slug)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <EventProfile event={profileEvent} includeStream />
    </WatchPageShell>
  )
}