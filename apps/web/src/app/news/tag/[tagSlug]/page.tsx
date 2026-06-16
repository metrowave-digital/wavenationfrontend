import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getTagBySlug } from '@/lib/news/news-rest'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    tagSlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tagSlug } = await params
  const tag = await getTagBySlug(tagSlug)

  if (!tag) return { title: 'Not Found | WaveNation' }

  return {
    title: `#${tag.label.trim()} | WaveNation News`,
    description: tag.description || `WaveNation stories tagged ${tag.label.trim()}.`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tagSlug } = await params
  const tag = await getTagBySlug(tagSlug)

  if (!tag) notFound()

  const articles = await getArticles({ tagId: tag.id }, 1, 12)

  return (
    <main className={styles.page}>
      <NewsCollectionShell
        eyebrow="Tag"
        title={`#${tag.label.trim()}`}
        description={tag.description || `Stories connected to ${tag.label.trim()}.`}
        accent="#e92c63"
      >
        <NewsInfiniteGrid
          initialDocs={articles.docs}
          initialPage={articles.page}
          initialHasNextPage={articles.hasNextPage}
          filters={{ tagSlug: tag.slug }}
          emptyTitle={`No stories tagged ${tag.label.trim()} yet.`}
          emptyDescription="Tags are connected to your Payload CMS taxonomy."
        />
      </NewsCollectionShell>
    </main>
  )
}