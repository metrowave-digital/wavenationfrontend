export type HomepageAccent = 'blue' | 'magenta' | 'green' | 'teal' | 'news'

export type HomepageArticle = {
  id: string
  title: string
  subtitle?: string
  excerpt?: string
  href: string
  imageUrl?: string
  imageAlt?: string
  categoryName: string
  categorySlug?: string
  subcategorySlugs: string[]
  authorName?: string
  publishDate?: string
  readingTime?: number
  isBreaking?: boolean
  isFeatured?: boolean
  accent: HomepageAccent
}

export type HomepageEvent = {
  id: string
  title: string
  href: string
  watchHref: string
  imageUrl?: string
  imageAlt?: string
  dateLabel?: string
  statusLabel?: string
  eventType?: string
  accent: HomepageAccent
}

export type HomepageCategorySection = {
  slug: string
  title: string
  href: string
  accent: HomepageAccent
  articles: HomepageArticle[]
}

export type HomepageData = {
  latestArticles: HomepageArticle[]
  leadArticle?: HomepageArticle
  topStories: HomepageArticle[]
  latestList: HomepageArticle[]
  trendingArticles: HomepageArticle[]
  categorySections: HomepageCategorySection[]
  events: HomepageEvent[]
}

type CmsRecord = Record<string, unknown>

type PayloadListResponse = {
  docs?: unknown[]
}

const cmsBaseUrl = process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || 'https://cms.wavenation.online'

const CATEGORY_CONFIG: Array<{
  slug: string
  title: string
  href: string
  accent: HomepageAccent
  type?: 'category' | 'subcategory'
}> = [
  { slug: 'music', title: 'Music', href: '/news/music', accent: 'blue' },
  {
    slug: 'artist-spotlights',
    title: 'Artist Spotlights',
    href: '/music/artist-spotlights',
    accent: 'green',
    type: 'subcategory',
  },
  { slug: 'film-tv', title: 'Film & TV', href: '/news/film-tv', accent: 'magenta' },
  { slug: 'culture', title: 'Culture', href: '/news/culture', accent: 'magenta' },
  { slug: 'sports', title: 'Sports', href: '/news/sports', accent: 'green' },
  { slug: 'business-tech', title: 'Business & Tech', href: '/news/business-tech', accent: 'teal' },
]

