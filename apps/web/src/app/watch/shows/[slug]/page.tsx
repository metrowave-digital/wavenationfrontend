import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TVShowProfile, WatchPageShell } from '@wavenation/ui-web'
import { WatchShowDetailAnalytics } from './WatchShowDetailAnalytics'
import { getEpisodesForShow, getTVShowBySlug } from '@/lib/wavenation-watch'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }>
}

type TVShowProfileShow = ComponentProps<typeof TVShowProfile>['show']
type TVShowProfileEpisodes = ComponentProps<typeof TVShowProfile>['episodes']
type ShowImage = NonNullable<TVShowProfileShow['posterArt']>

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const fallbackOgImage = '/images/og/wavenation-shows.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

const fallbackShowImage = {
  url: fallbackOgImage,
  alt: 'WaveNation TV Shows',
  width: 1200,
  height: 630,
} as ShowImage

function toAbsoluteUrl(url?: string | null) {
  if (!url) return fallbackOgImageUrl
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

async function getSafeTVShowBySlug(slug: string) {
  try {
    return await getTVShowBySlug(slug)
  } catch (error) {
    console.error(`[WatchShowDetailPage] Failed to load show "${slug}":`, error)
    return null
  }
}

async function getSafeEpisodesForShow(
  showId: TVShowProfileShow['id']
): Promise<TVShowProfileEpisodes> {
  try {
    return await getEpisodesForShow(showId)
  } catch (error) {
    console.error(
      `[WatchShowDetailPage] Failed to load episodes for show "${String(
        showId
      )}":`,
      error
    )
    return [] as TVShowProfileEpisodes
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const show = await getSafeTVShowBySlug(slug)

  if (!show) {
    return {
      title: 'Show Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pagePath = `/watch/shows/${slug}`
  const pageTitle = `${show.title} | WaveNation Watch`
  const pageDescription =
    show.description ||
    `Watch ${show.title}, a WaveNation original show, series, or video program.`

  const imageUrl = toAbsoluteUrl(show.posterArt?.url || show.heroBanner?.url)

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
      type: 'video.tv_show',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          alt: show.posterArt?.alt || show.heroBanner?.alt || show.title,
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
  show: TVShowProfileShow,
  episodes: TVShowProfileEpisodes,
  slug: string
) {
  const pagePath = `/watch/shows/${slug}`
  const pageUrl = `${siteBaseUrl}${pagePath}`
  const imageUrl = toAbsoluteUrl(show.posterArt?.url || show.heroBanner?.url)
  const safeEpisodes = Array.isArray(episodes) ? episodes : []

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${show.title} | WaveNation Watch`,
        description:
          show.description ||
          `Watch ${show.title}, a WaveNation original show, series, or video program.`,
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
        '@type': 'TVSeries',
        '@id': `${pageUrl}#series`,
        name: show.title,
        description:
          show.description || `WaveNation Watch series page for ${show.title}.`,
        image: imageUrl,
        url: pageUrl,
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: siteBaseUrl,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#episodes`,
        name: `${show.title} Episodes`,
        numberOfItems: safeEpisodes.length,
        itemListElement: safeEpisodes.slice(0, 24).map((episode, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${siteBaseUrl}${episode.href}`,
          name: episode.title,
        })),
      },
    ],
  } as const
}

export default async function WatchShowDetailPage({ params }: PageProps) {
  const { slug } = await params
  const show = await getSafeTVShowBySlug(slug)

  if (!show) notFound()

  const episodes = await getSafeEpisodesForShow(show.id)

  const profileShow: TVShowProfileShow = {
    ...show,
    posterArt: show.posterArt || show.heroBanner || fallbackShowImage,
    heroBanner: show.heroBanner || show.posterArt || fallbackShowImage,
  }

  return (
    <WatchPageShell>
      <WatchShowDetailAnalytics
        showId={String(profileShow.id)}
        title={profileShow.title}
        episodeCount={Array.isArray(episodes) ? episodes.length : 0}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getStructuredData(profileShow, episodes, slug)
          ).replace(/</g, '\\u003c'),
        }}
      />

      <TVShowProfile show={profileShow} episodes={episodes} />
    </WatchPageShell>
  )
}