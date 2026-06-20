import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getTagBySlug } from '@/lib/news/news-rest'
import {
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/news/news-seo'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    tagSlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tagSlug } = await params
  const tag = await getTagBySlug(tagSlug)

  if (!tag) {
    return buildNewsMetadata({
      title: 'Tag Not Found',
      description: 'The requested WaveNation News tag could not be found.',
      route: `/news/tags/${tagSlug}`,
      noIndex: true,
    })
  }

  const label = tag.label.trim()

  return buildNewsMetadata({
    title: `#${label}`,
    description: tag.description || `WaveNation stories tagged ${label}.`,
    route: `/news/tags/${tag.slug}`,
    keywords: [label, `#${label}`, 'WaveNation tags', 'WaveNation News'],
  })
}

export default async function TagPage({ params }: PageProps) {
  const { tagSlug } = await params
  const tag = await getTagBySlug(tagSlug)

  if (!tag) notFound()

  const label = tag.label.trim()
  const route = `/news/tags/${tag.slug}`
  const description = tag.description || `Stories connected to ${label}.`

  const articles = await getArticles({ tagId: tag.id }, 1, 12)
  const docs = Array.isArray(articles.docs) ? articles.docs : []

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name: `#${label}`,
      description,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name: `#${label}`, path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-tag"
      data-analytics-page-title={`#${label}`}
      data-analytics-page-type="news-tag"
      data-analytics-tag={tag.slug}
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsCollectionShell
        eyebrow="Tag"
        title={`#${label}`}
        description={description}
        accent="#e92c63"
      >
        <NewsInfiniteGrid
          initialDocs={docs}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
          filters={{ tagSlug: tag.slug }}
          emptyTitle={`No stories tagged ${label} yet.`}
          emptyDescription="Tags are connected to your Payload CMS taxonomy."
        />
      </NewsCollectionShell>
    </main>
  )
}