function isRecord(value: unknown): value is CmsRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(record: CmsRecord, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function getNumber(record: CmsRecord, key: string): number | undefined {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function getBoolean(record: CmsRecord, key: string): boolean | undefined {
  const value = record[key]
  return typeof value === 'boolean' ? value : undefined
}

function getArray(record: CmsRecord, key: string): unknown[] {
  const value = record[key]
  return Array.isArray(value) ? value : []
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeCommonEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/â€™/g, '’')
    .replace(/â€œ/g, '“')
    .replace(/â€�/g, '”')
    .replace(/Â/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value?: string): string | undefined {
  if (!value) return undefined
  const cleaned = decodeCommonEntities(stripHtml(value))
  return cleaned.length > 0 ? cleaned : undefined
}

function truncate(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined
  if (value.length <= maxLength) return value
  const clipped = value.slice(0, maxLength - 1).trim()
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > 60 ? lastSpace : clipped.length).trim()}…`
}

function getNestedRecord(record: CmsRecord, keys: string[]): CmsRecord | undefined {
  let current: unknown = record

  for (const key of keys) {
    if (!isRecord(current)) return undefined
    current = current[key]
  }

  return isRecord(current) ? current : undefined
}

function firstMediaFrom(value: unknown): CmsRecord | undefined {
  if (isRecord(value)) {
    const image = value.image
    if (isRecord(image)) return image

    const media = value.media
    if (isRecord(media)) return media

    const file = value.file
    if (isRecord(file)) return file

    if (typeof value.url === 'string') return value
  }

  return undefined
}

function getMediaUrl(media?: CmsRecord): string | undefined {
  if (!media) return undefined

  const sizes = media.sizes
  if (isRecord(sizes)) {
    const card = sizes.card
    if (isRecord(card)) {
      const url = getString(card, 'url')
      if (url) return url
    }

    const hero = sizes.hero
    if (isRecord(hero)) {
      const url = getString(hero, 'url')
      if (url) return url
    }

    const thumb = sizes.thumb
    if (isRecord(thumb)) {
      const url = getString(thumb, 'url')
      if (url) return url
    }
  }

  return getString(media, 'url') || getString(media, 'src')
}

function getArticleImage(record: CmsRecord): { imageUrl?: string; imageAlt?: string } {
  const possibleMedia = [
    firstMediaFrom(record.hero),
    firstMediaFrom(record.heroImage),
    firstMediaFrom(record.featuredImage),
    firstMediaFrom(record.coverImage),
    firstMediaFrom(record.image),
  ].find(Boolean)

  const imageUrl = getMediaUrl(possibleMedia)
  const imageAlt = cleanText(
    (possibleMedia && (getString(possibleMedia, 'alt') || getString(possibleMedia, 'caption'))) ||
      getString(record, 'title') ||
      'WaveNation story image',
  )

  return { imageUrl, imageAlt }
}

function getPrimaryCategory(record: CmsRecord): { name: string; slug?: string; accent: HomepageAccent } {
  const categories = getArray(record, 'categories')
  const firstCategory = categories.find(isRecord)
  const slug = firstCategory ? getString(firstCategory, 'slug') : undefined
  const name = firstCategory ? getString(firstCategory, 'name') || 'News' : 'News'

  if (slug === 'music') return { name, slug, accent: 'blue' }
  if (slug === 'film-tv') return { name, slug, accent: 'magenta' }
  if (slug === 'sports') return { name, slug, accent: 'green' }
  if (slug === 'business-tech') return { name, slug, accent: 'teal' }
  if (slug === 'culture') return { name, slug, accent: 'magenta' }

  return { name, slug, accent: 'news' }
}

function getSlugsFromRelationshipArray(record: CmsRecord, key: string): string[] {
  return getArray(record, key)
    .map((item) => (isRecord(item) ? getString(item, 'slug') : undefined))
    .filter((value): value is string => Boolean(value))
}

function getAuthorName(record: CmsRecord): string | undefined {
  const author = record.author
  if (!isRecord(author)) return undefined
  return getString(author, 'fullName') || [getString(author, 'firstName'), getString(author, 'lastName')].filter(Boolean).join(' ')
}

function articleHref(slug: string | undefined): string {
  return slug ? `/news/${slug}` : '/news'
}

function mapArticle(doc: unknown): HomepageArticle | undefined {
  if (!isRecord(doc)) return undefined

  const id = String(doc.id ?? doc.slug ?? Math.random())
  const title = cleanText(getString(doc, 'title'))
  const slug = getString(doc, 'slug')

  if (!title || !slug) return undefined

  const primaryCategory = getPrimaryCategory(doc)
  const { imageUrl, imageAlt } = getArticleImage(doc)
  const publishDate = getString(doc, 'publishDate') || getString(doc, 'publishedAt') || getString(doc, 'createdAt')

  return {
    id,
    title,
    subtitle: truncate(cleanText(getString(doc, 'subtitle')), 115),
    excerpt: truncate(cleanText(getString(doc, 'excerpt')), 145),
    href: articleHref(slug),
    imageUrl,
    imageAlt,
    categoryName: primaryCategory.name,
    categorySlug: primaryCategory.slug,
    subcategorySlugs: getSlugsFromRelationshipArray(doc, 'subcategories'),
    authorName: getAuthorName(doc),
    publishDate,
    readingTime: getNumber(doc, 'readingTime'),
    isBreaking: getBoolean(doc, 'isBreaking'),
    isFeatured: getBoolean(doc, 'isFeatured'),
    accent: primaryCategory.accent,
  }
}

function normalizePayloadDocs(payload: unknown): unknown[] {
  if (!isRecord(payload)) return []
  const response = payload as PayloadListResponse
  return Array.isArray(response.docs) ? response.docs : []
}

function buildCmsUrl(path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const url = new URL(path.replace(/^\//, ''), `${cmsBaseUrl.replace(/\/$/, '')}/`)

  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== 'undefined' && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  return url
}

async function fetchCmsList(path: string, params: Record<string, string | number | boolean | undefined>) {
  const url = buildCmsUrl(path, params)

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`[WaveNation homepage] CMS request failed: ${response.status} ${response.statusText} ${url.toString()}`)
      return []
    }

    return normalizePayloadDocs(await response.json())
  } catch (error) {
    console.warn('[WaveNation homepage] CMS request error:', error)
    return []
  }
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function getArticlesByCategory(articles: HomepageArticle[], slug: string): HomepageArticle[] {
  return articles.filter((article) => article.categorySlug === slug)
}

function getArticlesBySubcategory(articles: HomepageArticle[], slug: string): HomepageArticle[] {
  return articles.filter((article) => article.subcategorySlugs.includes(slug))
}

function getTrendingArticles(articles: HomepageArticle[]): HomepageArticle[] {
  return [...articles]
    .sort((a, b) => {
      const featuredScore = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
      const breakingScore = Number(Boolean(b.isBreaking)) - Number(Boolean(a.isBreaking))
      return featuredScore || breakingScore
    })
    .slice(0, 5)
}

function getDateValueFromRecord(record: CmsRecord): string | undefined {
  const eventSchedule = getNestedRecord(record, ['eventSchedule'])
  const schedule = getNestedRecord(record, ['schedule'])

  return (
    getString(record, 'startDate') ||
    getString(record, 'eventDate') ||
    getString(record, 'date') ||
    getString(record, 'startDateTime') ||
    (eventSchedule ? getString(eventSchedule, 'startDate') : undefined) ||
    (eventSchedule ? getString(eventSchedule, 'startDateTime') : undefined) ||
    (schedule ? getString(schedule, 'startDate') : undefined) ||
    (schedule ? getString(schedule, 'startDateTime') : undefined)
  )
}

function getEventImage(record: CmsRecord): { imageUrl?: string; imageAlt?: string } {
  const media = [
    firstMediaFrom(record.heroImage),
    firstMediaFrom(record.poster),
    firstMediaFrom(record.image),
    firstMediaFrom(record.coverImage),
    firstMediaFrom(record.thumbnail),
  ].find(Boolean)

  const imageUrl = getMediaUrl(media)
  const imageAlt = cleanText((media && getString(media, 'alt')) || getString(record, 'title') || 'WaveNation event image')

  return { imageUrl, imageAlt }
}

function mapEvent(doc: unknown): HomepageEvent | undefined {
  if (!isRecord(doc)) return undefined

  const title = cleanText(getString(doc, 'title') || getString(doc, 'name'))
  const slug = getString(doc, 'slug')

  if (!title || !slug) return undefined

  const id = String(doc.id ?? slug)
  const status = getString(doc, 'status')
  const eventType = getString(doc, 'eventType') || getString(doc, 'format')
  const dateValue = getDateValueFromRecord(doc)
  const { imageUrl, imageAlt } = getEventImage(doc)

  return {
    id,
    title,
    href: `/events/${slug}`,
    watchHref: `/watch/events/${slug}`,
    imageUrl,
    imageAlt,
    dateLabel: formatDate(dateValue),
    statusLabel: status ? labelize(status) : undefined,
    eventType: eventType ? labelize(eventType) : undefined,
    accent: eventType?.includes('virtual') || eventType?.includes('live') ? 'blue' : 'magenta',
  }
}

function labelize(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatDate(value?: string): string | undefined {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export async function getHomepageData(): Promise<HomepageData> {
  const [articleDocs, eventDocs] = await Promise.all([
    fetchCmsList('/api/articles', {
      depth: 3,
      limit: 80,
      'where[status][equals]': 'published',
      sort: '-publishDate',
    }),
    fetchCmsList('/api/events', {
      depth: 3,
      limit: 12,
      sort: 'startDate',
    }),
  ])

  const latestArticles = uniqueById(articleDocs.map(mapArticle).filter((item): item is HomepageArticle => Boolean(item)))
  const events = uniqueById(eventDocs.map(mapEvent).filter((item): item is HomepageEvent => Boolean(item))).slice(0, 6)

  const [leadArticle, ...remaining] = latestArticles
  const topStories = remaining.slice(0, 2)
  const latestList = remaining.slice(2, 8)

  const categorySections = CATEGORY_CONFIG.map((config) => {
    const articles =
      config.type === 'subcategory'
        ? getArticlesBySubcategory(latestArticles, config.slug)
        : getArticlesByCategory(latestArticles, config.slug)

    return {
      slug: config.slug,
      title: config.title,
      href: config.href,
      accent: config.accent,
      articles: articles.slice(0, 5),
    }
  })

  return {
    latestArticles,
    leadArticle,
    topStories,
    latestList,
    trendingArticles: getTrendingArticles(latestArticles).slice(0, 5),
    categorySections,
    events,
  }
}
