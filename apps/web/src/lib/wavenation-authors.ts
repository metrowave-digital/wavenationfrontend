import type {
  AuthorArticleSummary,
  AuthorBeat,
  AuthorProfileData,
  AuthorsPagination,
} from '@wavenation/ui-web'

const CMS_BASE_URL =
  process.env.NEXT_PUBLIC_WAVENATION_CMS_URL?.replace(/\/$/, '') ??
  'https://cms.wavenation.online'

const AUTHORS_COLLECTION = 'authors'
const ARTICLES_COLLECTION = 'articles'

export type PayloadCollectionResponse<T> = {
  docs?: T[]
  totalDocs?: number
  limit?: number
  totalPages?: number
  page?: number
  pagingCounter?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
  prevPage?: number | null
  nextPage?: number | null
}

type PayloadRichTextNode = {
  text?: string
  children?: PayloadRichTextNode[]
}

type PayloadRichText = {
  root?: PayloadRichTextNode
}

type PayloadMediaSize = {
  url?: string | null
  width?: number | null
  height?: number | null
}

type PayloadMedia = {
  url?: string | null
  alt?: string | null
  sizes?: {
    hero?: PayloadMediaSize | null
    card?: PayloadMediaSize | null
    thumb?: PayloadMediaSize | null
    square?: PayloadMediaSize | null
  } | null
}

type RawAuthorSocialLink = {
  id?: string
  platform?: string | null
  url?: string | null
}

type RawBeat = {
  id?: string | number
  name?: string | null
  slug?: string | null
  description?: string | null
  themeColor?: string | null
  status?: string | null
}

type RawAuthor = {
  id: string | number
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  email?: string | null
  bio?: PayloadRichText | null
  avatar?: PayloadMedia | null
  socialLinks?: RawAuthorSocialLink[] | null
  beats?: RawBeat[] | null
  aiAuthorityScore?: number | null
  slug?: string | null
  status?: string | null
  role?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

type RawArticle = {
  id: string | number
  title?: string | null
  subtitle?: string | null
  excerpt?: string | null
  slug?: string | null
  status?: string | null
  _status?: string | null
  publishDate?: string | null
  publishedAt?: string | null
  createdAt?: string | null
  readingTime?: number | null
  isBreaking?: boolean | null
  isFeatured?: boolean | null
  hero?: {
    image?: PayloadMedia | null
    caption?: string | null
    credit?: string | null
  } | null
  heroImage?: PayloadMedia | null
  categories?: RawBeat[] | null
  category?: RawBeat | null
}

type GetActiveAuthorsOptions = {
  page?: number
  limit?: number
  beatSlug?: string
}

type GetAuthorArticlesOptions = {
  page?: number
  limit?: number
}

type AuthorsResponse = AuthorsPagination & {
  authors: AuthorProfileData[]
}

type ArticlesResponse = AuthorsPagination & {
  articles: AuthorArticleSummary[]
}

function safePage(value: unknown, fallback = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

function buildUrl(path: string, params?: URLSearchParams) {
  const search = params?.toString()
  return `${CMS_BASE_URL}${path}${search ? `?${search}` : ''}`
}

async function cmsFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = buildUrl(path, params)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    next: {
      revalidate: 120,
    },
  })

  if (!response.ok) {
    throw new Error(`WaveNation CMS REST failed: ${response.status} ${response.statusText} for ${url}`)
  }

  return response.json() as Promise<T>
}

