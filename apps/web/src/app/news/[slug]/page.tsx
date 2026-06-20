import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  ArticleShell,
  NewsCollectionShell,
  NewsInfiniteGrid,
} from '@wavenation/ui-web'
import {
  getArticles,
  getRelatedArticles,
  resolveNewsSlug,
} from '@/lib/news/news-rest'
import {
  absoluteUrl,
  buildNewsMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  newsSocialImage,
  serializeJsonLd,
  siteBaseUrl,
  siteName,
  publisherName,
} from '@/lib/news/news-seo'
import styles from '../news-pages.module.css'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type ArticleImageSource = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

type ArticleLike = {
  title: string
  seoTitle?: string | null
  seoDescription?: string | null
  excerpt?: string | null
  subtitle?: string | null
  slug?: string | null
  publishDate?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  hero?: {
    image?: ArticleImageSource | null
  } | null
  author?: {
    fullName?: string | null
  } | null
}

export const revalidate = 60

function getArticleDescription(article: ArticleLike) {
  return (
    article.seoDescription ||
    article.excerpt ||
    article.subtitle ||
    `Read ${article.title} on WaveNation.`
  )
}

function getArticleImage(article: ArticleLike) {
  const image = article.hero?.image

  if (!image?.url) {
    return newsSocialImage
  }

  return {
    url: image.url,
    width: image.width || 1200,
    height: image.height || 630,
    alt: image.alt || article.title,
  }
}

function createArticleJsonLd(article: ArticleLike) {
  const route = `/news/${article.slug || ''}`
  const image = getArticleImage(article)

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${absoluteUrl(route)}#article`,
    headline: article.title,
    description: getArticleDescription(article),
    image: [absoluteUrl(image.url)],
    datePublished:
      article.publishDate || article.publishedAt || article.createdAt || undefined,
    dateModified:
      article.updatedAt ||
      article.publishDate ||
      article.publishedAt ||
      article.createdAt ||
      undefined,
    author: {
      '@type': 'Person',
      name: article.author?.fullName || publisherName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      url: siteBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(newsSocialImage.url),
        width: newsSocialImage.width,
        height: newsSocialImage.height,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(route),
    },
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteBaseUrl,
    },
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveNewsSlug(slug)

  if (!resolved) {
    return buildNewsMetadata({
      title: 'Not Found',
      description: 'The requested WaveNation News page could not be found.',
      route: `/news/${slug}`,
      noIndex: true,
    })
  }

  if (resolved.type === 'category') {
    const category = resolved.category

    return buildNewsMetadata({
      title: category.seoTitle || `${category.name} News`,
      description:
        category.seoDescription ||
        category.description ||
        `Read the latest ${category.name} stories from WaveNation.`,
      route: `/news/${category.slug}`,
      keywords: [
        category.name,
        `${category.name} news`,
        'WaveNation News',
        'urban media',
      ],
    })
  }

  const article = resolved.article
  const image = getArticleImage(article)

  return buildNewsMetadata({
    title: article.seoTitle || article.title,
    description: getArticleDescription(article),
    route: `/news/${article.slug}`,
    image,
    type: 'article',
    keywords: [
      'WaveNation News',
      article.title,
      article.author?.fullName || 'WaveNation Editorial',
    ],
  })
}

export default async function NewsSlugPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = await resolveNewsSlug(slug)

  if (!resolved) notFound()

  if (resolved.type === 'category') {
    const category = resolved.category
    const route = `/news/${category.slug}`

    const articles = await getArticles({ categoryId: category.id }, 1, 12)
    const docs = Array.isArray(articles.docs) ? articles.docs : []

    const jsonLd = [
      createCollectionPageJsonLd({
        route,
        name: `${category.name} News`,
        description:
          category.description ||
          `Read the latest ${category.name} stories from WaveNation.`,
      }),
      createBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'News', path: '/news' },
        { name: category.name, path: route },
      ]),
    ]

    return (
      <main
        className={styles.page}
        data-analytics-page="news-category"
        data-analytics-page-title={category.name}
        data-analytics-page-type="news-category"
        data-analytics-category={category.slug}
        data-analytics-has-results={docs.length > 0 ? 'true' : 'false'}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(jsonLd),
          }}
        />

        <NewsCollectionShell
          eyebrow="Category"
          title={category.name}
          description={
            category.description ||
            `Read the latest ${category.name} stories from WaveNation.`
          }
          accent={category.themeColor || undefined}
        >
          <NewsInfiniteGrid
            initialDocs={docs}
            initialPage={articles.page || 1}
            initialHasNextPage={Boolean(articles.hasNextPage)}
            filters={{ categorySlug: category.slug }}
            emptyTitle={`No ${category.name} stories yet.`}
            emptyDescription="This category is connected to Payload CMS and ready for new articles."
          />
        </NewsCollectionShell>
      </main>
    )
  }

  const article = resolved.article
  const related = await getRelatedArticles(article)

  const jsonLd = [
    createArticleJsonLd(article),
    createBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
      { name: article.title, path: `/news/${article.slug}` },
    ]),
  ]

  return (
    <main
      className={styles.page}
      data-analytics-page="news-article"
      data-analytics-page-title={article.title}
      data-analytics-page-type="news-article"
      data-analytics-article-slug={article.slug}
      data-analytics-author={article.author?.fullName || 'WaveNation Editorial'}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <ArticleShell article={article} relatedArticles={related} />
    </main>
  )
}