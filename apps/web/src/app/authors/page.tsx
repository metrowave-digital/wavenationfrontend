import type { Metadata } from 'next'
import { AuthorsDirectory } from '@wavenation/ui-web'
import { getActiveAuthors, getAuthorBeats } from '@/lib/wavenation-authors'
import styles from './page.module.css'

export const revalidate = 300

const AUTHORS_PAGE_LIMIT = 24
const AUTHORS_PATH = '/authors'
const AUTHORS_OG_IMAGE = '/images/og/wavenation-authors-og.jpg'

const pageTitle = 'Authors & Contributors'
const pageDescription =
  'Meet the active WaveNation authors, staff writers, editors, and contributors amplifying music, culture, sports, film, business, and technology stories.'

type AuthorsPageSearchParams = {
  page?: string | string[]
  beat?: string | string[]
}

type AuthorsPageProps = {
  searchParams?: Promise<AuthorsPageSearchParams>
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
  return new URL(pathOrUrl, getSiteUrl()).toString()
}

function readFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function safePage(value?: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.floor(parsed)
}

function safeBeatSlug(value?: string) {
  const normalized = value?.trim()
  return normalized || undefined
}

function formatSlugTitle(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function buildAuthorsHref({
  page,
  beatSlug,
}: {
  page?: number
  beatSlug?: string
}) {
  const params = new URLSearchParams()

  if (beatSlug) params.set('beat', beatSlug)
  if (page && page > 1) params.set('page', String(page))

  const query = params.toString()
  return query ? `${AUTHORS_PATH}?${query}` : AUTHORS_PATH
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({
  searchParams,
}: AuthorsPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const page = safePage(readFirst(resolvedSearchParams?.page))
  const activeBeatSlug = safeBeatSlug(readFirst(resolvedSearchParams?.beat))

  const beatTitle = activeBeatSlug ? formatSlugTitle(activeBeatSlug) : undefined

  const title = beatTitle
    ? `${beatTitle} Authors & Contributors`
    : page > 1
      ? `${pageTitle} - Page ${page}`
      : pageTitle

  const description = beatTitle
    ? `Meet active WaveNation authors and contributors covering ${beatTitle}, culture, music, entertainment, community, and digital media.`
    : pageDescription

  const canonical = buildAuthorsHref({
    page,
    beatSlug: activeBeatSlug,
  })

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | WaveNation`,
      description,
      type: 'website',
      url: canonical,
      siteName: 'WaveNation',
      images: [
        {
          url: AUTHORS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'WaveNation authors and contributors',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | WaveNation`,
      description,
      images: [AUTHORS_OG_IMAGE],
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

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const resolvedSearchParams = await searchParams
  const page = safePage(readFirst(resolvedSearchParams?.page))
  const activeBeatSlug = safeBeatSlug(readFirst(resolvedSearchParams?.beat))

  const [authorsResponse, beats] = await Promise.all([
    getActiveAuthors({
      page,
      limit: AUTHORS_PAGE_LIMIT,
      beatSlug: activeBeatSlug,
    }),
    getAuthorBeats(),
  ])

  const directoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: absoluteUrl(
      buildAuthorsHref({
        page,
        beatSlug: activeBeatSlug,
      })
    ),
    isPartOf: {
      '@type': 'WebSite',
      name: 'WaveNation',
      url: absoluteUrl('/'),
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: authorsResponse.authors.length,
      itemListElement: authorsResponse.authors.map((author, index) => ({
        '@type': 'ListItem',
        position: (page - 1) * AUTHORS_PAGE_LIMIT + index + 1,
        name: author.fullName,
        url: absoluteUrl(`/authors/${author.slug}`),
      })),
    },
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="authors-directory"
      data-active-beat={activeBeatSlug ?? 'all'}
      data-page-number={page}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(directoryJsonLd) }}
      />

      <AuthorsDirectory
        authors={authorsResponse.authors}
        beats={beats}
        activeBeatSlug={activeBeatSlug}
        pagination={authorsResponse}
        baseHref="/authors"
      />
    </main>
  )
}