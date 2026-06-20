import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { WatchGrid, WatchPageShell } from '@wavenation/ui-web'
import { VODLibraryAnalytics } from './VODLibraryAnalytics'
import { getVODItems } from '@/lib/wavenation-watch'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch/vod'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'VOD Library | WaveNation Watch'
const pageDescription =
  'Watch WaveNation video on demand: films, episodes, documentaries, clips, live replays, creator-led shows, and premium video drops.'

const fallbackOgImage = '/images/og/wavenation-vod.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type WatchGridItem = ComponentProps<typeof WatchGrid>['items'][number]
type WatchImage = NonNullable<WatchGridItem['image']>
type VODItems = Awaited<ReturnType<typeof getVODItems>>

const fallbackWatchImage = {
  url: fallbackOgImage,
  alt: 'WaveNation VOD Library',
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
        alt: 'WaveNation VOD Library',
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

async function getSafeVODItems(): Promise<VODItems> {
  try {
    return await getVODItems({ limit: 96 })
  } catch (error) {
    console.error('[VODLibraryPage] Failed to load VOD items:', error)
    return [] as VODItems
  }
}

function getStructuredData(items: VODItems) {
  const safeItems = Array.isArray(items) ? items : []

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
        '@type': 'VideoGallery',
        '@id': `${pageUrl}#video-gallery`,
        name: 'WaveNation VOD Library',
        url: pageUrl,
        description:
          'WaveNation video-on-demand library featuring original video, creator-led shows, documentaries, replays, clips, and premium drops.',
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: siteBaseUrl,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#vod-list`,
        name: 'WaveNation VOD Items',
        numberOfItems: safeItems.length,
        itemListElement: safeItems.slice(0, 24).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${siteBaseUrl}${item.href}`,
          name: item.title,
        })),
      },
    ],
  } as const
}

export default async function VODLibraryPage() {
  const items = await getSafeVODItems()
  const safeItems = Array.isArray(items) ? items : []

  const gridItems: WatchGridItem[] = safeItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    href: item.href,
    image: item.poster || fallbackWatchImage,
    badge: item.vodType,
    locked: item.access.isLocked,
  }))

  const lockedCount = safeItems.filter((item) => item.access.isLocked).length
  const freeCount = safeItems.length - lockedCount

  return (
    <WatchPageShell
      eyebrow="WaveNation+ / VOD"
      title="Video Library"
      subtitle="Original video, creator-led shows, documentaries, replays, clips, and premium video drops."
    >
      <VODLibraryAnalytics
        itemCount={safeItems.length}
        lockedCount={lockedCount}
        freeCount={freeCount}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(safeItems)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <section className={styles.pageSection}>
        <div className={styles.container}>
          <WatchGrid items={gridItems} />
        </div>
      </section>
    </WatchPageShell>
  )
}