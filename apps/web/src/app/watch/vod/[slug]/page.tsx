import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VODProfile, WatchPageShell } from '@wavenation/ui-web'
import { VODDetailAnalytics } from './VODDetailAnalytics'
import { VODPlayer } from '../../../../components/VODPlayer'
import { getVODBySlug } from '@/lib/wavenation-watch'

export const revalidate = 300

type PageParams = {
  slug: string
}

type PageProps = {
  params: Promise<PageParams>
}

type VODProfileItem = ComponentProps<typeof VODProfile>['item']
type VODPlayerItem = ComponentProps<typeof VODPlayer>['item']
type WatchImage = NonNullable<VODProfileItem['poster']>

type VODProfileItemWithPlayback = VODProfileItem & {
  provider?: string | null
  muxPlaybackId?: string | null
  signedPlayback?: boolean | null
  hlsUrl?: string | null
  embedUrl?: string | null
  fallbackMp4Url?: string | null
  posterUrl?: string | null
  image?: string | null
}

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const fallbackOgImage = '/images/og/wavenation-vod.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

const fallbackWatchImage = {
  url: fallbackOgImage,
  alt: 'WaveNation VOD Library',
  width: 1200,
  height: 630,
} as WatchImage

function toAbsoluteUrl(url?: string | null) {
  if (!url) return fallbackOgImageUrl
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

function getPosterUrl(item: VODProfileItem) {
  return item.poster?.url || fallbackWatchImage.url
}

function toVODPlayerItem(item: VODProfileItem): VODPlayerItem {
  const playbackItem = item as VODProfileItemWithPlayback
  const posterUrl = getPosterUrl(item)

  return {
    id: item.id,
    title: item.title,
    provider: playbackItem.provider || 'mux',
    muxPlaybackId: playbackItem.muxPlaybackId || null,
    signedPlayback: playbackItem.signedPlayback ?? item.access.isLocked,
    poster: posterUrl,
    posterUrl,
    image: posterUrl,
    hlsUrl: playbackItem.hlsUrl || null,
    embedUrl: playbackItem.embedUrl || null,
    access: item.access,
  }
}

async function getSafeVODBySlug(slug: string) {
  try {
    return await getVODBySlug(slug)
  } catch (error) {
    console.error(`[VODDetailPage] Failed to load VOD item "${slug}":`, error)
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await getSafeVODBySlug(slug)

  if (!item) {
    return {
      title: 'Video Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pagePath = `/watch/vod/${slug}`
  const pageTitle = `${item.title} | WaveNation Watch`
  const pageDescription =
    item.description ||
    'Watch this WaveNation video on demand from the WaveNation Watch library.'

  const posterUrl = toAbsoluteUrl(item.poster?.url)

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
      type: 'video.other',
      locale: 'en_US',
      images: [
        {
          url: posterUrl,
          alt: item.poster?.alt || item.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [posterUrl],
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

function getStructuredData(item: VODProfileItem, slug: string) {
  const pagePath = `/watch/vod/${slug}`
  const pageUrl = `${siteBaseUrl}${pagePath}`
  const posterUrl = toAbsoluteUrl(item.poster?.url)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${item.title} | WaveNation Watch`,
        description:
          item.description ||
          'Watch this WaveNation video on demand from the WaveNation Watch library.',
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: siteBaseUrl,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: posterUrl,
        },
      },
      {
        '@type': 'VideoObject',
        '@id': `${pageUrl}#video`,
        name: item.title,
        description:
          item.description ||
          'WaveNation video on demand from the WaveNation Watch library.',
        thumbnailUrl: [posterUrl],
        url: pageUrl,
        isAccessibleForFree: !item.access.isLocked,
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: siteBaseUrl,
        },
      },
    ],
  } as const
}

export default async function VODDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getSafeVODBySlug(slug)

  if (!item) notFound()

  const profileItem: VODProfileItem = {
    ...item,
    poster: item.poster || fallbackWatchImage,
  }

  const playerItem = toVODPlayerItem(profileItem)

  return (
    <WatchPageShell>
      <VODDetailAnalytics
        itemId={String(profileItem.id)}
        title={profileItem.title}
        vodType={profileItem.vodType}
        locked={profileItem.access.isLocked}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(profileItem, slug)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <VODPlayer item={playerItem} />

      <VODProfile item={profileItem} />
    </WatchPageShell>
  )
}