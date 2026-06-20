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
  q?: string | string[]
}

type PageProps = {
  searchParams?: Promise<SearchParams>
}

export const revalidate = 30

const route = '/news/search'
const pageTitle = 'Search News'
const pageDescription =
  'Search WaveNation stories by keyword, artist, topic, tag, or category.'

export const metadata: Metadata = buildNewsMetadata({
  title: pageTitle,
  description: pageDescription,
  route,
  keywords: [
    'search WaveNation News',
    'music search',
    'culture search',
    'entertainment news search',
  ],
})

export default async function NewsSearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const rawQ = resolvedSearchParams.q
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim() || ''

  const articles = await getArticles(q ? { search: q } : {}, 1, 12)
  const docs = Array.isArray(articles.docs) ? articles.docs : []

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name: pageTitle,
      description: pageDescription,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name: 'Search', path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-search"
      data-analytics-page-title="Search News"
      data-analytics-page-type="news-search"
      data-analytics-query={q}
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsCollectionShell
        eyebrow="Search"
        title="Search the wave"
        description="Find stories by artist, genre, category, topic, tag, or keyword."
        accent="#00b3ff"
      >
        <div className={styles.toolbar}>
          <form
            className={styles.form}
            action="/news/search"
            method="get"
            data-analytics-form="news-search"
          >
            <input
              className={styles.input}
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search Drake, R&B, streaming, sports, culture…"
              aria-label="Search WaveNation News"
            />

            <button
              className={styles.button}
              type="submit"
              data-analytics-action="submit-news-search"
            >
              Search
            </button>
          </form>
        </div>

        <NewsInfiniteGrid
          initialDocs={docs}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
          filters={{ q }}
          emptyTitle={q ? `No results for “${q}.”` : 'Start with a search.'}
          emptyDescription="Search stories across the WaveNation CMS."
        />
      </NewsCollectionShell>
    </main>
  )
}