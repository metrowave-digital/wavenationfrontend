export type PayloadID = string | number

export type PayloadPaginated<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number | null
  nextPage?: number | null
}

export type WNMediaSize = {
  url?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  filesize?: number | null
  filename?: string | null
}

export type WNMedia = {
  id?: PayloadID
  alt?: string | null
  caption?: string | null
  credit?: string | null
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  sizes?: {
    hero?: WNMediaSize | null
    card?: WNMediaSize | null
    thumb?: WNMediaSize | null
    square?: WNMediaSize | null
  } | null
}

export type NewsCategory = {
  id: PayloadID
  name: string
  description?: string | null
  themeColor?: string | null
  slug: string
  seoTitle?: string | null
  seoDescription?: string | null
  status?: string | null
}

export type NewsSubcategory = {
  id: PayloadID
  name: string
  description?: string | null
  slug: string
  themeColorOverride?: string | null
  status?: string | null
  category?: NewsCategory | null
}

export type NewsTopic = {
  id: PayloadID
  name: string
  slug: string
  shortLabel?: string | null
  description?: string | null
  accentColor?: string | null
  status?: string | null
}

export type NewsTag = {
  id: PayloadID
  label: string
  slug: string
  tagType?: string | null
  description?: string | null
  isFeatured?: boolean | null
}

export type NewsAuthor = {
  id: PayloadID
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  slug: string
  role?: string | null
  status?: string | null
  bio?: unknown
  avatar?: WNMedia | null
  socialLinks?: Array<{
    platform?: string | null
    url?: string | null
  }> | null
}

export type ArticleContentBlock = {
  id?: string
  blockType?: string
  blockName?: string | null
  [key: string]: unknown
}

export type NewsArticle = {
  id: PayloadID
  title: string
  subtitle?: string | null
  excerpt?: string | null
  slug: string
  status?: string | null
  _status?: string | null
  publishDate?: string | null
  publishedAt?: string | null
  scheduledPublishAt?: string | null
  readingTime?: number | null
  isBreaking?: boolean | null
  isFeatured?: boolean | null
  seoTitle?: string | null
  seoDescription?: string | null
  hero?: {
    image?: WNMedia | null
    caption?: string | null
    credit?: string | null
  } | null
  author?: NewsAuthor | null
  categories?: NewsCategory[] | null
  subcategories?: NewsSubcategory[] | null
  topics?: NewsTopic[] | null
  tags?: NewsTag[] | null
  contentBlocks?: ArticleContentBlock[] | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type ArticleQueryFilters = {
  categoryId?: PayloadID
  subcategoryId?: PayloadID
  topicId?: PayloadID
  tagId?: PayloadID
  authorId?: PayloadID
  categorySlug?: string
  subcategorySlug?: string
  topicSlug?: string
  tagSlug?: string
  authorSlug?: string
  search?: string
  year?: string
  month?: string
}

export function getArticleHref(article: Pick<NewsArticle, 'slug'>) {
  return `/news/${article.slug}`
}

export function getBestImageUrl(
  media?: WNMedia | null,
  size: 'hero' | 'card' | 'thumb' | 'square' = 'card',
) {
  return (
    media?.sizes?.[size]?.url ||
    media?.sizes?.card?.url ||
    media?.sizes?.hero?.url ||
    media?.sizes?.thumb?.url ||
    media?.url ||
    media?.thumbnailURL ||
    null
  )
}

export function getPrimaryCategory(article?: Pick<NewsArticle, 'categories'> | null) {
  return article?.categories?.[0] ?? null
}

export function getPrimarySubcategory(article?: Pick<NewsArticle, 'subcategories'> | null) {
  return article?.subcategories?.[0] ?? null
}

export function formatNewsDate(value?: string | null) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}