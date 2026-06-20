import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import {
  getPodcastBySlug,
  getPodcastEpisodes,
  getPodcasts,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

const PODCASTS_OG_IMAGE = '/images/og/wavenation-podcasts-og.jpg'

type PodcastPageParams = {
  slug: string
}

type PodcastPageProps = {
  params: Promise<PodcastPageParams> | PodcastPageParams
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://wavenation.online'
  )
}

function getMetadataBase() {
  try {
    return new URL(getSiteUrl())
  } catch {
    return new URL('https://wavenation.online')
  }
}

function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, getSiteUrl()).toString()
  } catch {
    return new URL(pathOrUrl, 'https://wavenation.online').toString()
  }
}

function truncateDescription(value: string | null | undefined, fallback: string) {
  const source = value?.replace(/\s+/g, ' ').trim() || fallback

  if (source.length <= 155) {
    return source
  }

  return `${source.slice(0, 152).trim()}...`
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params)
  const podcast = await getPodcastBySlug(slug).catch(() => null)

  if (!podcast) {
    return {
      metadataBase: getMetadataBase(),
      title: 'Podcast Not Found | WaveNation',
      description: 'The requested WaveNation podcast could not be found.',
      alternates: {
        canonical: `/shows/podcasts/${encodeURIComponent(slug)}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = truncateDescription(
    podcast.shortDescription || podcast.description,
    `Listen to ${podcast.title} from WaveNation.`
  )

  const canonical = `/shows/podcasts/${podcast.slug}`

  const image = podcast.imageUrl
    ? [
        {
          url: podcast.imageUrl,
          alt: podcast.title,
        },
      ]
    : [
        {
          url: PODCASTS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${podcast.title} on WaveNation Podcasts`,
        },
      ]

  return {
    metadataBase: getMetadataBase(),
    title: `${podcast.title} | WaveNation Podcasts`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${podcast.title} | WaveNation Podcasts`,
      description,
      type: 'website',
      url: canonical,
      siteName: 'WaveNation',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${podcast.title} | WaveNation Podcasts`,
      description,
      images: [podcast.imageUrl || PODCASTS_OG_IMAGE],
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

export default async function PodcastDetailPage({
  params,
}: PodcastPageProps) {
  const { slug } = await Promise.resolve(params)

  const podcast = await getPodcastBySlug(slug).catch(() => null)

  if (!podcast) {
    notFound()
  }

  const [episodes, relatedShows] = await Promise.all([
    getPodcastEpisodes(podcast.id).catch(() => []),
    getPodcasts()
      .then((shows) =>
        shows.filter((show) => show.slug !== podcast.slug).slice(0, 3)
      )
      .catch(() => []),
  ])

  const description = truncateDescription(
    podcast.shortDescription || podcast.description,
    `Listen to ${podcast.title} from WaveNation.`
  )

  const podcastJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'PodcastSeries',
        '@id': absoluteUrl(`/shows/podcasts/${podcast.slug}#podcast`),
        name: podcast.title,
        description,
        url: absoluteUrl(`/shows/podcasts/${podcast.slug}`),
        image: podcast.imageUrl
          ? absoluteUrl(podcast.imageUrl)
          : absoluteUrl(PODCASTS_OG_IMAGE),
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: absoluteUrl('/'),
        },
      },
      {
        '@type': 'WebPage',
        '@id': absoluteUrl(`/shows/podcasts/${podcast.slug}#webpage`),
        name: `${podcast.title} | WaveNation Podcasts`,
        description,
        url: absoluteUrl(`/shows/podcasts/${podcast.slug}`),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        mainEntity: {
          '@id': absoluteUrl(`/shows/podcasts/${podcast.slug}#podcast`),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl(`/shows/podcasts/${podcast.slug}#breadcrumb`),
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shows',
            item: absoluteUrl('/shows'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Podcasts',
            item: absoluteUrl('/shows/podcasts'),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: podcast.title,
            item: absoluteUrl(`/shows/podcasts/${podcast.slug}`),
          },
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="podcast-profile"
      data-podcast-id={String(podcast.id)}
      data-podcast-slug={podcast.slug}
      data-episode-count={episodes.length}
      data-related-count={relatedShows.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(podcastJsonLd) }}
      />

      <ShowProfile
        show={{ ...podcast, episodes }}
        relatedShows={relatedShows}
      />
    </main>
  )
}