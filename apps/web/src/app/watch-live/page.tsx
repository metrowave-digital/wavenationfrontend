import type { Metadata } from 'next'
import { WatchLiveLayout, WatchPageShell } from '@wavenation/ui-web'
import { WatchLiveAnalytics } from './WatchLiveAnalytics'
import { getEvents, getLiveChannels } from '@/lib/wavenation-watch'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch-live'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'Watch Live | WaveNation One'
const pageDescription =
  'Watch WaveNation One live channels, virtual events, cultural broadcasts, premieres, and live streaming experiences from WaveNation Media.'

const fallbackOgImage = '/images/og/wavenation-watch-live.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

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
        alt: 'WaveNation One Watch Live',
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

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
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
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: fallbackOgImageUrl,
        width: 1200,
        height: 630,
      },
    },
    {
      '@type': 'BroadcastService',
      '@id': `${pageUrl}#broadcast-service`,
      name: 'WaveNation One',
      broadcastDisplayName: 'WaveNation One',
      url: pageUrl,
      areaServed: 'US',
      description:
        'WaveNation One live streaming channels and virtual events from WaveNation Media.',
      broadcaster: {
        '@type': 'Organization',
        name: 'WaveNation Media',
        url: siteBaseUrl,
      },
    },
  ],
} as const

async function getSafeVirtualEvents(): Promise<Awaited<ReturnType<typeof getEvents>>> {
  try {
    return await getEvents({ virtualOnly: true, limit: 12 })
  } catch (error) {
    console.error('[WatchLivePage] Failed to load virtual events:', error)
    return [] as Awaited<ReturnType<typeof getEvents>>
  }
}

function getSafeLiveChannels(): ReturnType<typeof getLiveChannels> {
  try {
    return getLiveChannels()
  } catch (error) {
    console.error('[WatchLivePage] Failed to load live channels:', error)
    return [] as ReturnType<typeof getLiveChannels>
  }
}

export default async function WatchLivePage() {
  const events = await getSafeVirtualEvents()
  const channels = getSafeLiveChannels()

  const eventCount = Array.isArray(events) ? events.length : 0
  const channelCount = Array.isArray(channels) ? channels.length : 0

  return (
    <WatchPageShell>
      <WatchLiveAnalytics eventCount={eventCount} channelCount={channelCount} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <WatchLiveLayout channels={channels} events={events} />
    </WatchPageShell>
  )
}