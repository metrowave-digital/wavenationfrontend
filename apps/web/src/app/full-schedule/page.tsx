import type { Metadata } from 'next'
import { RouteAnalytics } from '../components/RouteAnalytics'
import { ProgrammingSchedulePage } from '@/components/ProgrammingSchedulePage'

export const revalidate = 300

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pagePath = '/full-schedule'
const pageUrl = new URL(pagePath, siteBaseUrl).toString()

const pageTitle = 'Full Schedule | WaveNation'
const pageDescription =
  'Browse the full WaveNation radio and TV programming schedule, including live radio shows, TV blocks, daily programming, and weekly schedule views.'

const ogImageUrl = new URL('/images/og/schedule.jpg', siteBaseUrl).toString()

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
    'WaveNation schedule',
    'WaveNation full schedule',
    'WaveNation radio schedule',
    'WaveNation TV schedule',
    'WaveNation programming',
    'listen live schedule',
    'watch live schedule',
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
        alt: 'WaveNation full radio and TV programming schedule.',
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

const fullScheduleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
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
}

export default async function FullSchedulePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  return (
    <>
      <RouteAnalytics
        page="full_schedule"
        route={pagePath}
        section="programming"
        title={pageTitle}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fullScheduleJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <ProgrammingSchedulePage searchParams={resolvedSearchParams} />
    </>
  )
}