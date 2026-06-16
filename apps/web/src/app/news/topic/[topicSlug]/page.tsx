import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getTopicBySlug } from '@/lib/news/news-rest'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    topicSlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topicSlug } = await params
  const topic = await getTopicBySlug(topicSlug)

  if (!topic) return { title: 'Not Found | WaveNation' }

  return {
    title: `${topic.name} | WaveNation News`,
    description: topic.description || `Stories, updates, and cultural coverage connected to ${topic.name}.`,
  }
}

export default async function TopicPage({ params }: PageProps) {
  const { topicSlug } = await params
  const topic = await getTopicBySlug(topicSlug)

  if (!topic) notFound()

  const articles = await getArticles({ topicId: topic.id }, 1, 12)

  return (
    <main className={styles.page}>
      <NewsCollectionShell eyebrow="Topic" title={topic.name} description={topic.description} accent="#00b3ff">
        <NewsInfiniteGrid
          initialDocs={articles.docs}
          initialPage={articles.page}
          initialHasNextPage={articles.hasNextPage}
          filters={{ topicSlug: topic.slug }}
          emptyTitle={`No ${topic.name} stories yet.`}
          emptyDescription="This topic is connected to the CMS and ready for coverage."
        />
      </NewsCollectionShell>
    </main>
  )
}