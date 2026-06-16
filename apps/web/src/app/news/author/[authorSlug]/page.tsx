import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getAuthorBySlug } from '@/lib/news/news-rest'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    authorSlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { authorSlug } = await params
  const author = await getAuthorBySlug(authorSlug)

  if (!author) return { title: 'Not Found | WaveNation' }

  return {
    title: `${author.fullName || 'WaveNation Author'} | WaveNation News`,
    description: `Read stories by ${author.fullName || 'WaveNation Editorial'} on WaveNation.`,
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { authorSlug } = await params
  const author = await getAuthorBySlug(authorSlug)

  if (!author) notFound()

  const articles = await getArticles({ authorId: author.id }, 1, 12)

  return (
    <main className={styles.page}>
      <NewsCollectionShell
        eyebrow={author.role || 'Author'}
        title={author.fullName || 'WaveNation Editorial'}
        description="Stories, features, reporting, and commentary from this WaveNation contributor."
        accent="#00f3c9"
      >
        <NewsInfiniteGrid
          initialDocs={articles.docs}
          initialPage={articles.page}
          initialHasNextPage={articles.hasNextPage}
          filters={{ authorSlug: author.slug }}
          emptyTitle="No stories from this author yet."
          emptyDescription="When this author publishes new work, it will appear here."
        />
      </NewsCollectionShell>
    </main>
  )
}