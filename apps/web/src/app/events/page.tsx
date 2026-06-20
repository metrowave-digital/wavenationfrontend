import type { Metadata } from 'next'
import { EventDirectory, WatchPageShell } from '@wavenation/ui-web'
import { RouteAnalytics } from '../components/RouteAnalytics'
import { getEvents } from '@/lib/wavenation-watch'

export const revalidate = 300

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pagePath = '/events'
const pageUrl = new URL(pagePath, siteBaseUrl).toString()

const pageTitle = 'Events | WaveNation'
const pageDescription =
  'WaveNation events, concerts, festivals, virtual streams, town halls, creator workshops, and live activations built around culture, music, creators, and community.'

const ogImageUrl = new URL('/images/og/events.jpg', siteBaseUrl).toString()

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
    'WaveNation events',
    'WaveNation concerts',
    'WaveNation festivals',
    'virtual events',
    'creator workshops',
    'community events',
    'live activations',
    'music events',
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
        alt: 'WaveNation events and live activations.',
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

const eventsJsonLd = {
  '@context': 'https://schema.org',
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
  publisher: {
    '@type': 'Organization',
    name: 'WaveNation Media',
    url: siteBaseUrl,
  },
}

export default async function EventsPage() {
  const events = await getEvents({ includeCompleted: true, limit: 96 }).catch(() => [])

  return (
    <>
      <RouteAnalytics
        page="events"
        route={pagePath}
        section="watch_events"
        title={pageTitle}
        properties={{
          includeCompleted: true,
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventsJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <WatchPageShell>
        <EventDirectory
          events={events}
          title="Events"
          subtitle="In-person, virtual, and hybrid WaveNation experiences built around culture, music, creators, and community."
        />
      </WatchPageShell>
    </>
  )
}