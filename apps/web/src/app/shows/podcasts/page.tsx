import type { Metadata } from 'next'
import { ShowsDirectory } from '@wavenation/ui-web'
import {
  filterShows,
  getFilterLinks,
  getPodcasts,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

const PODCASTS_PATH = '/shows/podcasts'
const PODCASTS_OG_IMAGE = '/images/og/wavenation-podcasts-og.jpg'

const pageTitle = 'Podcasts | WaveNation'
const pageDescription =
  'Browse WaveNation podcasts, on-demand conversations, culture shows, and original storytelling series.'

type PodcastsPageSearchParams = {
  filter?: string | string[]
}

type PageProps = {
  searchParams?: Promise<PodcastsPageSearchParams> | PodcastsPageSearchParams
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

function buildPodcastsHref(filter?: string) {
  if (!filter || normalizeValue(filter) === 'all') {
    return PODCASTS_PATH
  }

  const params = new URLSearchParams()
  params.set('filter', filter)

  return `${PODCASTS_PATH}?${params.toString()}`
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

function getPodcastFilterValues(podcasts: unknown[]) {
  const values = podcasts.flatMap((show) => [
    ...getStringArrayField(show, 'categories'),
    getStringField(show, 'formatLabel') || '',
    getStringField(show, 'podcastFormat') || '',
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
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const activeFilter = safeFilter(readFirst(resolvedSearchParams.filter))
  const filterTitle = activeFilter ? formatFilterTitle(activeFilter) : undefined

  const title = filterTitle
    ? `${filterTitle} Podcasts | WaveNation`
    : pageTitle

  const description = filterTitle
    ? `Browse WaveNation ${filterTitle} podcasts, interviews, conversations, culture shows, and original audio storytelling.`
    : pageDescription

  const canonical = buildPodcastsHref(activeFilter)

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
          url: PODCASTS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'WaveNation podcast network',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [PODCASTS_OG_IMAGE],
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

export default async function PodcastsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})

  const rawFilter = resolvedSearchParams.filter
  const activeFilter = safeFilter(readFirst(rawFilter))

  const podcasts = await getPodcasts().catch(() => [])
  const filterValues = getPodcastFilterValues(podcasts)

  const filteredPodcasts = filterShows(podcasts, activeFilter)

  const podcastsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/shows/podcasts#collection'),
        name: 'WaveNation Podcasts',
        description: pageDescription,
        url: absoluteUrl(buildPodcastsHref(activeFilter)),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        about: [
          'Podcasts',
          'Culture conversations',
          'Music interviews',
          'On-demand audio',
          'Original storytelling',
        ],
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: filteredPodcasts.length,
          itemListElement: filteredPodcasts.map((show, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: show.title,
            url: absoluteUrl(`/shows/podcasts/${show.slug}`),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': absoluteUrl('/shows/podcasts#breadcrumb'),
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
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="podcasts-directory"
      data-active-filter={activeFilter ?? 'all'}
      data-podcast-count={filteredPodcasts.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(podcastsJsonLd) }}
      />

      <ShowsDirectory
        eyebrow="Podcast Network"
        title="Podcasts"
        description="On-demand shows, interviews, commentary, and original audio storytelling from the WaveNation ecosystem."
        shows={filteredPodcasts}
        filters={getFilterLinks(
          '/shows/podcasts',
          'All Podcasts',
          filterValues,
          activeFilter
        )}
        ctaLabel="View full schedule"
        ctaHref="/schedule"
        emptyTitle="No podcasts found"
        emptyMessage="Try another filter or check back as new WaveNation podcasts are published."
      />
    </main>
  )
}