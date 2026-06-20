import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VODProfile, WatchPageShell } from '@wavenation/ui-web'
import { EpisodeWatchAnalytics } from './EpisodeWatchAnalytics'
import { getTVShowBySlug, getVODBySlug } from '@/lib/wavenation-watch'

export const revalidate = 300

type PageProps = {
  params:
    | Promise<{ slug: string; episodeSlug: string }>
    | { slug: string; episodeSlug: string }
}

type VODProfileItem = ComponentProps<typeof VODProfile>['item']
type WatchImage = NonNullable<VODProfileItem['poster']>

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const fallbackOgImage = '/images/og/wavenation-vod.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

const fallbackEpisodeImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Episode',
  width: 1200,
  height: 630,
} as WatchImage

function toAbsoluteUrl(url?: string | null) {
  if (!url) return fallbackOgImageUrl
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

async function getSafeTVShowBySlug(slug: string) {
  try {
    return await getTVShowBySlug(slug)
  } catch (error) {
    console.error(`[EpisodeWatchPage] Failed to load show "${slug}":`, error)
    return null
  }
}

async function getSafeVODBySlug(episodeSlug: string) {
  try {
    return await getVODBySlug(episodeSlug)
  } catch (error) {
    console.error(
      `[EpisodeWatchPage] Failed to load episode "${episodeSlug}":`,
      error
    )
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, episodeSlug } = await params
  const [show, episode] = await Promise.all([
    getSafeTVShowBySlug(slug),
    getSafeVODBySlug(episodeSlug),
  ])

  if (!episode) {
    return {
      title: 'Episode Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pagePath = `/watch/shows/${slug}/episodes/${episodeSlug}`
  const pageTitle = `${episode.title} | WaveNation Watch`
  const pageDescription =
    episode.description ||
    `Watch ${episode.title}${show ? ` from ${show.title}` : ''} on WaveNation Watch.`

  const imageUrl = toAbsoluteUrl(episode.poster?.url)

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
      type: 'video.episode',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          alt: episode.poster?.alt || episode.title,
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

function getStructuredData(
  episode: VODProfileItem,
  slug: string,
  episodeSlug: string,
  showTitle?: string
) {
  const pagePath = `/watch/shows/${slug}/episodes/${episodeSlug}`
  const pageUrl = `${siteBaseUrl}${pagePath}`
  const imageUrl = toAbsoluteUrl(episode.poster?.url)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${episode.title} | WaveNation Watch`,
        description:
          episode.description ||
          `Watch ${episode.title}${
            showTitle ? ` from ${showTitle}` : ''
          } on WaveNation Watch.`,
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
        '@type': 'VideoObject',
        '@id': `${pageUrl}#video`,
        name: episode.title,
        description:
          episode.description ||
          `WaveNation episode${showTitle ? ` from ${showTitle}` : ''}.`,
        thumbnailUrl: [imageUrl],
        url: pageUrl,
        isAccessibleForFree: !episode.access.isLocked,
        partOfSeries: showTitle
          ? {
              '@type': 'TVSeries',
              name: showTitle,
              url: `${siteBaseUrl}/watch/shows/${slug}`,
            }
          : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: siteBaseUrl,
        },
      },
    ],
  } as const
}

export default async function EpisodeWatchPage({ params }: PageProps) {
  const { slug, episodeSlug } = await params

  const [show, episode] = await Promise.all([
    getSafeTVShowBySlug(slug),
    getSafeVODBySlug(episodeSlug),
  ])

  if (!episode) notFound()

  const profileEpisode: VODProfileItem = {
    ...episode,
    poster: episode.poster || fallbackEpisodeImage,
  }

  return (
    <WatchPageShell>
      <EpisodeWatchAnalytics
        episodeId={String(profileEpisode.id)}
        title={profileEpisode.title}
        showTitle={show?.title}
        vodType={profileEpisode.vodType}
        locked={profileEpisode.access.isLocked}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getStructuredData(profileEpisode, slug, episodeSlug, show?.title)
          ).replace(/</g, '\\u003c'),
        }}
      />

      <VODProfile item={profileEpisode} />
    </WatchPageShell>
  )
}