import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getAuthorBySlug } from '@/lib/news/news-rest'
import {
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/news/news-seo'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    authorSlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { authorSlug } = await params
  const author = await getAuthorBySlug(authorSlug)

  if (!author) {
    return buildNewsMetadata({
      title: 'Author Not Found',
      description: 'The requested WaveNation author could not be found.',
      route: `/news/authors/${authorSlug}`,
      noIndex: true,
    })
  }

  const name = author.fullName || 'WaveNation Editorial'

  return buildNewsMetadata({
    title: name,
    description: `Read stories by ${name} on WaveNation.`,
    route: `/news/authors/${author.slug}`,
    keywords: [
      name,
      `${name} articles`,
      'WaveNation author',
      'WaveNation contributor',
    ],
  })
}

export default async function AuthorPage({ params }: PageProps) {
  const { authorSlug } = await params
  const author = await getAuthorBySlug(authorSlug)

  if (!author) notFound()

  const name = author.fullName || 'WaveNation Editorial'
  const route = `/news/authors/${author.slug}`

  const articles = await getArticles({ authorId: author.id }, 1, 12)
  const docs = Array.isArray(articles.docs) ? articles.docs : []

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name,
      description: `Stories, features, reporting, and commentary from ${name}.`,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name, path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-author"
      data-analytics-page-title={name}
      data-analytics-page-type="news-author"
      data-analytics-author={author.slug}
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsCollectionShell
        eyebrow={author.role || 'Author'}
        title={name}
        description="Stories, features, reporting, and commentary from this WaveNation contributor."
        accent="#00f3c9"
      >
        <NewsInfiniteGrid
          initialDocs={docs}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
          filters={{ authorSlug: author.slug }}
          emptyTitle="No stories from this author yet."
          emptyDescription="When this author publishes new work, it will appear here."
        />
      </NewsCollectionShell>
    </main>
  )
}