import type { Metadata } from 'next'
import { ProgrammingSchedulePage } from '@/components/ProgrammingSchedulePage'

export const revalidate = 300

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

const route = '/schedule'
const siteName = 'WaveNation'
const organizationName = 'WaveNation Media'

const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

const pageUrl = `${siteBaseUrl}${route}`

const metadataTitle = 'Schedule'
const pageTitle = 'Schedule | WaveNation'
const pageDescription =
  'Browse the WaveNation radio and TV programming schedule, including live shows, upcoming blocks, and weekly programming across WaveNation FM and WaveNation Watch.'

const socialImage = {
  url: '/images/wavenation-social-card.jpg',
  width: 1200,
  height: 630,
  alt: 'WaveNation radio and TV programming schedule',
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const scheduleJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteBaseUrl}/#organization`,
      name: organizationName,
      url: siteBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteBaseUrl}${socialImage.url}`,
        width: socialImage.width,
        height: socialImage.height,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteBaseUrl}/#website`,
      name: siteName,
      url: siteBaseUrl,
      publisher: {
        '@id': `${siteBaseUrl}/#organization`,
      },
    },
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageTitle,
      description: pageDescription,
      inLanguage: 'en-US',
      isPartOf: {
        '@id': `${siteBaseUrl}/#website`,
      },
      publisher: {
        '@id': `${siteBaseUrl}/#organization`,
      },
      about: {
        '@type': 'BroadcastService',
        '@id': `${pageUrl}#broadcast-service`,
        name: 'WaveNation Programming',
        url: pageUrl,
        serviceType: ['Internet radio programming', 'Streaming TV programming'],
        areaServed: 'US',
        broadcaster: {
          '@id': `${siteBaseUrl}/#organization`,
        },
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'WaveNation schedule views',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'All programming',
            url: `${pageUrl}?view=all`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Radio schedule',
            url: `${pageUrl}?view=radio`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'TV schedule',
            url: `${pageUrl}?view=tv`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Today’s schedule',
            url: `${pageUrl}?view=today`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: 'This week’s schedule',
            url: `${pageUrl}?view=week`,
          },
        ],
      },
      potentialAction: [
        {
          '@type': 'ListenAction',
          name: 'Listen to WaveNation FM',
          target: `${siteBaseUrl}/listen-live`,
        },
        {
          '@type': 'WatchAction',
          name: 'Watch WaveNation live',
          target: `${siteBaseUrl}/watch`,
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteBaseUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Schedule',
          item: pageUrl,
        },
      ],
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: route,
  },
  keywords: [
    'WaveNation schedule',
    'WaveNation radio schedule',
    'WaveNation TV schedule',
    'WaveNation FM programming',
    'WaveNation live shows',
    'urban radio schedule',
    'internet radio schedule',
    'streaming TV schedule',
    'Black media programming',
    'Southern Soul radio schedule',
    'R&B radio schedule',
    'gospel radio schedule',
    'hip-hop radio schedule',
  ],
  applicationName: siteName,
  authors: [{ name: organizationName }],
  creator: organizationName,
  publisher: organizationName,
  category: 'Programming',
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

export default async function SchedulePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}

  return (
    <div
      data-analytics-page="schedule"
      data-analytics-page-title="Schedule"
      data-analytics-page-type="programming"
      data-analytics-content-group="Programming"
      data-analytics-funnel="listen-watch"
      data-analytics-conversion="schedule-engagement"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(scheduleJsonLd),
        }}
      />

      <ProgrammingSchedulePage searchParams={params} />
    </div>
  )
}