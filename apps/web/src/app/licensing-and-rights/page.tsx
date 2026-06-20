import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { licensingAndRights } from '@/lib/legal-pages'

const page = licensingAndRights

const rawSiteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const siteBaseUrl = normalizeSiteBaseUrl(rawSiteBaseUrl)
const socialImagePath = '/images/wavenation-social-card.jpg'
const logoPath = '/images/wavenation-logo.png'

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'Licensing & Rights | WaveNation',
  description: page.description,
  applicationName: 'WaveNation',
  authors: [{ name: 'WaveNation Media' }],
  creator: 'WaveNation Media',
  publisher: 'WaveNation Media',
  category: 'Legal',
  keywords: [
    'WaveNation licensing',
    'WaveNation rights',
    'music licensing',
    'content rights',
    'creator rights',
    'copyright licensing',
    'media rights',
    'artist submissions',
    'WaveNation legal',
    'WaveNation Media',
  ],
  alternates: {
    canonical: '/licensing-and-rights',
  },
  openGraph: {
    title: 'Licensing & Rights | WaveNation',
    description: page.description,
    url: '/licensing-and-rights',
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: 'WaveNation Licensing and Rights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Licensing & Rights | WaveNation',
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
      name: 'Licensing & Rights',
      url: toAbsoluteUrl('/licensing-and-rights'),
      description: page.description,
      isPartOf: {
        '@type': 'WebSite',
        name: 'WaveNation',
        url: siteBaseUrl,
      },
      about: {
        '@type': 'Thing',
        name: 'Licensing and Rights',
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
          name: 'Licensing & Rights',
          item: toAbsoluteUrl('/licensing-and-rights'),
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

export default function LicensingAndRightsPage() {
  return (
    <div
      data-analytics-page="licensing-and-rights"
      data-analytics-page-title="Licensing & Rights"
      data-analytics-section="legal_page"
    >
      <JsonLd />
      <LegalPage page={page} />
    </div>
  )
}