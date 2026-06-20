import type { Metadata } from 'next'
import { DiscoverHub } from '@wavenation/ui-web'
import { RouteAnalytics } from '../components/RouteAnalytics'
import { getDiscoverData } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pagePath = '/discover'
const pageUrl = new URL(pagePath, siteBaseUrl).toString()

const pageTitle = 'Discover | WaveNation'
const pageDescription =
  'Discover WaveNation playlists, moods, current charts, music discovery features, and culture-driven editorial music picks.'

const ogImageUrl = new URL('/images/og/discover.jpg', siteBaseUrl).toString()

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  keywords: [
    'WaveNation Discover',
    'WaveNation playlists',
    'WaveNation charts',
    'music discovery',
    'R&B playlists',
    'hip-hop playlists',
    'southern soul playlists',
    'gospel charts',
    'urban music charts',
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Discover WaveNation playlists, moods, and current music charts.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [ogImageUrl],
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

const discoverJsonLd = {
  '@context': 'https://schema.org',
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
  publisher: {
    '@type': 'Organization',
    name: 'WaveNation Media',
    url: siteBaseUrl,
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'WaveNation music discovery',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Featured Playlists',
        url: new URL('/playlists', siteBaseUrl).toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Current Charts',
        url: new URL('/charts', siteBaseUrl).toString(),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Music Moods',
        url: pageUrl,
      },
    ],
  },
}

export default async function DiscoverPage() {
  const data = await getDiscoverData().catch(() => ({
    featuredPlaylists: [],
    currentCharts: [],
    moods: [],
  }))

  return (
    <>
      <RouteAnalytics
        page="discover"
        route={pagePath}
        section="music_discovery"
        title={pageTitle}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(discoverJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <main className={styles.page}>
        <DiscoverHub
          featuredPlaylists={data.featuredPlaylists}
          currentCharts={data.currentCharts}
          moods={data.moods}
        />
      </main>
    </>
  )
}