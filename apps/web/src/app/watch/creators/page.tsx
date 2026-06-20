import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { WatchGrid, WatchPageShell } from '@wavenation/ui-web'
import { CreatorVideoAnalytics } from './CreatorVideoAnalytics'
import { getVODItems } from '@/lib/wavenation-watch'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch/creators'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'Creator Video | WaveNation Watch'
const pageDescription =
  'Creator Hub video, partner content, interviews, showcases, workshops, community stories, and creator-led drops.'

const fallbackOgImage = '/images/og/wavenation-creators.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type WatchGridItem = ComponentProps<typeof WatchGrid>['items'][number]
type WatchImage = NonNullable<WatchGridItem['image']>
type VODItems = Awaited<ReturnType<typeof getVODItems>>

const fallbackWatchImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Creator Video',
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
        alt: 'WaveNation Creator Video',
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

async function getSafeCreatorItems(): Promise<VODItems> {
  try {
    return await getVODItems({ source: 'creator', limit: 96 })
  } catch (error) {
    console.error('[CreatorVideoPage] Failed to load creator video:', error)
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
        '@id': `${pageUrl}#creator-video-gallery`,
        name: 'WaveNation Creator Video',
        url: pageUrl,
        description: pageDescription,
        publisher: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: siteBaseUrl,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#creator-video-list`,
        name: 'WaveNation Creator Videos',
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

export default async function CreatorVideoPage() {
  const items = await getSafeCreatorItems()
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

  return (
    <WatchPageShell
      eyebrow="Creator Hub"
      title="Creator Video"
      subtitle="Creator-led video, showcases, workshops, interviews, and community-powered storytelling."
    >
      <CreatorVideoAnalytics
        itemCount={safeItems.length}
        lockedCount={lockedCount}
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
          <WatchGrid
            items={gridItems}
            emptyText="Creator video is coming soon."
          />
        </div>
      </section>
    </WatchPageShell>
  )
}