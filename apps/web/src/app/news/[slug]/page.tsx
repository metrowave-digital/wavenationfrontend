import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleShell, NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getRelatedArticles, resolveNewsSlug } from '@/lib/news/news-rest'
import styles from '../news-pages.module.css'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveNewsSlug(slug)

  if (!resolved) {
    return {
      title: 'Not Found | WaveNation',
    }
  }

  if (resolved.type === 'category') {
    return {
      title: resolved.category.seoTitle || `${resolved.category.name} | WaveNation News`,
      description: resolved.category.seoDescription || resolved.category.description || undefined,
    }
  }

  const article = resolved.article

  return {
    title: article.seoTitle || `${article.title} | WaveNation`,
    description: article.seoDescription || article.excerpt || article.subtitle || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.subtitle || undefined,
      images: article.hero?.image?.url ? [article.hero.image.url] : undefined,
    },
  }
}

export default async function NewsSlugPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = await resolveNewsSlug(slug)

  if (!resolved) notFound()

  if (resolved.type === 'category') {
    const articles = await getArticles({ categoryId: resolved.category.id }, 1, 12)

    return (
      <main className={styles.page}>
        <NewsCollectionShell
          eyebrow="Category"
          title={resolved.category.name}
          description={resolved.category.description}
          accent={resolved.category.themeColor}
        >
          <NewsInfiniteGrid
            initialDocs={articles.docs}
            initialPage={articles.page}
            initialHasNextPage={articles.hasNextPage}
            filters={{ categorySlug: resolved.category.slug }}
            emptyTitle={`No ${resolved.category.name} stories yet.`}
            emptyDescription="This category is connected to Payload CMS and ready for new articles."
          />
        </NewsCollectionShell>
      </main>
    )
  }

  const related = await getRelatedArticles(resolved.article)

  return (
    <main className={styles.page}>
      <ArticleShell article={resolved.article} relatedArticles={related} />
    </main>
  )
}