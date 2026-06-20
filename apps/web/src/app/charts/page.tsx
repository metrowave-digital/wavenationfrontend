import type { Metadata } from 'next'
import Link from 'next/link'
import { MusicCard, MusicFilterTabs } from '@wavenation/ui-web'
import { CHART_TYPE_OPTIONS, getCharts, getCurrentCharts } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Charts | WaveNation',
  description: 'View the current WaveNation music charts for The Hitlist, Gospel, Southern Soul, Hip-Hop, R&B/Soul, and BPM.',
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

export default async function ChartsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const type = readParam(params, 'type') || 'all'

  const charts = type === 'all'
    ? await getCurrentCharts(12)
    : (await getCharts({ chartType: type, currentOnly: true, limit: 12 })).docs

  const tabs = [
    { label: 'All Current', href: '/charts', isActive: type === 'all' },
    ...CHART_TYPE_OPTIONS.map((option) => ({
      label: option.label,
      href: `/charts?type=${option.value}`,
      isActive: type === option.value,
    })),
  ]

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p>WaveNation Charts</p>
        <h1>The records moving the culture.</h1>
        <span>
          Editorially curated charts across Rythmic, Gospel, Southern Soul, Hip-Hop, R&B, Soul, and House.
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
  )
}
