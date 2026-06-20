import type { Metadata } from 'next'
import { ShowsHub } from '@wavenation/ui-web'
import { getShowsHubData } from '@/lib/wavenation-shows'
import { getFeaturedTalent } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

const SHOWS_PATH = '/shows'
const SHOWS_OG_IMAGE = '/images/og/wavenation-shows-og.jpg'

const pageTitle = 'Shows | WaveNation'
const pageDescription =
  'Browse WaveNation radio shows, podcasts, TV shows, and the talent behind the programming.'

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
  return new URL(pathOrUrl, getSiteUrl()).toString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getArrayLength(value: unknown, key: string) {
  if (!isRecord(value)) {
    return 0
  }

  const field = value[key]

  return Array.isArray(field) ? field.length : 0
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: SHOWS_PATH,
  },
  openGraph: {
    title: 'WaveNation Shows',
    description: 'Radio, podcasts, and TV made for the culture.',
    type: 'website',
    url: SHOWS_PATH,
    siteName: 'WaveNation',
    images: [
      {
        url: SHOWS_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'WaveNation shows, podcasts, TV programming, and talent',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WaveNation Shows',
    description: 'Radio, podcasts, and TV made for the culture.',
    images: [SHOWS_OG_IMAGE],
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

export default async function ShowsPage() {
  const [showsData, talentSpotlight] = await Promise.all([
    getShowsHubData(),
    getFeaturedTalent(4),
  ])

  const featuredShowsCount = getArrayLength(showsData, 'featuredShows')
  const radioShowsCount = getArrayLength(showsData, 'radioShows')
  const podcastsCount = getArrayLength(showsData, 'podcasts')
  const tvShowsCount = getArrayLength(showsData, 'tvShows')

  const showsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/shows#collection'),
        name: 'WaveNation Shows',
        description: pageDescription,
        url: absoluteUrl('/shows'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        about: [
          'Radio shows',
          'Podcasts',
          'TV shows',
          'On-air talent',
          'Culture programming',
        ],
        hasPart: [
          {
            '@type': 'CollectionPage',
            name: 'Radio Shows',
            url: absoluteUrl('/shows/radio'),
          },
          {
            '@type': 'CollectionPage',
            name: 'Podcasts',
            url: absoluteUrl('/shows/podcasts'),
          },
          {
            '@type': 'CollectionPage',
            name: 'TV Shows',
            url: absoluteUrl('/shows/tv'),
          },
          {
            '@type': 'CollectionPage',
            name: 'Talent',
            url: absoluteUrl('/talent'),
          },
          {
            '@type': 'WebPage',
            name: 'Schedule',
            url: absoluteUrl('/schedule'),
          },
          {
            '@type': 'WebPage',
            name: 'Advertise',
            url: absoluteUrl('/advertise'),
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl('/shows#breadcrumb'),
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
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="shows-hub"
      data-featured-shows-count={featuredShowsCount}
      data-radio-shows-count={radioShowsCount}
      data-podcasts-count={podcastsCount}
      data-tv-shows-count={tvShowsCount}
      data-talent-spotlight-count={talentSpotlight.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(showsJsonLd) }}
      />

      <ShowsHub
        {...showsData}
        talentSpotlight={talentSpotlight}
        scheduleHref="/schedule"
        advertiseHref="/advertise"
      />
    </main>
  )
}