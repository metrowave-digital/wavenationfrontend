import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { WatchGrid, WatchPageShell } from '@wavenation/ui-web'
import { WatchShowsAnalytics } from './WatchShowsAnalytics'
import { getTVShows } from '@/lib/wavenation-watch'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch/shows'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'TV Shows | WaveNation Watch'
const pageDescription =
  'Browse WaveNation TV shows, series, specials, documentaries, creator programming, music blocks, and original video programming.'

const fallbackOgImage = '/images/og/wavenation-shows.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type WatchGridItem = ComponentProps<typeof WatchGrid>['items'][number]
type WatchImage = NonNullable<WatchGridItem['image']>
type TVShows = Awaited<ReturnType<typeof getTVShows>>

const fallbackWatchImage = {
  url: fallbackOgImage,
  alt: 'WaveNation TV Shows',
  width: 1200,
  height: 630,
} as WatchImage

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  applicationName: 'WaveNation',
  authors: [{ name: 'WaveNation Media' }],
  creator: 'WaveNation Media',
  publisher: 'WaveNation Media',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: fallbackOgImage,
        width: 1200,
        height: 630,
        alt: 'WaveNation TV Shows',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [fallbackOgImage],
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

async function getSafeTVShows(): Promise<TVShows> {
  try {
    return await getTVShows({ limit: 72 })
  } catch (error) {
    console.error('[WatchShowsPage] Failed to load TV shows:', error)
    return [] as TVShows
  }
}

function getStructuredData(shows: TVShows) {
  const safeShows = Array.isArray(shows) ? shows : []

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: siteBaseUrl,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: fallbackOgImageUrl,
          width: 1200,
          height: 630,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#shows-list`,
        name: 'WaveNation TV Shows',
        numberOfItems: safeShows.length,
        itemListElement: safeShows.slice(0, 24).map((show, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${siteBaseUrl}${show.href}`,
          name: show.title,
        })),
      },
    ],
  } as const
}

export default async function WatchShowsPage() {
  const shows = await getSafeTVShows()
  const safeShows = Array.isArray(shows) ? shows : []

  const gridItems: WatchGridItem[] = safeShows.map((show) => ({
    id: show.id,
    title: show.title,
    description: show.description,
    href: show.href,
    image: show.posterArt || show.heroBanner || fallbackWatchImage,
    badge: show.showStatus,
  }))

  return (
    <WatchPageShell
      eyebrow="WaveNation One"
      title="TV Shows"
      subtitle="Original series, creator shows, specials, music blocks, documentaries, and live-event programming."
    >
      <WatchShowsAnalytics showCount={safeShows.length} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(safeShows)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <section className={styles.pageSection}>
        <div className={styles.container}>
          <WatchGrid
            items={gridItems}
            emptyText="No TV shows are published yet."
          />
        </div>
      </section>
    </WatchPageShell>
  )
}