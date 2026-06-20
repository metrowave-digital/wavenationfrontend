import type { Metadata } from 'next'
import { ShowsDirectory } from '@wavenation/ui-web'
import {
  filterShows,
  getFilterLinks,
  getTvShows,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

const TV_SHOWS_PATH = '/shows/tv'
const TV_SHOWS_OG_IMAGE = '/images/og/wavenation-tv-shows-og.jpg'

const pageTitle = 'TV Shows | WaveNation'
const pageDescription =
  'Browse WaveNation One TV shows, video series, talk shows, visual interviews, music features, and original programming.'

type TvShowsPageSearchParams = {
  filter?: string | string[]
}

type PageProps = {
  searchParams?: Promise<TvShowsPageSearchParams>
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

function readFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function safeFilter(value?: string) {
  const normalized = value?.trim()
  return normalized || undefined
}

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase()
}

function formatFilterTitle(filter: string) {
  return filter
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function buildTvShowsHref(filter?: string) {
  if (!filter || normalizeValue(filter) === 'all') {
    return TV_SHOWS_PATH
  }

  const params = new URLSearchParams()
  params.set('filter', filter)

  return `${TV_SHOWS_PATH}?${params.toString()}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getStringField(value: unknown, key: string) {
  if (!isRecord(value)) return undefined

  const field = value[key]
  return typeof field === 'string' ? field : undefined
}

function getStringArrayField(value: unknown, key: string) {
  if (!isRecord(value)) return []

  const field = value[key]

  if (!Array.isArray(field)) return []

  return field.filter((item): item is string => typeof item === 'string')
}

function getTvShowFilterValues(tvShows: unknown[]) {
  const values = tvShows.flatMap((show) => [
    ...getStringArrayField(show, 'genres'),
    getStringField(show, 'formatLabel') || '',
    getStringField(show, 'showFormat') || '',
    getStringField(show, 'format') || '',
  ])

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value): value is string => Boolean(value))
    )
  )
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const activeFilter = safeFilter(readFirst(resolvedSearchParams.filter))
  const filterTitle = activeFilter ? formatFilterTitle(activeFilter) : undefined

  const title = filterTitle
    ? `${filterTitle} TV Shows | WaveNation One`
    : pageTitle

  const description = filterTitle
    ? `Browse WaveNation One ${filterTitle} TV shows, video series, visual interviews, talk shows, and original programming.`
    : pageDescription

  const canonical = buildTvShowsHref(activeFilter)

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: 'WaveNation',
      images: [
        {
          url: TV_SHOWS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'WaveNation One TV shows and original programming',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [TV_SHOWS_OG_IMAGE],
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

export default async function TvShowsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawFilter = resolvedSearchParams.filter
  const activeFilter = safeFilter(readFirst(rawFilter))

  const tvShows = await getTvShows().catch(() => [])
  const filterValues = getTvShowFilterValues(tvShows)

  const filteredShows = filterShows(tvShows, activeFilter)

  const tvShowsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/shows/tv#collection'),
        name: 'WaveNation One TV Shows',
        description: pageDescription,
        url: absoluteUrl(buildTvShowsHref(activeFilter)),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        about: [
          'TV shows',
          'Video series',
          'Talk shows',
          'Visual interviews',
          'Original programming',
          'WaveNation One',
        ],
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: filteredShows.length,
          itemListElement: filteredShows.map((show, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: show.title,
            url: absoluteUrl(`/shows/tv/${show.slug}`),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl('/shows/tv#breadcrumb'),
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
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="tv-shows-directory"
      data-active-filter={activeFilter ?? 'all'}
      data-tv-show-count={filteredShows.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(tvShowsJsonLd) }}
      />

      <ShowsDirectory
        eyebrow="WaveNation One"
        title="TV Shows"
        description="Video-first programming, visual interviews, talk shows, music features, and original series for WaveNation screens."
        shows={filteredShows}
        filters={getFilterLinks(
          '/shows/tv',
          'All TV',
          filterValues,
          activeFilter
        )}
        ctaLabel="View full schedule"
        ctaHref="/schedule"
        emptyTitle="No TV shows found"
        emptyMessage="Try another filter or check back as more WaveNation One shows are published."
      />
    </main>
  )
}