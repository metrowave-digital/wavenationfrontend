import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsCollectionShell, NewsHeroRail, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles } from '@/lib/news/news-rest'
import styles from './news-pages.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News | WaveNation',
  description:
    'Fresh music, culture, sports, film, lifestyle, business, technology, and community stories from WaveNation.',
}

export default async function NewsPage() {
  const articles = await getArticles({}, 1, 17)

  const heroArticles = articles.docs.slice(0, 5)
  const gridArticles = articles.docs.slice(5)

  return (
    <main className={styles.page}>
      <NewsHeroRail articles={heroArticles} />

      <nav className={styles.quickLinks} aria-label="News categories">
        <Link href="/news/music">Music</Link>
        <Link href="/news/film-tv">Film & TV</Link>
        <Link href="/news/sports">Sports</Link>
        <Link href="/news/business-tech">Business & Technology</Link>
        <Link href="/news/culture">Lifestyle & Culture</Link>
        <Link href="/news/search">Search</Link>
        <Link href="/news/archive">Archive</Link>
      </nav>

      <NewsCollectionShell
        eyebrow="Latest"
        title="The latest wave"
        description="Fresh stories from across music, culture, business, sports, film, lifestyle, faith, and community."
      >
        <NewsInfiniteGrid
          initialDocs={gridArticles}
          initialPage={1}
          initialHasNextPage={articles.hasNextPage}
          emptyTitle="No published stories yet."
          emptyDescription="Publish an article in Payload CMS and it will populate this page automatically."
        />
      </NewsCollectionShell>
    </main>
  )
}