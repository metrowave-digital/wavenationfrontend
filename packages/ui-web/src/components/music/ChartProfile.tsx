import Link from 'next/link'
import { ChartTable } from './ChartTable'
import { MusicArtwork } from './MusicArtwork'
import styles from './ChartProfile.module.css'
import type { ChartSummary } from './types'

type ChartProfileProps = {
  chart: ChartSummary
  backHref?: string
}

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

export function ChartProfile({ chart, backHref = '/charts' }: ChartProfileProps) {
  const publishedLabel = formatDate(chart.publishedAt)

  return (
    <article className={styles.profile}>
      <div className={styles.hero}>
        <div className={styles.copy}>
          <Link href={backHref} className={styles.backLink}>← All Charts</Link>
          <p className={styles.eyebrow}>{chart.chartTypeLabel || 'WaveNation Chart'}</p>
          <h1>{chart.title}</h1>
          {chart.publicDescription ? <p className={styles.description}>{chart.publicDescription}</p> : null}

          <div className={styles.metaGrid}>
            {chart.weekLabel ? (
              <div>
                <span>Issue</span>
                <strong>{chart.weekLabel}</strong>
              </div>
            ) : null}
            {publishedLabel ? (
              <div>
                <span>Published</span>
                <strong>{publishedLabel}</strong>
              </div>
            ) : null}
            {chart.chartSize ? (
              <div>
                <span>Chart Size</span>
                <strong>Top {chart.chartSize}</strong>
              </div>
            ) : null}
            {chart.isCurrent ? (
              <div>
                <span>Status</span>
                <strong>Current</strong>
              </div>
            ) : null}
          </div>

          {chart.relatedArticleUrl ? (
            <a className={styles.articleLink} href={chart.relatedArticleUrl} target="_blank" rel="noreferrer">
              Read the chart breakdown
            </a>
          ) : null}
        </div>

        <div className={styles.visualStack}>
          <MusicArtwork image={chart.coverArt || chart.heroImage || chart.socialCard} title={chart.title} accent={chart.accentColor} />
        </div>
      </div>

      {chart.methodologyNote ? (
        <section className={styles.methodology}>
          <p>Methodology</p>
          <h2>How this chart is ranked</h2>
          <span>{chart.methodologyNote}</span>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>{chart.chartTypeLabel || 'Chart'}</p>
          <h2>The ranked list</h2>
        </div>
        <ChartTable entries={chart.entries ?? []} />
      </section>
    </article>
  )
}