function extractTextFromRichTextNode(node?: PayloadRichTextNode): string {
  if (!node) return ''
  const ownText = typeof node.text === 'string' ? node.text : ''
  const childText = Array.isArray(node.children)
    ? node.children.map(extractTextFromRichTextNode).join(' ')
    : ''

  return [ownText, childText].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

function richTextToPlainText(value?: PayloadRichText | null) {
  return extractTextFromRichTextNode(value?.root)
}

function getInitials(author: RawAuthor) {
  const first = author.firstName?.trim()?.[0]
  const last = author.lastName?.trim()?.[0]

  if (first || last) return `${first ?? ''}${last ?? ''}`.toUpperCase()

  return (author.fullName ?? 'WN')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function normalizeExternalUrl(url?: string | null) {
  const cleanUrl = url?.trim()
  if (!cleanUrl) return undefined

  if (/^https?:\/\//i.test(cleanUrl)) return cleanUrl
  if (/^mailto:/i.test(cleanUrl)) return cleanUrl
  if (/^tel:/i.test(cleanUrl)) return cleanUrl

  return `https://${cleanUrl.replace(/^\/\//, '')}`
}

function mapBeat(beat: RawBeat): AuthorBeat | null {
  if (!beat?.name) return null

  return {
    id: beat.id,
    name: beat.name,
    slug: beat.slug ?? undefined,
    description: beat.description ?? undefined,
    themeColor: beat.themeColor ?? undefined,
  }
}

function getAvatarUrl(author: RawAuthor) {
  return (
    author.avatar?.sizes?.square?.url ??
    author.avatar?.sizes?.thumb?.url ??
    author.avatar?.url ??
    undefined
  )
}

function mapAuthor(author: RawAuthor): AuthorProfileData {
  const fullName =
    author.fullName?.trim() ||
    [author.firstName, author.lastName].filter(Boolean).join(' ').trim() ||
    'WaveNation Contributor'

  const beats = (author.beats ?? [])
    .map(mapBeat)
    .filter((beat): beat is AuthorBeat => Boolean(beat))

  return {
    id: author.id,
    firstName: author.firstName ?? undefined,
    lastName: author.lastName ?? undefined,
    fullName,
    initials: getInitials(author),
    email: author.email ?? undefined,
    bioText: richTextToPlainText(author.bio) || 'This WaveNation contributor is part of the culture desk.',
    avatarUrl: getAvatarUrl(author),
    avatarAlt: author.avatar?.alt ?? `${fullName} profile image`,
    socialLinks: (author.socialLinks ?? [])
      .map((link) => ({
        id: link.id,
        platform: link.platform ?? 'link',
        url: normalizeExternalUrl(link.url),
      }))
      .filter((link): link is { id?: string; platform: string; url: string } => Boolean(link.url)),
    beats,
    aiAuthorityScore: author.aiAuthorityScore ?? undefined,
    slug: author.slug ?? String(author.id),
    status: author.status ?? undefined,
    role: author.role ?? undefined,
    href: `/authors/${author.slug ?? author.id}`,
  }
}

function getArticleHeroImage(article: RawArticle) {
  const media = article.hero?.image ?? article.heroImage

  return {
    imageUrl: media?.sizes?.card?.url ?? media?.sizes?.hero?.url ?? media?.url ?? undefined,
    imageAlt: media?.alt ?? article.title ?? 'WaveNation article image',
  }
}

function formatArticleDate(article: RawArticle) {
  return article.publishDate ?? article.publishedAt ?? article.createdAt ?? undefined
}

function mapArticle(article: RawArticle): AuthorArticleSummary {
  const primaryCategory = article.categories?.[0] ?? article.category
  const { imageUrl, imageAlt } = getArticleHeroImage(article)

  return {
    id: article.id,
    title: article.title ?? 'Untitled story',
    excerpt: article.excerpt ?? article.subtitle ?? undefined,
    href: `/news/${article.slug ?? article.id}`,
    imageUrl,
    imageAlt,
    category: primaryCategory?.name ?? undefined,
    categoryColor: primaryCategory?.themeColor ?? undefined,
    publishedAt: formatArticleDate(article),
    readingTime: article.readingTime ?? undefined,
    badge: article.isBreaking ? 'Breaking' : article.isFeatured ? 'Featured' : undefined,
  }
}

function createPagination<T>(response: PayloadCollectionResponse<T>): AuthorsPagination {
  return {
    page: response.page ?? 1,
    limit: response.limit ?? 24,
    totalDocs: response.totalDocs ?? response.docs?.length ?? 0,
    totalPages: response.totalPages ?? 1,
    hasNextPage: Boolean(response.hasNextPage),
    hasPrevPage: Boolean(response.hasPrevPage),
    nextPage: response.nextPage ?? null,
    prevPage: response.prevPage ?? null,
  }
}

function paginateArray<T>(items: T[], page: number, limit: number) {
  const safeCurrentPage = safePage(page)
  const safeLimit = Math.max(1, Math.floor(limit))
  const totalDocs = items.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / safeLimit))
  const currentPage = Math.min(safeCurrentPage, totalPages)
  const start = (currentPage - 1) * safeLimit
  const docs = items.slice(start, start + safeLimit)

  return {
    docs,
    page: currentPage,
    limit: safeLimit,
    totalDocs,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  }
}

export async function getActiveAuthors({
  page = 1,
  limit = 24,
  beatSlug,
}: GetActiveAuthorsOptions = {}): Promise<AuthorsResponse> {
  const params = new URLSearchParams()
  params.set('depth', '2')
  params.set('sort', 'lastName,firstName')
  params.set('where[status][equals]', 'active')

  if (beatSlug) {
    params.set('limit', '100')
  } else {
    params.set('page', String(safePage(page)))
    params.set('limit', String(limit))
  }

  const response = await cmsFetch<PayloadCollectionResponse<RawAuthor>>(
    `/api/${AUTHORS_COLLECTION}`,
    params,
  )

  const mappedAuthors = (response.docs ?? []).map(mapAuthor)

  if (!beatSlug) {
    return {
      authors: mappedAuthors,
      ...createPagination(response),
    }
  }

  const filtered = mappedAuthors.filter((author) =>
    author.beats.some((beat) => beat.slug === beatSlug),
  )

  const paginated = paginateArray(filtered, page, limit)

  return {
    authors: paginated.docs,
    ...createPagination(paginated),
  }
}

export async function getAuthorBeats(): Promise<AuthorBeat[]> {
  const params = new URLSearchParams()
  params.set('depth', '2')
  params.set('limit', '100')
  params.set('where[status][equals]', 'active')

  const response = await cmsFetch<PayloadCollectionResponse<RawAuthor>>(
    `/api/${AUTHORS_COLLECTION}`,
    params,
  )

  const beatMap = new Map<string, AuthorBeat>()

  for (const author of response.docs ?? []) {
    for (const beat of author.beats ?? []) {
      const mappedBeat = mapBeat(beat)
      const key = mappedBeat?.slug ?? mappedBeat?.name
      if (mappedBeat && key && !beatMap.has(key)) {
        beatMap.set(key, mappedBeat)
      }
    }
  }

  return Array.from(beatMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getAuthorBySlug(slug: string): Promise<AuthorProfileData | null> {
  const params = new URLSearchParams()
  params.set('depth', '2')
  params.set('limit', '1')
  params.set('where[slug][equals]', slug)
  params.set('where[status][equals]', 'active')

  const response = await cmsFetch<PayloadCollectionResponse<RawAuthor>>(
    `/api/${AUTHORS_COLLECTION}`,
    params,
  )

  const author = response.docs?.[0]

  return author ? mapAuthor(author) : null
}

export async function getAuthorArticles(
  authorId: string | number,
  { page = 1, limit = 12 }: GetAuthorArticlesOptions = {},
): Promise<ArticlesResponse> {
  const params = new URLSearchParams()
  params.set('depth', '2')
  params.set('page', String(safePage(page)))
  params.set('limit', String(limit))
  params.set('sort', '-publishDate')
  params.set('where[status][equals]', 'published')
  params.set('where[author][equals]', String(authorId))

  const response = await cmsFetch<PayloadCollectionResponse<RawArticle>>(
    `/api/${ARTICLES_COLLECTION}`,
    params,
  )

  return {
    articles: (response.docs ?? []).map(mapArticle),
    ...createPagination(response),
  }
}
