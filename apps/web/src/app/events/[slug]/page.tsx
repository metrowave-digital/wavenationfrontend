import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventProfile, WatchPageShell } from '@wavenation/ui-web'
import { RouteAnalytics } from '../../components/RouteAnalytics'
import { getEventBySlug } from '@/lib/wavenation-watch'

export const revalidate = 300

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const fallbackEventsImageUrl = new URL('/images/og/events.jpg', siteBaseUrl).toString()

function getEventImageUrl(event: {
  socialCard?: { url?: string | null } | null
  heroImage?: { url?: string | null } | null
}) {
  return event.socialCard?.url || event.heroImage?.url || fallbackEventsImageUrl
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug).catch(() => null)

  if (!event) {
    return {
      title: {
        absolute: 'Event Not Found | WaveNation',
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pagePath = `/events/${slug}`
  const pageTitle = `${event.title} | WaveNation Events`
  const pageDescription =
    event.summary ||
    'Explore this WaveNation event, stream, activation, workshop, or community experience.'
  const imageUrl = getEventImageUrl(event)

  return {
    metadataBase: new URL(siteBaseUrl),
    title: {
      absolute: pageTitle,
    },
    description: pageDescription,
    alternates: {
      canonical: pagePath,
    },
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
          width: 1200,
          height: 630,
          alt: event.title,
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

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEventBySlug(slug).catch(() => null)

  if (!event) {
    notFound()
  }

  const pagePath = `/events/${slug}`
  const pageUrl = new URL(pagePath, siteBaseUrl).toString()
  const eventImageUrl = getEventImageUrl(event)
  const pageDescription =
    event.summary ||
    'Explore this WaveNation event, stream, activation, workshop, or community experience.'

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${event.title} | WaveNation Events`,
    description: pageDescription,
    image: eventImageUrl,
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
    about: {
      '@type': 'Event',
      name: event.title,
      description: pageDescription,
      image: eventImageUrl,
      url: pageUrl,
    },
  }

  return (
    <>
      <RouteAnalytics
        page="event_detail"
        route={pagePath}
        section="watch_events"
        title={event.title}
        properties={{
          slug,
          hasStream: Boolean(event.livestreamUrl || event.replayUrl),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <WatchPageShell>
        <EventProfile
          event={event}
          includeStream={Boolean(event.livestreamUrl || event.replayUrl)}
        />
      </WatchPageShell>
    </>
  )
}