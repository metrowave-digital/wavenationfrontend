import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { MusicCard, MusicFilterTabs } from '@wavenation/ui-web'
import { CHART_TYPE_OPTIONS, buildPaginationHref, getChartArchive } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const pageDescription = 'Search the WaveNation chart archive by chart type, week, and title.'

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'Chart Archive',
  description: pageDescription,
  alternates: {
    canonical: '/charts/archive',
  },
  openGraph: {
    title: 'WaveNation Chart Archive',
    description: pageDescription,
    url: '/charts/archive',
    siteName: 'WaveNation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WaveNation Chart Archive',
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

function pageFrom(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
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
  docs,
  q,
  type,
}: {
  docs: Array<{
    slug: string
    title: string
    publicDescription?: string | null
  }>
  q: string
  type: string
}) {
  const query = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(type !== 'all' ? { type } : {}),
  }).toString()

  const pageUrl = query ? `/charts/archive?${query}` : '/charts/archive'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: q ? `WaveNation Chart Archive Search: ${q}` : 'WaveNation Chart Archive',
    description: pageDescription,
    url: absoluteUrl(pageUrl),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: docs.slice(0, 24).map((chart, index) => ({
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
      id="wavenation-chart-archive-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

export default async function ChartArchivePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const q = (readParam(params, 'q') || '').trim().slice(0, 100)
  const requestedType = readParam(params, 'type')
  const type = isValidChartType(requestedType) ? requestedType || 'all' : 'all'
  const page = pageFrom(readParam(params, 'page'))

  const result = await getChartArchive({ query: q, chartType: type, page, limit: 24 })

  const docs = Array.isArray(result.docs) ? result.docs : []
  const totalDocs = result.totalDocs ?? docs.length
  const currentPage = result.page ?? page
  const totalPages = result.totalPages ?? 1

  const activeTypeLabel =
    type === 'all' ? 'All' : CHART_TYPE_OPTIONS.find((option) => option.value === type)?.label || 'All'

  const tabs = [
    {
      label: 'All',
      href: q ? `/charts/archive?q=${encodeURIComponent(q)}` : '/charts/archive',
      isActive: type === 'all',
    },
    ...CHART_TYPE_OPTIONS.map((option) => ({
      label: option.label,
      href: `/charts/archive?${new URLSearchParams({
        ...(q ? { q } : {}),
        type: option.value,
      }).toString()}`,
      isActive: type === option.value,
    })),
  ]

  return (
    <>
      <AnalyticsEventScript
        id="wavenation-chart-archive-page-analytics"
        eventName="chart_archive_view"
        payload={{
          page_type: 'chart_archive',
          page_path: '/charts/archive',
          search_query: q || null,
          chart_filter: type,
          chart_filter_label: activeTypeLabel,
          page_number: currentPage,
          result_count: docs.length,
          total_docs: totalDocs,
        }}
      />

      <StructuredDataScript docs={docs} q={q} type={type} />

      <main
        className={styles.page}
        data-analytics-page="chart-archive"
        data-chart-filter={type}
        data-page-number={currentPage}
      >
        <section className={styles.hero}>
          <p>Chart Archive</p>
          <h1>Search the WaveNation chart history.</h1>
          <span>Find past chart issues by type, title, week label, or description.</span>
        </section>

        <form className={styles.search} action="/charts/archive">
          <label htmlFor="chart-search">Search archive</label>
          <div>
            <input
              id="chart-search"
              name="q"
              defaultValue={q}
              placeholder="Search by title, week, or keyword"
            />
            {type !== 'all' ? <input type="hidden" name="type" value={type} /> : null}
            <button type="submit">Search</button>
          </div>
        </form>

        <section className={styles.filters}>
          <MusicFilterTabs label="Archive chart type filters" tabs={tabs} />
        </section>

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <p>{totalDocs} archived charts</p>
            <h2>Archive results</h2>
          </div>

          {docs.length > 0 ? (
            <div className={styles.grid}>
              {docs.map((chart) => (
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
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No chart archive results match this search yet.</p>
          )}

          <div className={styles.pagination}>
            {result.hasPrevPage ? (
              <Link
                href={buildPaginationHref(
                  '/charts/archive',
                  { q: q || undefined, type: type !== 'all' ? type : undefined },
                  currentPage - 1
                )}
              >
                Previous
              </Link>
            ) : null}

            <span>
              Page {currentPage} of {totalPages}
            </span>

            {result.hasNextPage ? (
              <Link
                href={buildPaginationHref(
                  '/charts/archive',
                  { q: q || undefined, type: type !== 'all' ? type : undefined },
                  currentPage + 1
                )}
              >
                Next
              </Link>
            ) : null}
          </div>
        </section>
      </main>
    </>
  )
}