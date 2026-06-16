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
} from '@wavenation/ui-web'

const CMS_URL = normalizeCmsUrl(process.env.NEXT_PUBLIC_WAVENATION_CMS_URL)

function normalizeCmsUrl(value?: string) {
  return (value || 'https://cms.wavenation.online').replace(/\/$/, '')
}

function createParams() {
  const params = new URLSearchParams()
  params.set('depth', '3')
  return params
}

function addParam(params: URLSearchParams, key: string, value?: string | number | null) {
  if (value === undefined || value === null || value === '') return
  params.set(key, String(value))
}

async function cmsRest<T>(
  path: string,
  params?: URLSearchParams,
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const url = new URL(`${CMS_URL}${path}`)

  if (params) {
    params.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    next: {
      revalidate: options.revalidate ?? 60,
      tags: options.tags ?? ['wavenation-news'],
    },
  })

  if (!response.ok) {
    throw new Error(`WaveNation CMS REST failed: ${response.status} ${response.statusText} for ${url}`)
  }

  return response.json() as Promise<T>
}

function addPublishedWhere(params: URLSearchParams) {
  // Use this if your Articles collection has a custom status field.
  addParam(params, 'where[status][equals]', 'published')

  // If your Articles collection uses Payload drafts instead, replace the line above with:
  // addParam(params, 'where[_status][equals]', 'published')
}

function addActiveWhere(params: URLSearchParams) {
  addParam(params, 'where[status][equals]', 'active')
}

function addDateRangeWhere(params: URLSearchParams, year?: string, month?: string) {
  if (!year) return

  const parsedYear = Number(year)
  if (!Number.isFinite(parsedYear)) return

  const parsedMonth = month ? Number(month) : null

  const start = parsedMonth
    ? new Date(Date.UTC(parsedYear, parsedMonth - 1, 1))
    : new Date(Date.UTC(parsedYear, 0, 1))

  const end = parsedMonth
    ? new Date(Date.UTC(parsedYear, parsedMonth, 1))
    : new Date(Date.UTC(parsedYear + 1, 0, 1))

  addParam(params, 'where[publishDate][greater_than_equal]', start.toISOString())
  addParam(params, 'where[publishDate][less_than]', end.toISOString())
}

function addSearchWhere(params: URLSearchParams, search?: string) {
  const q = search?.trim()
  if (!q) return

  addParam(params, 'where[or][0][title][like]', q)
  addParam(params, 'where[or][1][subtitle][like]', q)
  addParam(params, 'where[or][2][excerpt][like]', q)
}

function addArticleFilters(params: URLSearchParams, filters: ArticleQueryFilters = {}) {
  addPublishedWhere(params)

  addParam(params, 'where[categories][contains]', filters.categoryId)
  addParam(params, 'where[subcategories][contains]', filters.subcategoryId)
  addParam(params, 'where[topics][contains]', filters.topicId)
  addParam(params, 'where[tags][contains]', filters.tagId)
  addParam(params, 'where[author][equals]', filters.authorId)

  addSearchWhere(params, filters.search)
  addDateRangeWhere(params, filters.year, filters.month)
}

export async function getArticles(
  filters: ArticleQueryFilters = {},
  page = 1,
  limit = 12,
): Promise<PayloadPaginated<NewsArticle>> {
  const params = createParams()

  addParam(params, 'page', page)
  addParam(params, 'limit', limit)
  addParam(params, 'sort', '-publishDate')

  addArticleFilters(params, filters)

  return cmsRest<PayloadPaginated<NewsArticle>>('/api/articles', params, {
    tags: ['articles'],
  })
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const params = createParams()

  addParam(params, 'limit', 1)
  addParam(params, 'where[slug][equals]', slug)
  addPublishedWhere(params)

  const data = await cmsRest<PayloadPaginated<NewsArticle>>('/api/articles', params, {
    tags: [`article:${slug}`],
  })

  return data.docs[0] ?? null
}

export async function getCategoryBySlug(slug: string): Promise<NewsCategory | null> {
  const params = createParams()

  addParam(params, 'limit', 1)
  addParam(params, 'where[slug][equals]', slug)
  addActiveWhere(params)

  const data = await cmsRest<PayloadPaginated<NewsCategory>>('/api/categories', params, {
    tags: [`category:${slug}`],
  })

  return data.docs[0] ?? null
}

export async function getSubcategoryBySlug(
  slug: string,
  categoryId?: PayloadID,
): Promise<NewsSubcategory | null> {
  const params = createParams()

  addParam(params, 'limit', 1)
  addParam(params, 'where[slug][equals]', slug)
  addParam(params, 'where[category][equals]', categoryId)
  addActiveWhere(params)

  const data = await cmsRest<PayloadPaginated<NewsSubcategory>>('/api/subcategories', params, {
    tags: [`subcategory:${slug}`],
  })

  return data.docs[0] ?? null
}

export async function getTopicBySlug(slug: string): Promise<NewsTopic | null> {
  const params = createParams()

  addParam(params, 'limit', 1)
  addParam(params, 'where[slug][equals]', slug)
  addActiveWhere(params)

  const data = await cmsRest<PayloadPaginated<NewsTopic>>('/api/topics', params, {
    tags: [`topic:${slug}`],
  })

  return data.docs[0] ?? null
}

export async function getTagBySlug(slug: string): Promise<NewsTag | null> {
  const params = createParams()

  addParam(params, 'limit', 1)
  addParam(params, 'where[slug][equals]', slug)

  const data = await cmsRest<PayloadPaginated<NewsTag>>('/api/tags', params, {
    tags: [`tag:${slug}`],
  })

  return data.docs[0] ?? null
}

export async function getAuthorBySlug(slug: string): Promise<NewsAuthor | null> {
  const params = createParams()

  addParam(params, 'limit', 1)
  addParam(params, 'where[slug][equals]', slug)
  addActiveWhere(params)

  const data = await cmsRest<PayloadPaginated<NewsAuthor>>('/api/authors', params, {
    tags: [`author:${slug}`],
  })

  return data.docs[0] ?? null
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