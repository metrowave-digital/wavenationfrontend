import type { Metadata } from 'next'
import { MarketingPage } from '@wavenation/ui-web'
import { marketingPages } from '@/lib/wavenation-marketing-pages'

const page = marketingPages.interviewRequest

const route = '/interview-request'
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
  alt: 'Request an interview with WaveNation',
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const interviewRequestJsonLd = {
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
    '@type': 'CommunicateAction',
    name: 'Request an interview',
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
    'WaveNation interview request',
    'request an interview',
    'artist interview request',
    'creator interview request',
    'radio interview request',
    'podcast interview request',
    'media appearance request',
    'music interview request',
    'culture interview request',
    'WaveNation features',
  ],
  applicationName: siteName,
  authors: [{ name: organizationName }],
  creator: organizationName,
  publisher: organizationName,
  category: 'Interview Requests',
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

export default function InterviewRequestPage() {
  return (
    <main
      data-analytics-page="interview-request"
      data-analytics-page-title={page.title}
      data-analytics-page-type="marketing-lead"
      data-analytics-funnel="interview-request"
      data-analytics-conversion="marketing-inquiry"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(interviewRequestJsonLd),
        }}
      />

      <MarketingPage config={page} />
    </main>
  )
}