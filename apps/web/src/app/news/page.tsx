import type { Metadata } from 'next'
import Link from 'next/link'
import {
  NewsCollectionShell,
  NewsHeroRail,
  NewsInfiniteGrid,
} from '@wavenation/ui-web'
import { getArticles } from '@/lib/news/news-rest'
import {
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/news/news-seo'
import styles from './news-pages.module.css'

export const revalidate = 60

const route = '/news'
const pageTitle = 'News'
const pageDescription =
  'Fresh music, culture, sports, film, lifestyle, business, technology, and community stories from WaveNation.'

export const metadata: Metadata = buildNewsMetadata({
  title: pageTitle,
  description: pageDescription,
  route,
  keywords: [
    'WaveNation News',
    'music news',
    'culture news',
    'Black culture',
    'urban media',
    'entertainment news',
    'sports news',
    'business technology news',
  ],
})

export default async function NewsPage() {
  const articles = await getArticles({}, 1, 17)
  const docs = Array.isArray(articles.docs) ? articles.docs : []

  const heroArticles = docs.slice(0, 5)
  const gridArticles = docs.slice(5)

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name: 'WaveNation News',
      description: pageDescription,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news"
      data-analytics-page-title="News"
      data-analytics-page-type="news-index"
      data-analytics-section="editorial"
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsHeroRail articles={heroArticles} />

      <nav className={styles.quickLinks} aria-label="News categories">
        <Link href="/news/music" data-analytics-link="news-category-music">
          Music
        </Link>
        <Link href="/news/film-tv" data-analytics-link="news-category-film-tv">
          Film &amp; TV
        </Link>
        <Link href="/news/sports" data-analytics-link="news-category-sports">
          Sports
        </Link>
        <Link
          href="/news/business-tech"
          data-analytics-link="news-category-business-tech"
        >
          Business &amp; Technology
        </Link>
        <Link href="/news/culture" data-analytics-link="news-category-culture">
          Lifestyle &amp; Culture
        </Link>
        <Link href="/news/search" data-analytics-link="news-search">
          Search
        </Link>
        <Link href="/news/archive" data-analytics-link="news-archive">
          Archive
        </Link>
      </nav>

      <NewsCollectionShell
        eyebrow="Latest"
        title="The latest wave"
        description="Fresh stories from across music, culture, business, sports, film, lifestyle, faith, and community."
      >
        <NewsInfiniteGrid
          initialDocs={gridArticles}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
          emptyTitle="No published stories yet."
          emptyDescription="Publish an article in Payload CMS and it will populate this page automatically."
        />
      </NewsCollectionShell>
    </main>
  )
}