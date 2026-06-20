import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ChartProfile } from '@wavenation/ui-web'
import { getChartBySlug } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>

type ImageLike =
  | string
  | {
      url?: string | null
      alt?: string | null
    }
  | null
  | undefined

type ChartEntryLike = {
  position?: number | null
  entryLabel?: string | null
  fallbackTitle?: string | null
  fallbackArtistName?: string | null
  track?: {
    title?: string | null
    artistName?: string | null
  } | null
}

function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, siteBaseUrl).toString()
}

function getImageUrl(image: ImageLike) {
  if (!image) return undefined
  if (typeof image === 'string') return image
  return image.url || undefined
}

function AnalyticsEventScript({
  id,
  eventName,
  payload,
}: {
  id: string
  eventName: string
  payload: AnalyticsPayload
}) {
  const safeEventName = JSON.stringify(eventName)
  const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c')

  return (
    <Script
      id={id}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            var eventName = ${safeEventName};
            var payload = ${safePayload};

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(Object.assign({ event: eventName }, payload));

            if (typeof window.gtag === 'function') {
              window.gtag('event', eventName, payload);
            }

            if (window.posthog && typeof window.posthog.capture === 'function') {
              window.posthog.capture(eventName, payload);
            }
          })();
        `,
      }}
    />
  )
}

function getEntryName(entry: ChartEntryLike) {
  return entry.track?.title || entry.fallbackTitle || entry.entryLabel || 'Chart entry'
}

function getEntryArtist(entry: ChartEntryLike) {
  return entry.track?.artistName || entry.fallbackArtistName || undefined
}

function StructuredDataScript({
  chart,
}: {
  chart: {
    title: string
    slug: string
    publicDescription?: string | null
    seoDescription?: string | null
    chartTypeLabel?: string | null
    weekLabel?: string | null
    coverArt?: ImageLike
    heroImage?: ImageLike
    socialCard?: ImageLike
    entries?: ChartEntryLike[] | null
  }
}) {
  const imageUrl =
    getImageUrl(chart.socialCard) || getImageUrl(chart.heroImage) || getImageUrl(chart.coverArt)

  const entries = Array.isArray(chart.entries) ? chart.entries : []

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: chart.title,
    description: chart.seoDescription || chart.publicDescription || undefined,
    url: absoluteUrl(`/charts/${chart.slug}`),
    image: imageUrl ? absoluteUrl(imageUrl) : undefined,
    about: chart.chartTypeLabel || 'WaveNation Charts',
    datePublished: chart.weekLabel || undefined,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: entry.position || index + 1,
      name: getEntryArtist(entry)
        ? `${getEntryName(entry)} — ${getEntryArtist(entry)}`
        : getEntryName(entry),
    })),
  }

  const json = JSON.stringify(schema).replace(/</g, '\\u003c')

  return (
    <script
      id="wavenation-chart-detail-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const chart = await getChartBySlug(slug)

  if (!chart) {
    return {
      metadataBase: new URL(siteBaseUrl),
      title: 'Chart Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description =
    chart.seoDescription || chart.publicDescription || `View ${chart.title} on WaveNation.`

  const imageUrl =
    getImageUrl(chart.socialCard) || getImageUrl(chart.heroImage) || getImageUrl(chart.coverArt)

  return {
    metadataBase: new URL(siteBaseUrl),
    title: chart.seoTitle || `${chart.title} | WaveNation Charts`,
    description,
    alternates: {
      canonical: `/charts/${chart.slug}`,
    },
    openGraph: {
      title: chart.title,
      description,
      url: `/charts/${chart.slug}`,
      siteName: 'WaveNation',
      type: 'website',
      images: imageUrl
        ? [
            {
              url: absoluteUrl(imageUrl),
              alt: chart.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: chart.title,
      description,
      images: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ChartDetailPage({ params }: PageProps) {
  const { slug } = await params
  const chart = await getChartBySlug(slug)

  if (!chart) notFound()

  return (
    <>
      <AnalyticsEventScript
        id="wavenation-chart-detail-page-analytics"
        eventName="chart_detail_view"
        payload={{
          page_type: 'chart_detail',
          page_path: `/charts/${chart.slug}`,
          chart_slug: chart.slug,
          chart_title: chart.title,
          chart_type: chart.chartTypeLabel || null,
          chart_week: chart.weekLabel || null,
          is_current: chart.isCurrent || false,
          entry_count: Array.isArray(chart.entries) ? chart.entries.length : 0,
        }}
      />

      <StructuredDataScript chart={chart} />

      <main className={styles.page} data-analytics-page="chart-detail" data-chart-slug={chart.slug}>
        <ChartProfile chart={chart} />
      </main>
    </>
  )
}