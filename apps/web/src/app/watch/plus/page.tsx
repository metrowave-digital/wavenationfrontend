import type { ComponentProps } from 'react'
import type { Metadata } from 'next'
import { WatchGrid, WatchHero, WatchPageShell } from '@wavenation/ui-web'
import { WatchPlusAnalytics } from './WatchPlusAnalytics'
import { getVODItems } from '@/lib/wavenation-watch'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pagePath = '/watch/plus'
const pageUrl = `${siteBaseUrl}${pagePath}`

const pageTitle = 'WaveNation+ | Watch'
const pageDescription =
  'Premium WaveNation+ video, exclusive shows, ad-free experiences, early access, premium replays, and live event access.'

const fallbackOgImage = '/images/og/wavenation-plus.jpg'
const fallbackOgImageUrl = `${siteBaseUrl}${fallbackOgImage}`

type WatchGridItem = ComponentProps<typeof WatchGrid>['items'][number]
type WatchGridImage = NonNullable<WatchGridItem['image']>
type WatchHeroImage = NonNullable<ComponentProps<typeof WatchHero>['image']>
type VODItems = Awaited<ReturnType<typeof getVODItems>>

const fallbackPlusImage = {
  url: fallbackOgImage,
  alt: 'WaveNation Plus',
  width: 1200,
  height: 630,
} as WatchGridImage & WatchHeroImage

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
        alt: 'WaveNation Plus',
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

async function getSafePremiumItems(): Promise<VODItems> {
  try {
    return await getVODItems({ visibility: 'premium', limit: 96 })
  } catch (error) {
    console.error('[WatchPlusPage] Failed to load premium videos:', error)
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
        '@id': `${pageUrl}#plus-gallery`,
        name: 'WaveNation Plus',
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
        '@id': `${pageUrl}#premium-video-list`,
        name: 'WaveNation Plus Videos',
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

export default async function WatchPlusPage() {
  const premium = await getSafePremiumItems()
  const safePremium = Array.isArray(premium) ? premium : []

  const heroImage: ComponentProps<typeof WatchHero>['image'] =
    safePremium[0]?.poster || fallbackPlusImage

  const gridItems: WatchGridItem[] = safePremium.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    href: item.href,
    image: item.poster || fallbackPlusImage,
    badge: 'WaveNation+',
    locked: item.access.isLocked,
  }))

  const lockedCount = safePremium.filter((item) => item.access.isLocked).length

  return (
    <WatchPageShell>
      <WatchPlusAnalytics
        itemCount={safePremium.length}
        lockedCount={lockedCount}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(safePremium)).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />

      <WatchHero
        eyebrow="WaveNation+"
        badge="Premium"
        title="The premium side of the wave."
        subtitle="Exclusive video, early access, premium replays, ad-free viewing options, and special live event windows."
        actions={[
          { label: 'Join Soon', href: '/subscribe', variant: 'primary' },
          { label: 'Sign In', href: '/api/auth/login', variant: 'secondary' },
        ]}
        image={heroImage}
      />

      <section className={styles.pageSection}>
        <div className={styles.container}>
          <WatchGrid
            items={gridItems}
            emptyText="Premium video drops are coming soon."
          />
        </div>
      </section>
    </WatchPageShell>
  )
}