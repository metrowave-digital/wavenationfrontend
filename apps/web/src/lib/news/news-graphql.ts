import 'server-only'

import type {
  ArticleQueryFilters,
  NewsArticle,
  NewsAuthor,
  NewsCategory,
  NewsSubcategory,
  NewsTag,
  NewsTopic,
  PayloadID,
  PayloadPaginated,
} from './news-types'

function normalizeGraphQLUrl(value?: string) {
  const fallbackBase = 'https://cms.wavenation.online'
  const raw = (value || fallbackBase).trim().replace(/\/$/, '')

  if (raw.endsWith('/api/graphql')) return raw

  // Fix the old incorrect endpoint automatically.
  if (raw.endsWith('/graphql')) {
    return raw.replace(/\/graphql$/, '/api/graphql')
  }

  return `${raw}/api/graphql`
}

const GRAPHQL_URL = normalizeGraphQLUrl(
  process.env.WAVENATION_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_WAVENATION_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_WAVENATION_CMS_URL,
)

type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

async function cmsGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: options.revalidate ?? 60,
      tags: options.tags ?? ['wavenation-news'],
    },
  })

  if (!response.ok) {
    throw new Error(`WaveNation CMS GraphQL failed: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as GraphQLResponse<T>

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join('\n'))
  }

  if (!json.data) {
    throw new Error('WaveNation CMS GraphQL returned no data.')
  }

  return json.data
}

const MEDIA_FIELDS = /* GraphQL */ `
  id
  alt
  caption
  credit
  url
  thumbnailURL
  filename
  mimeType
  width
  height
  sizes {
    hero {
      url
      width
      height
      mimeType
      filesize
      filename
    }
    card {
      url
      width
      height
      mimeType
      filesize
      filename
    }
    thumb {
      url
      width
      height
      mimeType
      filesize
      filename
    }
    square {
      url
      width
      height
      mimeType
      filesize
      filename
    }
  }
`

const CATEGORY_FIELDS = /* GraphQL */ `
  id
  name
  description
  themeColor
  slug
  seoTitle
  seoDescription
  status
`

const SUBCATEGORY_FIELDS = /* GraphQL */ `
  id
  name
  description
  slug
  themeColorOverride
  status
  category {
    ${CATEGORY_FIELDS}
  }
`

const TOPIC_FIELDS = /* GraphQL */ `
  id
  name
  slug
  shortLabel
  description
  accentColor
  status
`

const TAG_FIELDS = /* GraphQL */ `
  id
  label
  slug
  tagType
  description
  isFeatured
`

const AUTHOR_FIELDS = /* GraphQL */ `
  id
  firstName
  lastName
  fullName
  slug
  role
  status
  bio
  avatar {
    ${MEDIA_FIELDS}
  }
  socialLinks {
    platform
    url
  }
`

const ARTICLE_CARD_FIELDS = /* GraphQL */ `
  id
  title
  subtitle
  excerpt
  slug
  status
  _status
  publishDate
  publishedAt
  scheduledPublishAt
  readingTime
  isBreaking
  isFeatured
  seoTitle
  seoDescription
  updatedAt
  createdAt
  hero {
    image {
      ${MEDIA_FIELDS}
    }
    caption
    credit
  }
  author {
    ${AUTHOR_FIELDS}
  }
  categories {
    ${CATEGORY_FIELDS}
  }
  subcategories {
    ${SUBCATEGORY_FIELDS}
  }
  topics {
    ${TOPIC_FIELDS}
  }
  tags {
    ${TAG_FIELDS}
  }
`

/**
 * Block fragment names may differ if your Payload block interfaceName values are custom.
 * The renderer below supports richText, image, quote, embed, video, ad, cta, and gallery blocks.
 * If GraphQL throws on a fragment name, open /graphql-playground and replace only that fragment name.
 */
const ARTICLE_BLOCK_FIELDS = /* GraphQL */ `
  contentBlocks {
    __typename

    ... on RichText {
      id
      blockName
      blockType
      dropCap
      content
    }

    ... on ImageBlock {
      id
      blockName
      blockType
      image {
        ${MEDIA_FIELDS}
      }
      caption
      credit
    }

    ... on QuoteBlock {
      id
      blockName
      blockType
      quote
      attribution
      source
    }

    ... on EmbedBlock {
      id
      blockName
      blockType
      embedUrl
      url
      title
      caption
    }

    ... on VideoBlock {
      id
      blockName
      blockType
      title
      description
      videoUrl
      poster {
        ${MEDIA_FIELDS}
      }
      media {
        ${MEDIA_FIELDS}
      }
    }

    ... on AdBlock {
      id
      blockName
      blockType
      label
      slotId
      size
    }

    ... on CTABlock {
      id
      blockName
      blockType
      eyebrow
      title
      description
      href
      label
    }

    ... on GalleryBlock {
      id
      blockName
      blockType
      title
      images {
        image {
          ${MEDIA_FIELDS}
        }
        caption
        credit
      }
    }
  }
`

function publishedWhere() {
  return {
    status: {
      equals: 'published',
    },
  }
}

function activeWhere() {
  return {
    status: {
      equals: 'active',
    },
  }
}

function dateRangeWhere(year?: string, month?: string) {
  if (!year) return null

  const parsedYear = Number(year)
  if (!Number.isFinite(parsedYear)) return null

  const parsedMonth = month ? Number(month) : null

  const start = parsedMonth
    ? new Date(Date.UTC(parsedYear, parsedMonth - 1, 1))
    : new Date(Date.UTC(parsedYear, 0, 1))

  const end = parsedMonth
    ? new Date(Date.UTC(parsedYear, parsedMonth, 1))
    : new Date(Date.UTC(parsedYear + 1, 0, 1))

  return {
    publishDate: {
      greater_than_equal: start.toISOString(),
      less_than: end.toISOString(),
    },
  }
}

function buildArticleWhere(filters: ArticleQueryFilters = {}) {
  const and: Record<string, unknown>[] = [publishedWhere()]

  if (filters.categoryId) {
    and.push({
      categories: {
        contains: filters.categoryId,
      },
    })
  }

  if (filters.subcategoryId) {
    and.push({
      subcategories: {
        contains: filters.subcategoryId,
      },
    })
  }

  if (filters.topicId) {
    and.push({
      topics: {
        contains: filters.topicId,
      },
    })
  }

  if (filters.tagId) {
    and.push({
      tags: {
        contains: filters.tagId,
      },
    })
  }

  if (filters.authorId) {
    and.push({
      author: {
        equals: filters.authorId,
      },
    })
  }

  const dateRange = dateRangeWhere(filters.year, filters.month)
  if (dateRange) and.push(dateRange)

  if (filters.search?.trim()) {
    const q = filters.search.trim()

    and.push({
      or: [
        { title: { like: q } },
        { subtitle: { like: q } },
        { excerpt: { like: q } },
      ],
    })
  }

  return and.length === 1 ? and[0] : { and }
}

export async function getArticles(
  filters: ArticleQueryFilters = {},
  page = 1,
  limit = 12,
): Promise<PayloadPaginated<NewsArticle>> {
  const data = await cmsGraphQL<{
    Articles: PayloadPaginated<NewsArticle>
  }>(
    /* GraphQL */ `
      query Articles($where: Article_where, $page: Int, $limit: Int, $sort: String) {
        Articles(where: $where, page: $page, limit: $limit, sort: $sort) {
          docs {
            ${ARTICLE_CARD_FIELDS}
          }
          totalDocs
          limit
          totalPages
          page
          pagingCounter
          hasPrevPage
          hasNextPage
          prevPage
          nextPage
        }
      }
    `,
    {
      where: buildArticleWhere(filters),
      page,
      limit,
      sort: '-publishDate',
    },
    { tags: ['articles'] },
  )

  return data.Articles
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const data = await cmsGraphQL<{
    Articles: PayloadPaginated<NewsArticle>
  }>(
    /* GraphQL */ `
      query ArticleBySlug($slug: String!) {
        Articles(
          where: {
            and: [
              { slug: { equals: $slug } }
              { status: { equals: "published" } }
            ]
          }
          limit: 1
        ) {
          docs {
            ${ARTICLE_CARD_FIELDS}
            ${ARTICLE_BLOCK_FIELDS}
          }
          totalDocs
        }
      }
    `,
    { slug },
    { tags: [`article:${slug}`] },
  )

  return data.Articles.docs[0] ?? null
}

export async function getCategoryBySlug(slug: string): Promise<NewsCategory | null> {
  const data = await cmsGraphQL<{
    Categories: PayloadPaginated<NewsCategory>
  }>(
    /* GraphQL */ `
      query CategoryBySlug($slug: String!) {
        Categories(
          where: {
            and: [
              { slug: { equals: $slug } }
              { status: { equals: "active" } }
            ]
          }
          limit: 1
        ) {
          docs {
            ${CATEGORY_FIELDS}
          }
          totalDocs
        }
      }
    `,
    { slug },
    { tags: [`category:${slug}`] },
  )

  return data.Categories.docs[0] ?? null
}

export async function getSubcategoryBySlug(
  slug: string,
  categoryId?: PayloadID,
): Promise<NewsSubcategory | null> {
  const and: Record<string, unknown>[] = [
    { slug: { equals: slug } },
    activeWhere(),
  ]

  if (categoryId) {
    and.push({
      category: {
        equals: categoryId,
      },
    })
  }

  const data = await cmsGraphQL<{
    Subcategories: PayloadPaginated<NewsSubcategory>
  }>(
    /* GraphQL */ `
      query SubcategoryBySlug($where: Subcategory_where) {
        Subcategories(where: $where, limit: 1) {
          docs {
            ${SUBCATEGORY_FIELDS}
          }
          totalDocs
        }
      }
    `,
    { where: { and } },
    { tags: [`subcategory:${slug}`] },
  )

  return data.Subcategories.docs[0] ?? null
}

export async function getTopicBySlug(slug: string): Promise<NewsTopic | null> {
  const data = await cmsGraphQL<{
    Topics: PayloadPaginated<NewsTopic>
  }>(
    /* GraphQL */ `
      query TopicBySlug($slug: String!) {
        Topics(
          where: {
            and: [
              { slug: { equals: $slug } }
              { status: { equals: "active" } }
            ]
          }
          limit: 1
        ) {
          docs {
            ${TOPIC_FIELDS}
          }
          totalDocs
        }
      }
    `,
    { slug },
    { tags: [`topic:${slug}`] },
  )

  return data.Topics.docs[0] ?? null
}

export async function getTagBySlug(slug: string): Promise<NewsTag | null> {
  const data = await cmsGraphQL<{
    Tags: PayloadPaginated<NewsTag>
  }>(
    /* GraphQL */ `
      query TagBySlug($slug: String!) {
        Tags(where: { slug: { equals: $slug } }, limit: 1) {
          docs {
            ${TAG_FIELDS}
          }
          totalDocs
        }
      }
    `,
    { slug },
    { tags: [`tag:${slug}`] },
  )

  return data.Tags.docs[0] ?? null
}

export async function getAuthorBySlug(slug: string): Promise<NewsAuthor | null> {
  const data = await cmsGraphQL<{
    Authors: PayloadPaginated<NewsAuthor>
  }>(
    /* GraphQL */ `
      query AuthorBySlug($slug: String!) {
        Authors(
          where: {
            and: [
              { slug: { equals: $slug } }
              { status: { equals: "active" } }
            ]
          }
          limit: 1
        ) {
          docs {
            ${AUTHOR_FIELDS}
          }
          totalDocs
        }
      }
    `,
    { slug },
    { tags: [`author:${slug}`] },
  )

  return data.Authors.docs[0] ?? null
}

export async function getRelatedArticles(article: NewsArticle, limit = 4) {
  const primaryCategory = article.categories?.[0]
  if (!primaryCategory) return []

  const data = await getArticles({ categoryId: primaryCategory.id }, 1, limit + 1)

  return data.docs.filter((item) => item.id !== article.id).slice(0, limit)
}

export async function resolveNewsSlug(slug: string) {
  const category = await getCategoryBySlug(slug)

  if (category) {
    return {
      type: 'category' as const,
      category,
    }
  }

  const article = await getArticleBySlug(slug)

  if (article) {
    return {
      type: 'article' as const,
      article,
    }
  }

  return null
}