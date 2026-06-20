import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { MusicCard, MusicFilterTabs } from '@wavenation/ui-web'
import { CHART_TYPE_OPTIONS, getCharts, getCurrentCharts } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pageDescription =
  'View the current WaveNation music charts for The Hitlist, Gospel, Southern Soul, Hip-Hop, R&B/Soul, and BPM.'

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'Charts',
  description: pageDescription,
  alternates: {
    canonical: '/charts',
  },
  openGraph: {
    title: 'WaveNation Charts',
    description: pageDescription,
    url: '/charts',
    siteName: 'WaveNation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WaveNation Charts',
    description: pageDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
}

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>

function readParam(params: SearchParams, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function isValidChartType(value?: string) {
  if (!value || value === 'all') return true
  return CHART_TYPE_OPTIONS.some((option) => option.value === value)
}

function absoluteUrl(path: string) {
  return new URL(path, siteBaseUrl).toString()
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

function StructuredDataScript({
  charts,
  type,
}: {
  charts: Array<{
    slug: string
    title: string
    publicDescription?: string | null
    chartTypeLabel?: string | null
  }>
  type: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: type === 'all' ? 'WaveNation Charts' : `WaveNation ${type} Charts`,
    description: pageDescription,
    url: absoluteUrl(type === 'all' ? '/charts' : `/charts?type=${encodeURIComponent(type)}`),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: charts.slice(0, 12).map((chart, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: chart.title,
        description: chart.publicDescription || undefined,
        url: absoluteUrl(`/charts/${chart.slug}`),
      })),
    },
  }

  const json = JSON.stringify(schema).replace(/</g, '\\u003c')

  return (
    <script
      id="wavenation-charts-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

export default async function ChartsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const requestedType = readParam(params, 'type')
  const type = isValidChartType(requestedType) ? requestedType || 'all' : 'all'

  const charts =
    type === 'all'
      ? await getCurrentCharts(12)
      : (await getCharts({ chartType: type, currentOnly: true, limit: 12 })).docs

  const activeTypeLabel =
    type === 'all'
      ? 'All Current'
      : CHART_TYPE_OPTIONS.find((option) => option.value === type)?.label || 'All Current'

  const tabs = [
    { label: 'All Current', href: '/charts', isActive: type === 'all' },
    ...CHART_TYPE_OPTIONS.map((option) => ({
      label: option.label,
      href: `/charts?type=${option.value}`,
      isActive: type === option.value,
    })),
  ]

  return (
    <>
      <AnalyticsEventScript
        id="wavenation-charts-page-analytics"
        eventName="charts_index_view"
        payload={{
          page_type: 'charts_index',
          page_path: type === 'all' ? '/charts' : `/charts?type=${type}`,
          chart_filter: type,
          chart_filter_label: activeTypeLabel,
          chart_count: charts.length,
        }}
      />

      <StructuredDataScript charts={charts} type={type} />

      <main className={styles.page} data-analytics-page="charts" data-chart-filter={type}>
        <section className={styles.hero}>
          <p>WaveNation Charts</p>
          <h1>The records moving the culture.</h1>
          <span>
            Editorially curated charts across Rhythmic, Gospel, Southern Soul, Hip-Hop, R&B,
            Soul, and House.
          </span>
          <div className={styles.heroActions}>
            <Link href="/charts/archive">Search Archive</Link>
            <Link href="/discover">Discover Music</Link>
          </div>
        </section>

        <section className={styles.filters}>
          <MusicFilterTabs label="Chart type filters" tabs={tabs} />
        </section>

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <p>{charts.length} current charts</p>
            <h2>Current Rankings</h2>
          </div>

          {charts.length > 0 ? (
            <div className={styles.grid}>
              {charts.map((chart) => (
                <MusicCard
                  key={chart.slug}
                  href={`/charts/${chart.slug}`}
                  title={chart.title}
                  eyebrow={chart.chartTypeLabel}
                  description={chart.publicDescription}
                  image={chart.coverArt || chart.heroImage || chart.socialCard}
                  meta={chart.weekLabel || (chart.chartSize ? `Top ${chart.chartSize}` : undefined)}
                  badge={chart.isCurrent ? 'Current' : undefined}
                  accent={chart.accentColor}
                  variant="feature"
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No current charts match this filter yet.</p>
          )}
        </section>
      </main>
    </>
  )
}