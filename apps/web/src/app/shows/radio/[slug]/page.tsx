import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import { getRadioShowBySlug, getRadioShows } from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

const RADIO_SHOWS_OG_IMAGE = '/images/og/wavenation-radio-shows-og.jpg'

type RadioShowPageParams = {
  slug: string
}

type PageProps = {
  params: Promise<RadioShowPageParams> | RadioShowPageParams
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
  const show = await getRadioShowBySlug(slug).catch(() => null)

  if (!show) {
    return {
      metadataBase: getMetadataBase(),
      title: 'Radio Show Not Found | WaveNation',
      description: 'The requested WaveNation FM radio show could not be found.',
      alternates: {
        canonical: `/shows/radio/${encodeURIComponent(slug)}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = truncateDescription(
    show.shortDescription || show.description,
    `Listen to ${show.title} on WaveNation FM.`
  )

  const canonical = `/shows/radio/${show.slug}`

  const image = show.imageUrl
    ? [
        {
          url: show.imageUrl,
          alt: show.title,
        },
      ]
    : [
        {
          url: RADIO_SHOWS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${show.title} on WaveNation FM`,
        },
      ]

  return {
    metadataBase: getMetadataBase(),
    title: `${show.title} | WaveNation Radio`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${show.title} | WaveNation Radio`,
      description,
      type: 'website',
      url: canonical,
      siteName: 'WaveNation',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${show.title} | WaveNation Radio`,
      description,
      images: [show.imageUrl || RADIO_SHOWS_OG_IMAGE],
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

export default async function RadioShowDetailPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params)

  const show = await getRadioShowBySlug(slug).catch(() => null)

  if (!show) {
    notFound()
  }

  const relatedShows = await getRadioShows()
    .then((shows) =>
      shows.filter((related) => related.slug !== show.slug).slice(0, 3)
    )
    .catch(() => [])

  const description = truncateDescription(
    show.shortDescription || show.description,
    `Listen to ${show.title} on WaveNation FM.`
  )

  const radioShowJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RadioSeries',
        '@id': absoluteUrl(`/shows/radio/${show.slug}#series`),
        name: show.title,
        description,
        url: absoluteUrl(`/shows/radio/${show.slug}`),
        image: show.imageUrl
          ? absoluteUrl(show.imageUrl)
          : absoluteUrl(RADIO_SHOWS_OG_IMAGE),
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: absoluteUrl('/'),
        },
      },
      {
        '@type': 'WebPage',
        '@id': absoluteUrl(`/shows/radio/${show.slug}#webpage`),
        name: `${show.title} | WaveNation Radio`,
        description,
        url: absoluteUrl(`/shows/radio/${show.slug}`),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        mainEntity: {
          '@id': absoluteUrl(`/shows/radio/${show.slug}#series`),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl(`/shows/radio/${show.slug}#breadcrumb`),
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
            name: 'Radio Shows',
            item: absoluteUrl('/shows/radio'),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: show.title,
            item: absoluteUrl(`/shows/radio/${show.slug}`),
          },
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="radio-show-profile"
      data-radio-show-id={String(show.id)}
      data-radio-show-slug={show.slug}
      data-related-count={relatedShows.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(radioShowJsonLd) }}
      />

      <ShowProfile show={show} relatedShows={relatedShows} />
    </main>
  )
}