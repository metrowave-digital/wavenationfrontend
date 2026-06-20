import type { Metadata } from 'next'
import Link from 'next/link'
import { MusicCard, MusicFilterTabs } from '@wavenation/ui-web'
import {
  PLAYLIST_TYPE_OPTIONS,
  buildPaginationHref,
  filterPlaylists,
  getActiveMoods,
  getFeaturedPlaylists,
  getPlaylists,
  paginateItems,
} from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams> | SearchParams
}

const route = '/playlists'
const siteName = 'WaveNation'
const organizationName = 'WaveNation Media'

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const socialImage = {
  url: '/images/wavenation-social-card.jpg',
  width: 1200,
  height: 630,
  alt: 'WaveNation curated playlists and music discovery',
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function readParam(params: SearchParams, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function pageFrom(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function normalizePlaylistType(value?: string) {
  if (!value || value === 'all') return 'all'

  return PLAYLIST_TYPE_OPTIONS.some((option) => option.value === value)
    ? value
    : 'all'
}

function formatMoodLabel(slug?: string) {
  if (!slug) return undefined

  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildRouteWithSearch(
  pathname: string,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })

  const query = search.toString()
  return query ? `${pathname}?${query}` : pathname
}

function absoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return undefined

  try {
    return new URL(pathOrUrl, siteBaseUrl).toString()
  } catch {
    return undefined
  }
}

function getMediaUrl(media: unknown) {
  if (typeof media === 'string') return media

  if (!media || typeof media !== 'object') return undefined

  const value = (media as { url?: unknown }).url
  return typeof value === 'string' && value.trim() ? value : undefined
}

function getPlaylistTypeLabel(type: string) {
  return PLAYLIST_TYPE_OPTIONS.find((option) => option.value === type)?.label
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : {}

  const type = normalizePlaylistType(readParam(params, 'type'))
  const mood = readParam(params, 'mood') || undefined
  const page = pageFrom(readParam(params, 'page'))

  const typeLabel = type !== 'all' ? getPlaylistTypeLabel(type) : undefined
  const moodLabel = formatMoodLabel(mood)

  const titleParts = [typeLabel, moodLabel].filter(Boolean)
  const metadataTitle =
    titleParts.length > 0 ? `${titleParts.join(' + ')} Playlists` : 'Playlists'

  const title = page > 1 ? `${metadataTitle} - Page ${page}` : metadataTitle

  const description =
    titleParts.length > 0
      ? `Browse ${titleParts.join(' and ')} playlists from WaveNation, featuring curated music collections, cultural moments, show companions, and mood-based discovery.`
      : 'Browse curated WaveNation playlists by type, mood, genre, and cultural moment.'

  const canonical = buildRouteWithSearch(route, {
    type: type !== 'all' ? type : undefined,
    mood,
    page: page > 1 ? String(page) : undefined,
  })

  const fullTitle =
    title === 'Playlists' ? 'Playlists | WaveNation' : `${title} | WaveNation`

  return {
    metadataBase: new URL(siteBaseUrl),
    title,
    description,
    alternates: {
      canonical,
    },
    keywords: [
      'WaveNation playlists',
      'curated playlists',
      'music discovery',
      'R&B playlists',
      'hip-hop playlists',
      'gospel playlists',
      'Southern Soul playlists',
      'house music playlists',
      'culture playlists',
      'urban music playlists',
      typeLabel ? `${typeLabel} playlists` : undefined,
      moodLabel ? `${moodLabel} playlists` : undefined,
    ].filter((keyword): keyword is string => Boolean(keyword)),
    applicationName: siteName,
    authors: [{ name: organizationName }],
    creator: organizationName,
    publisher: organizationName,
    category: 'Music',
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName,
      type: 'website',
      locale: 'en_US',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [
        {
          url: socialImage.url,
          alt: socialImage.alt,
        },
      ],
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

export default async function PlaylistsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}

  const type = normalizePlaylistType(readParam(params, 'type'))
  const mood = readParam(params, 'mood') || undefined
  const page = pageFrom(readParam(params, 'page'))
  const pageSize = 18

  const [playlistResult, featuredPlaylists, moods] = await Promise.all([
    getPlaylists({ limit: 100 }),
    getFeaturedPlaylists(1),
    getActiveMoods(50),
  ])

  const playlists = Array.isArray(playlistResult.docs)
    ? playlistResult.docs
    : []

  const filteredPlaylists = filterPlaylists(playlists, {
    playlistType: type === 'all' ? undefined : type,
    moodSlug: mood,
  })

  const paginated = paginateItems(filteredPlaylists, page, pageSize)
  const featured = featuredPlaylists[0]

  const canonicalPath = buildRouteWithSearch(route, {
    type: type !== 'all' ? type : undefined,
    mood,
    page: paginated.page > 1 ? String(paginated.page) : undefined,
  })

  const pageUrl = `${siteBaseUrl}${canonicalPath}`

  const typeTabs = [
    { label: 'All', href: '/playlists', isActive: type === 'all' && !mood },
    ...PLAYLIST_TYPE_OPTIONS.map((option) => ({
      label: option.label,
      href: `/playlists?type=${option.value}`,
      isActive: type === option.value,
    })),
  ]

  const moodTabs = [
    {
      label: 'All Moods',
      href: type !== 'all' ? `/playlists?type=${type}` : '/playlists',
      isActive: !mood,
    },
    ...moods.flatMap((item) => {
      const moodSlug = item.slug

      if (!moodSlug) return []

      return [
        {
          label: item.name,
          href: `/playlists?${new URLSearchParams({
            ...(type !== 'all' ? { type } : {}),
            mood: moodSlug,
          }).toString()}`,
          isActive: mood === moodSlug,
        },
      ]
    }),
  ]

  const playlistsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: 'WaveNation Playlists',
        description:
          'Browse curated WaveNation playlists by type, mood, genre, and cultural moment.',
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteBaseUrl}/#website`,
          name: siteName,
          url: siteBaseUrl,
        },
        publisher: {
          '@type': 'Organization',
          '@id': `${siteBaseUrl}/#organization`,
          name: organizationName,
          url: siteBaseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteBaseUrl}${socialImage.url}`,
            width: socialImage.width,
            height: socialImage.height,
          },
        },
        mainEntity: {
          '@id': `${pageUrl}#playlist-list`,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#playlist-list`,
        name: 'WaveNation playlist results',
        numberOfItems: paginated.docs.length,
        itemListElement: paginated.docs.map((playlist, index) => {
          const playlistUrl = `${siteBaseUrl}/playlists/${playlist.slug}`
          const imageUrl = absoluteUrl(
            getMediaUrl(playlist.coverArt) || getMediaUrl(playlist.heroImage),
          )

          return {
            '@type': 'ListItem',
            position: index + 1,
            url: playlistUrl,
            item: {
              '@type': 'MusicPlaylist',
              '@id': `${playlistUrl}#playlist`,
              name: playlist.title,
              url: playlistUrl,
              description:
                playlist.shortDescription ||
                playlist.description ||
                'A curated playlist from WaveNation.',
              ...(imageUrl ? { image: imageUrl } : {}),
              creator: playlist.curatorName
                ? {
                    '@type': 'Person',
                    name: playlist.curatorName,
                  }
                : {
                    '@type': 'Organization',
                    name: organizationName,
                  },
            },
          }
        }),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${siteBaseUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Playlists',
            item: `${siteBaseUrl}/playlists`,
          },
        ],
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="playlists"
      data-analytics-page-title="Playlists"
      data-analytics-page-type="music-directory"
      data-analytics-content-group="Music"
      data-analytics-funnel="music-discovery"
      data-analytics-filter-type={type}
      data-analytics-filter-mood={mood || 'all'}
      data-analytics-page-number={String(paginated.page)}
      data-analytics-results-count={String(paginated.totalDocs)}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(playlistsJsonLd),
        }}
      />

      <section className={styles.hero} data-analytics-region="playlists-hero">
        <p>WaveNation Playlists</p>
        <h1>Curated sound for every mood.</h1>
        <span>
          Editorial playlists, mood-based collections, sponsored placements, show
          companions, and culture-first music discovery from the WaveNation
          music team.
        </span>
        <div className={styles.heroActions}>
          <Link href="/discover" data-analytics-cta="discover">
            Discover
          </Link>
          <Link href="/charts" data-analytics-cta="view-charts">
            View Charts
          </Link>
        </div>
      </section>

      {featured ? (
        <section
          className={styles.featured}
          data-analytics-region="featured-playlist"
          data-analytics-playlist-slug={featured.slug}
        >
          <MusicCard
            href={`/playlists/${featured.slug}`}
            title={featured.title}
            eyebrow="Featured Playlist"
            description={featured.shortDescription || featured.description}
            image={featured.heroImage || featured.coverArt}
            meta={
              featured.curatorName
                ? `Curated by ${featured.curatorName}`
                : featured.updateCadenceLabel
            }
            badge={featured.isSponsored ? 'Sponsored' : 'Featured'}
            accent={featured.accentColor}
            variant="feature"
          />
        </section>
      ) : null}

      <section className={styles.filters} data-analytics-region="playlist-filters">
        <div>
          <p>Playlist Type</p>
          <MusicFilterTabs label="Playlist type filters" tabs={typeTabs} />
        </div>
        <div>
          <p>Moods</p>
          <MusicFilterTabs label="Mood filters" tabs={moodTabs} />
        </div>
      </section>

      <section className={styles.results} data-analytics-region="playlist-results">
        <div className={styles.resultsHeader}>
          <p>{paginated.totalDocs} playlists</p>
          <h2>Browse playlists</h2>
        </div>

        {paginated.docs.length > 0 ? (
          <div className={styles.grid}>
            {paginated.docs.map((playlist) => (
              <MusicCard
                key={playlist.slug}
                href={`/playlists/${playlist.slug}`}
                title={playlist.title}
                eyebrow={playlist.playlistTypeLabel}
                description={playlist.shortDescription || playlist.description}
                image={playlist.coverArt || playlist.heroImage}
                meta={
                  playlist.curatorName
                    ? `Curated by ${playlist.curatorName}`
                    : playlist.updateCadenceLabel
                }
                badge={
                  playlist.isSponsored
                    ? 'Sponsored'
                    : playlist.isFeatured
                      ? 'Featured'
                      : undefined
                }
                accent={playlist.accentColor}
                tags={[
                  ...(playlist.moods?.map((item) => item.name) ?? []),
                  ...(playlist.genres?.map((item) => item.name) ?? []),
                ]}
                platformLinks={playlist.platformLinks}
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No playlists match this filter yet.</p>
        )}

        <div className={styles.pagination}>
          {paginated.hasPrevPage ? (
            <Link
              href={buildPaginationHref(
                '/playlists',
                {
                  type: type !== 'all' ? type : undefined,
                  mood,
                },
                paginated.page - 1,
              )}
              data-analytics-cta="previous-page"
            >
              Previous
            </Link>
          ) : null}

          <span>
            Page {paginated.page} of {paginated.totalPages}
          </span>

          {paginated.hasNextPage ? (
            <Link
              href={buildPaginationHref(
                '/playlists',
                {
                  type: type !== 'all' ? type : undefined,
                  mood,
                },
                paginated.page + 1,
              )}
              data-analytics-cta="next-page"
            >
              Next
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}