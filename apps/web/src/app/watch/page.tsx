import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { WatchHero, WatchPageShell, WatchRail } from '@wavenation/ui-web'
import { WatchPageAnalytics } from './WatchPageAnalytics'
import { getWatchHomeData } from '@/lib/wavenation-watch'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'Watch | WaveNation'
const pageDescription =
  'Watch WaveNation One live, explore WaveNation+ video, live events, replays, clips, creator video, and original shows.'

const fallbackOgImage = '/images/og/wavenation-watch.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type WatchHomeData = Awaited<ReturnType<typeof getWatchHomeData>>
type WatchImage = NonNullable<ComponentProps<typeof WatchHero>['image']>

const fallbackWatchImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Watch',
  width: 1200,
  height: 630,
} as WatchImage

const fallbackWatchHomeData: WatchHomeData = {
  channels: [],
  featuredVod: [],
  latestVod: [],
  shows: [],
  events: [],
  videoProvider: 'mux' as WatchHomeData['videoProvider'],
  muxEnabled: false,
  cloudflareAccountHash: '',
}

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
        alt: 'WaveNation Watch',
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
      '@type': 'VideoGallery',
      '@id': `${pageUrl}#watch-gallery`,
      name: 'WaveNation Watch',
      url: pageUrl,
      description:
        'WaveNation Watch features live channels, VOD, shows, events, replays, clips, and premium video experiences.',
      publisher: {
        '@type': 'Organization',
        name: 'WaveNation Media',
        url: siteBaseUrl,
      },
    },
    {
      '@type': 'BroadcastService',
      '@id': `${siteBaseUrl}/watch-live#broadcast-service`,
      name: 'WaveNation One',
      broadcastDisplayName: 'WaveNation One',
      url: `${siteBaseUrl}/watch-live`,
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

async function getSafeWatchHomeData(): Promise<WatchHomeData> {
  try {
    return await getWatchHomeData()
  } catch (error) {
    console.error('[WatchPage] Failed to load watch home data:', error)
    return fallbackWatchHomeData
  }
}

export default async function WatchPage() {
  const data = await getSafeWatchHomeData()

  const channels = Array.isArray(data.channels) ? data.channels : []
  const featuredVod = Array.isArray(data.featuredVod) ? data.featuredVod : []
  const latestVod = Array.isArray(data.latestVod) ? data.latestVod : []
  const shows = Array.isArray(data.shows) ? data.shows : []
  const events = Array.isArray(data.events) ? data.events : []

  const heroImage =
    featuredVod[0]?.poster ||
    shows[0]?.heroBanner ||
    shows[0]?.posterArt ||
    fallbackWatchImage

  const vodItems = featuredVod.length ? featuredVod : latestVod

  return (
    <WatchPageShell>
      <WatchPageAnalytics
        channelCount={channels.length}
        featuredVodCount={featuredVod.length}
        latestVodCount={latestVod.length}
        showCount={shows.length}
        eventCount={events.length}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <WatchHero
        title="Stream culture. Live 24/7."
        subtitle="WaveNation One brings live channels, original shows, creator video, replays, clips, premium drops, and virtual events into one cinematic watch experience."
        image={heroImage}
        actions={[
          { label: 'Watch Live', href: '/watch-live', variant: 'primary' },
          { label: 'Explore VOD', href: '/watch/vod', variant: 'secondary' },
          { label: 'WaveNation+', href: '/watch/plus', variant: 'ghost' },
        ]}
      />

      <WatchRail
        eyebrow="Live"
        title="Live Channels"
        items={channels.map((channel) => ({
          id: channel.id,
          title: channel.title,
          description: channel.description,
          href: '/watch-live',
          image: channel.poster || fallbackWatchImage,
          badge: channel.badge || 'Live',
          isLive: true,
        }))}
      />

      <WatchRail
        eyebrow="Originals"
        title="Featured VOD"
        items={vodItems.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          href: item.href,
          image: item.poster || fallbackWatchImage,
          badge: item.vodType,
          locked: item.access.isLocked,
        }))}
        actions={[{ label: 'All VOD', href: '/watch/vod', variant: 'secondary' }]}
      />

      <WatchRail
        eyebrow="Series"
        title="TV Shows"
        items={shows.map((show) => ({
          id: show.id,
          title: show.title,
          description: show.description,
          href: show.href,
          image: show.posterArt || show.heroBanner || fallbackWatchImage,
          badge: show.network,
        }))}
        actions={[
          { label: 'All Shows', href: '/watch/shows', variant: 'secondary' },
        ]}
      />

      <WatchRail
        eyebrow="Events"
        title="Live Events"
        items={events.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.summary,
          href: event.watchHref,
          image: event.posterImage || event.heroImage || fallbackWatchImage,
          badge: event.eventType,
          locked: event.access.isLocked,
        }))}
        actions={[
          { label: 'Events', href: '/watch/events', variant: 'secondary' },
        ]}
      />
    </WatchPageShell>
  )
}