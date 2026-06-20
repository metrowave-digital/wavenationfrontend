import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WatchGrid, WatchPageShell } from '@wavenation/ui-web'
import { ShowEpisodesAnalytics } from './ShowEpisodesAnalytics'
import { getEpisodesForShow, getTVShowBySlug } from '@/lib/wavenation-watch'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

type WatchGridItem = ComponentProps<typeof WatchGrid>['items'][number]
type WatchImage = NonNullable<WatchGridItem['image']>
type Episodes = Awaited<ReturnType<typeof getEpisodesForShow>>

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const fallbackOgImage = '/images/og/wavenation-shows.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

const fallbackEpisodeImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Show Episodes',
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
    console.error(`[ShowEpisodesPage] Failed to load show "${slug}":`, error)
    return null
  }
}

async function getSafeEpisodesForShow(showId: string | number): Promise<Episodes> {
  try {
    return await getEpisodesForShow(showId)
  } catch (error) {
    console.error(
      `[ShowEpisodesPage] Failed to load episodes for show "${String(showId)}":`,
      error
    )
    return [] as Episodes
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const show = await getSafeTVShowBySlug(slug)

  if (!show) {
    return {
      title: 'Episodes Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pagePath = `/watch/shows/${slug}/episodes`
  const pageTitle = `${show.title} Episodes | WaveNation Watch`
  const pageDescription = `Watch episodes of ${show.title}.`
  const imageUrl = toAbsoluteUrl(show.heroBanner?.url || show.posterArt?.url)

  return {
    metadataBase: new URL(siteBaseUrl),
    title: pageTitle,
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
          alt: show.heroBanner?.alt || show.posterArt?.alt || show.title,
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
  showTitle: string,
  slug: string,
  episodes: Episodes,
  imageUrl: string
) {
  const pagePath = `/watch/shows/${slug}/episodes`
  const pageUrl = `${siteBaseUrl}${pagePath}`
  const safeEpisodes = Array.isArray(episodes) ? episodes : []

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${showTitle} Episodes | WaveNation Watch`,
        description: `Watch episodes of ${showTitle}.`,
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
        '@type': 'ItemList',
        '@id': `${pageUrl}#episode-list`,
        name: `${showTitle} Episodes`,
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

export default async function ShowEpisodesPage({ params }: PageProps) {
  const { slug } = await params
  const show = await getSafeTVShowBySlug(slug)

  if (!show) notFound()

  const episodes = await getSafeEpisodesForShow(show.id)
  const safeEpisodes = Array.isArray(episodes) ? episodes : []

  const imageUrl = toAbsoluteUrl(show.heroBanner?.url || show.posterArt?.url)

  const gridItems: WatchGridItem[] = safeEpisodes.map((episode) => ({
    id: episode.id,
    title: episode.title,
    description: episode.description,
    href: episode.href,
    image: episode.poster || fallbackEpisodeImage,
    badge: episode.vodType,
    locked: episode.access.isLocked,
  }))

  return (
    <WatchPageShell
      eyebrow={show.title}
      title="Episodes"
      subtitle="Browse the full episode library for this WaveNation series."
    >
      <ShowEpisodesAnalytics
        showId={String(show.id)}
        showTitle={show.title}
        episodeCount={safeEpisodes.length}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getStructuredData(show.title, slug, safeEpisodes, imageUrl)
          ).replace(/</g, '\\u003c'),
        }}
      />

      <section className={styles.pageSection}>
        <div className={styles.container}>
          <WatchGrid
            items={gridItems}
            emptyText="No episodes are published yet."
          />
        </div>
      </section>
    </WatchPageShell>
  )
}