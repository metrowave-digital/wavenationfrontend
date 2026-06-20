import type { Metadata } from 'next'
import { MarketingPage } from '@wavenation/ui-web'
import { marketingPages } from '@/lib/wavenation-marketing-pages'

const page = marketingPages.creatorResources

const route = '/creator-resources'
const siteName = 'WaveNation'
const organizationName = 'WaveNation Media'

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pageUrl = `${siteBaseUrl}${route}`

const pageTitle = page.seoTitle || page.title
const pageDescription = page.seoDescription || page.description

const socialImage = {
  url: '/images/wavenation-social-card.jpg',
  width: 1200,
  height: 630,
  alt: 'WaveNation Creator Resources',
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const creatorResourcesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${pageUrl}#webpage`,
  url: pageUrl,
  name: pageTitle,
  description: pageDescription,
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${siteBaseUrl}/#website`,
    name: siteName,
    url: siteBaseUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: organizationName,
    url: siteBaseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteBaseUrl}${socialImage.url}`,
      width: socialImage.width,
      height: socialImage.height,
    },
  },
  about: [
    {
      '@type': 'Thing',
      name: 'Creator resources',
    },
    {
      '@type': 'Thing',
      name: 'Independent artists',
    },
    {
      '@type': 'Thing',
      name: 'Podcasters',
    },
    {
      '@type': 'Thing',
      name: 'Digital media creators',
    },
  ],
  mainEntity: {
    '@type': 'ItemList',
    name: 'WaveNation Creator Resources',
    description:
      'Resources, tools, opportunities, and future partner recommendations for artists, podcasters, DJs, filmmakers, writers, and digital creators.',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: route,
  },
  keywords: [
    'WaveNation creator resources',
    'creator tools',
    'artist resources',
    'podcast resources',
    'DJ resources',
    'filmmaker resources',
    'digital creator resources',
    'music creator tools',
    'independent artist resources',
    'creator economy resources',
  ],
  applicationName: siteName,
  authors: [{ name: organizationName }],
  creator: organizationName,
  publisher: organizationName,
  category: 'Creator Resources',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: route,
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [socialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
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

export default function CreatorResourcesPage() {
  return (
    <main
      data-analytics-page="creator-resources"
      data-analytics-page-title={page.title}
      data-analytics-page-type="marketing-lead"
      data-analytics-funnel="creator-resources"
      data-analytics-conversion="marketing-inquiry"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(creatorResourcesJsonLd),
        }}
      />

      <MarketingPage config={page} />
    </main>
  )
}