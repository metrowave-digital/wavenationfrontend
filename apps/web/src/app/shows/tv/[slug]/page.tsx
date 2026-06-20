import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import { getTvShowBySlug, getTvShows } from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

const TV_SHOWS_OG_IMAGE = '/images/og/wavenation-tv-shows-og.jpg'

type TvShowPageParams = {
  slug: string
}

type PageProps = {
  params: Promise<TvShowPageParams> | TvShowPageParams
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
}: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params)
  const show = await getTvShowBySlug(slug).catch(() => null)

  if (!show) {
    return {
      metadataBase: getMetadataBase(),
      title: 'TV Show Not Found | WaveNation',
      description: 'The requested WaveNation One TV show could not be found.',
      alternates: {
        canonical: `/shows/tv/${encodeURIComponent(slug)}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = truncateDescription(
    show.shortDescription || show.description,
    `Watch ${show.title} on WaveNation One.`
  )

  const canonical = `/shows/tv/${show.slug}`

  const image = show.imageUrl
    ? [
        {
          url: show.imageUrl,
          alt: show.title,
        },
      ]
    : [
        {
          url: TV_SHOWS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${show.title} on WaveNation One`,
        },
      ]

  return {
    metadataBase: getMetadataBase(),
    title: `${show.title} | WaveNation One`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${show.title} | WaveNation One`,
      description,
      type: 'video.tv_show',
      url: canonical,
      siteName: 'WaveNation',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${show.title} | WaveNation One`,
      description,
      images: [show.imageUrl || TV_SHOWS_OG_IMAGE],
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

export default async function TvShowDetailPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params)

  const show = await getTvShowBySlug(slug).catch(() => null)

  if (!show) {
    notFound()
  }

  const relatedShows = await getTvShows()
    .then((shows) =>
      shows.filter((related) => related.slug !== show.slug).slice(0, 3)
    )
    .catch(() => [])

  const description = truncateDescription(
    show.shortDescription || show.description,
    `Watch ${show.title} on WaveNation One.`
  )

  const tvShowJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TVSeries',
        '@id': absoluteUrl(`/shows/tv/${show.slug}#series`),
        name: show.title,
        description,
        url: absoluteUrl(`/shows/tv/${show.slug}`),
        image: show.imageUrl
          ? absoluteUrl(show.imageUrl)
          : absoluteUrl(TV_SHOWS_OG_IMAGE),
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: absoluteUrl('/'),
        },
      },
      {
        '@type': 'WebPage',
        '@id': absoluteUrl(`/shows/tv/${show.slug}#webpage`),
        name: `${show.title} | WaveNation One`,
        description,
        url: absoluteUrl(`/shows/tv/${show.slug}`),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        mainEntity: {
          '@id': absoluteUrl(`/shows/tv/${show.slug}#series`),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl(`/shows/tv/${show.slug}#breadcrumb`),
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
            name: 'TV Shows',
            item: absoluteUrl('/shows/tv'),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: show.title,
            item: absoluteUrl(`/shows/tv/${show.slug}`),
          },
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="tv-show-profile"
      data-tv-show-id={String(show.id)}
      data-tv-show-slug={show.slug}
      data-related-count={relatedShows.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(tvShowJsonLd) }}
      />

      <ShowProfile show={show} relatedShows={relatedShows} />
    </main>
  )
}