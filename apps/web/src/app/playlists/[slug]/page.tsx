import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { PlaylistProfile } from '@wavenation/ui-web'
import { getPlaylistBySlug } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>

type PlaylistSeoShape = {
  title: string
  slug?: string
  seoTitle?: string | null
  seoDescription?: string | null
  shortDescription?: string | null
  description?: string | null
  coverArt?: unknown
  heroImage?: unknown
  genres?: unknown
  moods?: unknown
  tracks?: unknown
  curatorName?: string | null
  platformLinks?: unknown
  isSponsored?: boolean | null
  sponsorName?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
}

const routeBase = '/playlists'
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

function getMediaAlt(media: unknown, fallback: string) {
  if (!media || typeof media !== 'object') return fallback

  const value = (media as { alt?: unknown }).alt
  return typeof value === 'string' && value.trim() ? value : fallback
}

function getMediaNumber(media: unknown, key: 'width' | 'height') {
  if (!media || typeof media !== 'object') return undefined

  const value = (media as Record<string, unknown>)[key]
  return typeof value === 'number' ? value : undefined
}

function getPreferredMedia(...mediaItems: unknown[]) {
  return mediaItems.find((item) => Boolean(getMediaUrl(item)))
}

function buildSocialImage(media: unknown, fallbackAlt: string) {
  const mediaUrl = getMediaUrl(media)

  return {
    url: mediaUrl || socialImage.url,
    width: getMediaNumber(media, 'width') || socialImage.width,
    height: getMediaNumber(media, 'height') || socialImage.height,
    alt: mediaUrl ? getMediaAlt(media, fallbackAlt) : socialImage.alt,
  }
}

function getDescription(playlist: PlaylistSeoShape) {
  return (
    playlist.seoDescription ||
    playlist.shortDescription ||
    playlist.description ||
    `Listen to ${playlist.title} from WaveNation.`
  )
}

function getNameList(items: unknown) {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => {
      if (typeof item === 'string') return item

      if (item && typeof item === 'object') {
        const value = (item as { name?: unknown }).name
        return typeof value === 'string' ? value : undefined
      }

      return undefined
    })
    .filter((item): item is string => Boolean(item))
}

function getTrackCount(tracks: unknown) {
  return Array.isArray(tracks) ? tracks.length : undefined
}

function getFirstPlatformUrl(platformLinks: unknown) {
  if (!Array.isArray(platformLinks)) return undefined

  for (const item of platformLinks) {
    if (typeof item === 'string' && item.trim()) return item

    if (item && typeof item === 'object') {
      const value = (item as { url?: unknown }).url

      if (typeof value === 'string' && value.trim()) return value
    }
  }

  return undefined
}

