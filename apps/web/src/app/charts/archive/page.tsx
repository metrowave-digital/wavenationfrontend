import type { Metadata } from 'next'
import Link from 'next/link'
import { MusicCard, MusicFilterTabs } from '@wavenation/ui-web'
import { CHART_TYPE_OPTIONS, buildPaginationHref, getChartArchive } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Chart Archive | WaveNation',
  description: 'Search the WaveNation chart archive by chart type, week, and title.',
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function pageFrom(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export default async function ChartArchivePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const q = readParam(params, 'q') || ''
  const type = readParam(params, 'type') || 'all'
  const page = pageFrom(readParam(params, 'page'))

  const result = await getChartArchive({ query: q, chartType: type, page, limit: 24 })

  const tabs = [
    { label: 'All', href: q ? `/charts/archive?q=${encodeURIComponent(q)}` : '/charts/archive', isActive: type === 'all' },
    ...CHART_TYPE_OPTIONS.map((option) => ({
      label: option.label,
      href: `/charts/archive?${new URLSearchParams({ ...(q ? { q } : {}), type: option.value }).toString()}`,
      isActive: type === option.value,
    })),
  ]

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p>Chart Archive</p>
        <h1>Search the WaveNation chart history.</h1>
        <span>Find past chart issues by type, title, week label, or description.</span>
      </section>

      <form className={styles.search} action="/charts/archive">
        <label htmlFor="chart-search">Search archive</label>
        <div>
          <input id="chart-search" name="q" defaultValue={q} placeholder="Search by title, week, or keyword" />
          {type !== 'all' ? <input type="hidden" name="type" value={type} /> : null}
          <button type="submit">Search</button>
        </div>
      </form>

      <section className={styles.filters}>
        <MusicFilterTabs label="Archive chart type filters" tabs={tabs} />
      </section>

      <section className={styles.results}>
        <div className={styles.resultsHeader}>
          <p>{result.totalDocs} archived charts</p>
          <h2>Archive results</h2>
        </div>

        {result.docs.length > 0 ? (
          <div className={styles.grid}>
            {result.docs.map((chart) => (
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
            <Link href={buildPaginationHref('/charts/archive', { q: q || undefined, type: type !== 'all' ? type : undefined }, result.page - 1)}>Previous</Link>
          ) : null}
          <span>Page {result.page} of {result.totalPages}</span>
          {result.hasNextPage ? (
            <Link href={buildPaginationHref('/charts/archive', { q: q || undefined, type: type !== 'all' ? type : undefined }, result.page + 1)}>Next</Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}
