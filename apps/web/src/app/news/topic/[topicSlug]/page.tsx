import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getTopicBySlug } from '@/lib/news/news-rest'
import {
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/news/news-seo'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    topicSlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { topicSlug } = await params
  const topic = await getTopicBySlug(topicSlug)

  if (!topic) {
    return buildNewsMetadata({
      title: 'Topic Not Found',
      description: 'The requested WaveNation News topic could not be found.',
      route: `/news/topics/${topicSlug}`,
      noIndex: true,
    })
  }

  return buildNewsMetadata({
    title: `${topic.name} News`,
    description:
      topic.description ||
      `Stories, updates, and cultural coverage connected to ${topic.name}.`,
    route: `/news/topics/${topic.slug}`,
    keywords: [
      topic.name,
      `${topic.name} news`,
      'WaveNation topics',
      'WaveNation News',
    ],
  })
}

export default async function TopicPage({ params }: PageProps) {
  const { topicSlug } = await params
  const topic = await getTopicBySlug(topicSlug)

  if (!topic) notFound()

  const articles = await getArticles({ topicId: topic.id }, 1, 12)
  const docs = Array.isArray(articles.docs) ? articles.docs : []

  const route = `/news/topics/${topic.slug}`
  const description =
    topic.description ||
    `Stories, updates, and cultural coverage connected to ${topic.name}.`

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name: `${topic.name} News`,
      description,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name: topic.name, path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-topic"
      data-analytics-page-title={topic.name}
      data-analytics-page-type="news-topic"
      data-analytics-topic={topic.slug}
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsCollectionShell
        eyebrow="Topic"
        title={topic.name}
        description={description}
        accent="#00b3ff"
      >
        <NewsInfiniteGrid
          initialDocs={docs}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
          filters={{ topicSlug: topic.slug }}
          emptyTitle={`No ${topic.name} stories yet.`}
          emptyDescription="This topic is connected to the CMS and ready for coverage."
        />
      </NewsCollectionShell>
    </main>
  )
}