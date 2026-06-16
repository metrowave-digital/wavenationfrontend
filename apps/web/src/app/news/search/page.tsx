import type { Metadata } from 'next'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles } from '@/lib/news/news-rest'
import styles from '../news-pages.module.css'

type PageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Search News | WaveNation',
  description: 'Search WaveNation stories by keyword, artist, topic, tag, or category.',
}

export default async function NewsSearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || ''
  const articles = await getArticles({ search: q }, 1, 12)

  return (
    <main className={styles.page}>
      <NewsCollectionShell
        eyebrow="Search"
        title="Search the wave"
        description="Find stories by artist, genre, category, topic, tag, or keyword."
        accent="#00b3ff"
      >
        <div className={styles.toolbar}>
          <form className={styles.form} action="/news/search" method="get">
            <input
              className={styles.input}
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search Drake, R&B, streaming, sports, culture…"
              aria-label="Search WaveNation News"
            />

            <button className={styles.button} type="submit">
              Search
            </button>
          </form>
        </div>

        <NewsInfiniteGrid
          initialDocs={articles.docs}
          initialPage={articles.page}
          initialHasNextPage={articles.hasNextPage}
          filters={{ q }}
          emptyTitle={q ? `No results for “${q}.”` : 'Start with a search.'}
          emptyDescription="Search stories across the WaveNation CMS."
        />
      </NewsCollectionShell>
    </main>
  )
}