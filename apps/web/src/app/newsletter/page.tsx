import type { Metadata } from 'next'
import { MarketingPage } from '@wavenation/ui-web'
import { marketingPages } from '@/lib/wavenation-marketing-pages'

const page = marketingPages.newsletter

const route = '/newsletter'
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
  alt: 'Join the WaveNation newsletter',
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const newsletterJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
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
  potentialAction: {
    '@type': 'SubscribeAction',
    name: 'Subscribe to the WaveNation newsletter',
    target: pageUrl,
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
    'WaveNation newsletter',
    'music newsletter',
    'culture newsletter',
    'urban media newsletter',
    'Black culture newsletter',
    'entertainment newsletter',
    'creator updates',
    'WaveNation updates',
    'radio newsletter',
    'events newsletter',
  ],
  applicationName: siteName,
  authors: [{ name: organizationName }],
  creator: organizationName,
  publisher: organizationName,
  category: 'Newsletter',
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

export default function NewsletterPage() {
  return (
    <main
      data-analytics-page="newsletter"
      data-analytics-page-title={page.title}
      data-analytics-page-type="marketing-lead"
      data-analytics-funnel="newsletter"
      data-analytics-conversion="newsletter-subscribe"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(newsletterJsonLd),
        }}
      />

      <MarketingPage config={page} />
    </main>
  )
}