import type { Metadata } from 'next'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles } from '@/lib/news/news-rest'
import {
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/news/news-seo'
import styles from '../news-pages.module.css'

type SearchParams = {
  year?: string | string[]
  month?: string | string[]
}

type PageProps = {
  searchParams?: Promise<SearchParams>
}

export const revalidate = 60

const route = '/news/archive'
const pageTitle = 'News Archive'
const pageDescription = 'Browse WaveNation News by month and year.'

export const metadata: Metadata = buildNewsMetadata({
  title: pageTitle,
  description: pageDescription,
  route,
  keywords: [
    'WaveNation archive',
    'news archive',
    'music news archive',
    'culture archive',
  ],
})

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

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function NewsArchivePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const currentYear = String(new Date().getFullYear())
  const year = firstParam(resolvedSearchParams.year) || currentYear
  const month = firstParam(resolvedSearchParams.month) || ''

  const articles = await getArticles({ year, month }, 1, 12)
  const docs = Array.isArray(articles.docs) ? articles.docs : []

  const selectedMonthLabel =
    months.find(([value]) => value === month)?.[1] || 'All months'

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name: pageTitle,
      description: pageDescription,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name: 'Archive', path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-archive"
      data-analytics-page-title="News Archive"
      data-analytics-page-type="news-archive"
      data-analytics-year={year}
      data-analytics-month={month || 'all'}
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsCollectionShell
        eyebrow="Archive"
        title="Browse by date"
        description="Explore published stories from the WaveNation editorial archive."
        accent="#39ff14"
      >
        <div className={styles.toolbar}>
          <form
            className={styles.form}
            action="/news/archive"
            method="get"
            data-analytics-form="news-archive"
          >
            <input
              className={styles.input}
              type="number"
              min="2020"
              max="2100"
              name="year"
              defaultValue={year}
              aria-label="Archive year"
            />

            <select
              className={styles.select}
              name="month"
              defaultValue={month}
              aria-label={`Archive month, currently ${selectedMonthLabel}`}
            >
              <option value="">All months</option>

              {months.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <button
              className={styles.button}
              type="submit"
              data-analytics-action="submit-news-archive"
            >
              Browse
            </button>
          </form>
        </div>

        <NewsInfiniteGrid
          initialDocs={docs}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
          filters={{ year, month }}
          emptyTitle="No stories found for this archive period."
          emptyDescription="Try a different month or year."
        />
      </NewsCollectionShell>
    </main>
  )
}