function AnalyticsEventScript({
  id,
  eventName,
  payload,
}: {
  id: string
  eventName: string
  payload: AnalyticsPayload
}) {
  const safeEventName = JSON.stringify(eventName)
  const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c')

  return (
    <Script
      id={id}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            var eventName = ${safeEventName};
            var payload = ${safePayload};

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(Object.assign({ event: eventName }, payload));

            if (typeof window.gtag === 'function') {
              window.gtag('event', eventName, payload);
            }

            if (window.posthog && typeof window.posthog.capture === 'function') {
              window.posthog.capture(eventName, payload);
            }
          })();
        `,
      }}
    />
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const playlist = await getPlaylistBySlug(slug).catch(() => null)

  if (!playlist) {
    return {
      metadataBase: new URL(siteBaseUrl),
      title: 'Playlist Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const seoPlaylist = playlist as PlaylistSeoShape
  const pagePath = `${routeBase}/${seoPlaylist.slug || slug}`
  const pageUrl = `${siteBaseUrl}${pagePath}`

  const title = seoPlaylist.seoTitle || seoPlaylist.title
  const fullTitle = seoPlaylist.seoTitle
    ? seoPlaylist.seoTitle
    : `${seoPlaylist.title} | WaveNation Playlists`

  const description = getDescription(seoPlaylist)
  const preferredImage = getPreferredMedia(seoPlaylist.coverArt, seoPlaylist.heroImage)
  const image = buildSocialImage(preferredImage, `${seoPlaylist.title} playlist on WaveNation`)

  const imageUrl = absoluteUrl(image.url) || `${siteBaseUrl}${socialImage.url}`
  const genres = getNameList(seoPlaylist.genres)
  const moods = getNameList(seoPlaylist.moods)

  return {
    metadataBase: new URL(siteBaseUrl),
    title,
    description,
    alternates: {
      canonical: pagePath,
    },
    keywords: [
      seoPlaylist.title,
      'WaveNation playlist',
      'curated playlist',
      'music discovery',
      'R&B playlist',
      'hip-hop playlist',
      'gospel playlist',
      'Southern Soul playlist',
      'house music playlist',
      ...genres.map((genre) => `${genre} playlist`),
      ...moods.map((mood) => `${mood} playlist`),
    ],
    applicationName: siteName,
    authors: [{ name: organizationName }],
    creator: seoPlaylist.curatorName || organizationName,
    publisher: organizationName,
    category: 'Music',
    openGraph: {
      title: fullTitle,
      description,
      url: pagePath,
      siteName,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          alt: image.alt,
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
    other: {
      'og:see_also': `${siteBaseUrl}/playlists`,
      'music:creator': seoPlaylist.curatorName || organizationName,
      'music:playlist': pageUrl,
    },
  }
}

export default async function PlaylistDetailPage({ params }: PageProps) {
  const { slug } = await params
  const playlist = await getPlaylistBySlug(slug).catch(() => null)

  if (!playlist) notFound()

  const seoPlaylist = playlist as PlaylistSeoShape
  const playlistSlug = seoPlaylist.slug || slug
  const pagePath = `${routeBase}/${playlistSlug}`
  const pageUrl = `${siteBaseUrl}${pagePath}`

  const description = getDescription(seoPlaylist)
  const preferredImage = getPreferredMedia(seoPlaylist.coverArt, seoPlaylist.heroImage)
  const imageUrl = absoluteUrl(getMediaUrl(preferredImage) || socialImage.url)

  const genres = getNameList(seoPlaylist.genres)
  const moods = getNameList(seoPlaylist.moods)
  const trackCount = getTrackCount(seoPlaylist.tracks)
  const firstPlatformUrl = getFirstPlatformUrl(seoPlaylist.platformLinks)

  const playlistJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${seoPlaylist.title} | WaveNation Playlists`,
        description,
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
          '@id': `${pageUrl}#playlist`,
        },
      },
      {
        '@type': 'MusicPlaylist',
        '@id': `${pageUrl}#playlist`,
        name: seoPlaylist.title,
        url: pageUrl,
        description,
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(genres.length > 0 ? { genre: genres } : {}),
        ...(moods.length > 0 ? { keywords: moods.join(', ') } : {}),
        ...(typeof trackCount === 'number' ? { numTracks: trackCount } : {}),
        creator: seoPlaylist.curatorName
          ? {
              '@type': 'Person',
              name: seoPlaylist.curatorName,
            }
          : {
              '@type': 'Organization',
              name: organizationName,
            },
        publisher: {
          '@type': 'Organization',
          name: organizationName,
          url: siteBaseUrl,
        },
        ...(firstPlatformUrl
          ? {
              potentialAction: {
                '@type': 'ListenAction',
                name: `Listen to ${seoPlaylist.title}`,
                target: firstPlatformUrl,
              },
            }
          : {}),
        ...(seoPlaylist.isSponsored && seoPlaylist.sponsorName
          ? {
              sponsor: {
                '@type': 'Organization',
                name: seoPlaylist.sponsorName,
              },
            }
          : {}),
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
          {
            '@type': 'ListItem',
            position: 3,
            name: seoPlaylist.title,
            item: pageUrl,
          },
        ],
      },
    ],
  }

  return (
    <>
      <AnalyticsEventScript
        id="wavenation-playlist-detail-page-analytics"
        eventName="playlist_detail_view"
        payload={{
          page_type: 'playlist_detail',
          page_path: pagePath,
          playlist_slug: playlistSlug,
          playlist_title: seoPlaylist.title,
          curator_name: seoPlaylist.curatorName || null,
          is_sponsored: seoPlaylist.isSponsored || false,
          sponsor_name: seoPlaylist.sponsorName || null,
          track_count: typeof trackCount === 'number' ? trackCount : null,
          genre_count: genres.length,
          mood_count: moods.length,
          has_platform_link: Boolean(firstPlatformUrl),
        }}
      />

      <main
        className={styles.page}
        data-analytics-page="playlist-detail"
        data-analytics-page-title={seoPlaylist.title}
        data-analytics-page-type="music-detail"
        data-analytics-content-group="Music"
        data-analytics-funnel="music-discovery"
        data-analytics-playlist-slug={playlistSlug}
        data-analytics-playlist-sponsored={seoPlaylist.isSponsored ? 'true' : 'false'}
        data-analytics-track-count={
          typeof trackCount === 'number' ? String(trackCount) : undefined
        }
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(playlistJsonLd),
          }}
        />

        <PlaylistProfile playlist={playlist} />
      </main>
    </>
  )
}