import type { Metadata } from 'next'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles } from '@/lib/news/news-rest'
import styles from '../news-pages.module.css'

type PageProps = {
  searchParams: Promise<{
    year?: string
    month?: string
  }>
}

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News Archive | WaveNation',
  description: 'Browse WaveNation News by month and year.',
}

const months = [
  ['1', 'January'],
  ['2', 'February'],
  ['3', 'March'],
  ['4', 'April'],
  ['5', 'May'],
  ['6', 'June'],
  ['7', 'July'],
  ['8', 'August'],
  ['9', 'September'],
  ['10', 'October'],
  ['11', 'November'],
  ['12', 'December'],
]

export default async function NewsArchivePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const year = resolvedSearchParams.year || String(new Date().getFullYear())
  const month = resolvedSearchParams.month || ''

  const articles = await getArticles({ year, month }, 1, 12)

  return (
    <main className={styles.page}>
      <NewsCollectionShell
        eyebrow="Archive"
        title="Browse by date"
        description="Explore published stories from the WaveNation editorial archive."
        accent="#39ff14"
      >
        <div className={styles.toolbar}>
          <form className={styles.form} action="/news/archive" method="get">
            <input
              className={styles.input}
              type="number"
              min="2020"
              max="2100"
              name="year"
              defaultValue={year}
              aria-label="Archive year"
            />

            <select className={styles.select} name="month" defaultValue={month} aria-label="Archive month">
              <option value="">All months</option>

              {months.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <button className={styles.button} type="submit">
              Browse
            </button>
          </form>
        </div>

        <NewsInfiniteGrid
          initialDocs={articles.docs}
          initialPage={articles.page}
          initialHasNextPage={articles.hasNextPage}
          filters={{ year, month }}
          emptyTitle="No stories found for this archive period."
          emptyDescription="Try a different month or year."
        />
      </NewsCollectionShell>
    </main>
  )
}