import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { dmcaPolicy } from '@/lib/legal-pages'

const page = dmcaPolicy

const rawSiteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const siteBaseUrl = normalizeSiteBaseUrl(rawSiteBaseUrl)
const socialImagePath = '/images/wavenation-social-card.jpg'
const logoPath = '/images/wavenation-logo.png'

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'DMCA Copyright Policy | WaveNation',
  description: page.description,
  applicationName: 'WaveNation',
  authors: [{ name: 'WaveNation Media' }],
  creator: 'WaveNation Media',
  publisher: 'WaveNation Media',
  category: 'Legal',
  keywords: [
    'WaveNation DMCA policy',
    'WaveNation copyright policy',
    'DMCA copyright policy',
    'copyright infringement',
    'copyright takedown',
    'intellectual property',
    'rights holder notice',
    'WaveNation legal',
    'WaveNation Media',
  ],
  alternates: {
    canonical: '/copyright',
  },
  openGraph: {
    title: 'DMCA Copyright Policy | WaveNation',
    description: page.description,
    url: '/copyright',
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: 'WaveNation DMCA Copyright Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMCA Copyright Policy | WaveNation',
    description: page.description,
    images: [socialImagePath],
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

function normalizeSiteBaseUrl(value: string) {
  const trimmedValue = value.trim().replace(/\/+$/, '')

  if (!trimmedValue) {
    return 'https://wavenation.online'
  }

  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    return trimmedValue
  }

  return `https://${trimmedValue.replace(/^\/+/, '')}`
}

function toAbsoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, `${siteBaseUrl}/`).toString()
  } catch {
    return `${siteBaseUrl}/`
  }
}

function JsonLd() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'DMCA Copyright Policy',
      url: toAbsoluteUrl('/copyright'),
      description: page.description,
      isPartOf: {
        '@type': 'WebSite',
        name: 'WaveNation',
        url: siteBaseUrl,
      },
      about: {
        '@type': 'Thing',
        name: 'DMCA Copyright Policy',
      },
      publisher: {
        '@type': 'Organization',
        name: 'WaveNation Media',
        url: siteBaseUrl,
        logo: {
          '@type': 'ImageObject',
          url: toAbsoluteUrl(logoPath),
        },
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(socialImagePath),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteBaseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'DMCA Copyright Policy',
          item: toAbsoluteUrl('/copyright'),
        },
      ],
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export default function CopyrightPage() {
  return (
    <div
      data-analytics-page="copyright"
      data-analytics-page-title="DMCA Copyright Policy"
      data-analytics-section="legal_page"
    >
      <JsonLd />
      <LegalPage page={page} />
    </div>
  )
}