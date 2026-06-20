import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCollectionShell, NewsInfiniteGrid } from '@wavenation/ui-web'
import {
  getArticles,
  getCategoryBySlug,
  getSubcategoryBySlug,
} from '@/lib/news/news-rest'
import {
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/news/news-seo'
import styles from '../../news-pages.module.css'

type PageProps = {
  params: Promise<{
    slug: string
    subcategorySlug: string
  }>
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, subcategorySlug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return buildNewsMetadata({
      title: 'Category Not Found',
      description: 'The requested WaveNation News category could not be found.',
      route: `/news/${slug}/${subcategorySlug}`,
      noIndex: true,
    })
  }

  const subcategory = await getSubcategoryBySlug(subcategorySlug, category.id)

  if (!subcategory) {
    return buildNewsMetadata({
      title: 'Subcategory Not Found',
      description:
        'The requested WaveNation News subcategory could not be found.',
      route: `/news/${slug}/${subcategorySlug}`,
      noIndex: true,
    })
  }

  return buildNewsMetadata({
    title: `${subcategory.name} | ${category.name}`,
    description:
      subcategory.description ||
      category.seoDescription ||
      `Read ${subcategory.name} stories in ${category.name} on WaveNation.`,
    route: `/news/${category.slug}/${subcategory.slug}`,
    keywords: [
      subcategory.name,
      category.name,
      `${subcategory.name} news`,
      'WaveNation News',
    ],
  })
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

  const docs = Array.isArray(articles.docs) ? articles.docs : []
  const route = `/news/${category.slug}/${subcategory.slug}`

  const description =
    subcategory.description ||
    `Read ${subcategory.name} stories in ${category.name} on WaveNation.`

  const jsonLd = [
    createCollectionPageJsonLd({
      route,
      name: `${subcategory.name} | ${category.name}`,
      description,
    }),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name: category.name, path: `/news/${category.slug}` },
      { name: subcategory.name, path: route },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-subcategory"
      data-analytics-page-title={subcategory.name}
      data-analytics-page-type="news-subcategory"
      data-analytics-category={category.slug}
      data-analytics-subcategory={subcategory.slug}
      data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <NewsCollectionShell
        eyebrow={category.name}
        title={subcategory.name}
        description={description}
        accent={subcategory.themeColorOverride || category.themeColor || undefined}
      >
        <NewsInfiniteGrid
          initialDocs={docs}
          initialPage={articles.page || 1}
          initialHasNextPage={Boolean(articles.hasNextPage)}
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