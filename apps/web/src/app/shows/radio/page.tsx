import type { Metadata } from 'next'
import { ShowsDirectory } from '@wavenation/ui-web'
import {
  filterShows,
  getFilterLinks,
  getRadioShows,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

const RADIO_SHOWS_PATH = '/shows/radio'
const RADIO_SHOWS_OG_IMAGE = '/images/og/wavenation-radio-shows-og.jpg'

const pageTitle = 'Radio Shows | WaveNation'
const pageDescription =
  'Browse active WaveNation FM radio shows, syndicated programs, DJs, specialty blocks, and on-air culture programming.'

type RadioShowsPageSearchParams = {
  filter?: string | string[]
}

type PageProps = {
  searchParams?: Promise<RadioShowsPageSearchParams>
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

function buildRadioShowsHref(filter?: string) {
  if (!filter || normalizeValue(filter) === 'all') {
    return RADIO_SHOWS_PATH
  }

  const params = new URLSearchParams()
  params.set('filter', filter)

  return `${RADIO_SHOWS_PATH}?${params.toString()}`
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

function getRadioShowFilterValues(shows: unknown[]) {
  const values = shows.flatMap((show) => [
    ...getStringArrayField(show, 'genres'),
    getStringField(show, 'formatLabel') || '',
    getStringField(show, 'showFormat') || '',
    getStringField(show, 'programmingType') || '',
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
    ? `${filterTitle} Radio Shows | WaveNation FM`
    : pageTitle

  const description = filterTitle
    ? `Browse WaveNation FM ${filterTitle} radio shows, DJs, syndicated programs, specialty blocks, and on-air programming.`
    : pageDescription

  const canonical = buildRadioShowsHref(activeFilter)

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
          url: RADIO_SHOWS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'WaveNation FM radio shows, DJs, and on-air personalities',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [RADIO_SHOWS_OG_IMAGE],
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

export default async function RadioShowsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawFilter = resolvedSearchParams.filter
  const activeFilter = safeFilter(readFirst(rawFilter))

  const shows = await getRadioShows().catch(() => [])
  const filterValues = getRadioShowFilterValues(shows)

  const filteredShows = filterShows(shows, activeFilter)

  const radioShowsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/shows/radio#collection'),
        name: 'WaveNation FM Radio Shows',
        description: pageDescription,
        url: absoluteUrl(buildRadioShowsHref(activeFilter)),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        about: [
          'Radio shows',
          'DJs',
          'On-air personalities',
          'Syndicated programs',
          'Specialty blocks',
          'WaveNation FM',
        ],
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: filteredShows.length,
          itemListElement: filteredShows.map((show, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: show.title,
            url: absoluteUrl(`/shows/radio/${show.slug}`),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl('/shows/radio#breadcrumb'),
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
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="radio-shows-directory"
      data-active-filter={activeFilter ?? 'all'}
      data-radio-show-count={filteredShows.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(radioShowsJsonLd) }}
      />

      <ShowsDirectory
        eyebrow="WaveNation FM"
        title="Radio Shows"
        description="Live, syndicated, and specialty shows built for the WaveNation FM listening experience."
        shows={filteredShows}
        filters={getFilterLinks(
          '/shows/radio',
          'All Radio',
          filterValues,
          activeFilter
        )}
        ctaLabel="View full schedule"
        ctaHref="/schedule"
        emptyTitle="No radio shows found"
        emptyMessage="Try another filter or check back as more WaveNation FM shows are published."
      />
    </main>
  )
}