import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import { getArticles, getCategoryBySlug, getSubcategoryBySlug } from '@/lib/news/news-rest'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    slug: string
    subcategorySlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subcategorySlug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) return { title: 'Not Found | WaveNation' }

  const subcategory = await getSubcategoryBySlug(subcategorySlug, category.id)

  if (!subcategory) return { title: 'Not Found | WaveNation' }

  return {
    title: `${subcategory.name} | ${category.name} | WaveNation News`,
    description: subcategory.description || category.seoDescription || undefined,
  }
}

export default async function NewsSubcategoryPage({ params }: PageProps) {
  const { slug, subcategorySlug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const subcategory = await getSubcategoryBySlug(subcategorySlug, category.id)

  if (!subcategory) notFound()

  const articles = await getArticles(
    {
      categoryId: category.id,
      subcategoryId: subcategory.id,
    },
    1,
    12,
  )

  return (
    <main className={styles.page}>
      <NewsCollectionShell
        eyebrow={category.name}
        title={subcategory.name}
        description={subcategory.description}
        accent={subcategory.themeColorOverride || category.themeColor}
      >
        <NewsInfiniteGrid
          initialDocs={articles.docs}
          initialPage={articles.page}
          initialHasNextPage={articles.hasNextPage}
          filters={{
            categorySlug: category.slug,
            subcategorySlug: subcategory.slug,
          }}
          emptyTitle={`No ${subcategory.name} stories yet.`}
          emptyDescription="Publish articles in this subcategory from Payload CMS."
        />
      </NewsCollectionShell>
    </main>
  )
}