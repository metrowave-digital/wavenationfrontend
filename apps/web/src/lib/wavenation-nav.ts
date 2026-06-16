import type {
  DynamicTickerConfig,
  FooterConfig,
  NavConfig,
  NewsTickerArticle,
  NewsTickerSettings,
  SiteSettings,
} from '@wavenation/ui-web'

const CMS_URL = process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || 'https://cms.wavenation.online'

type PayloadListResponse<T> = {
  docs?: T[]
  totalDocs?: number
}

type CmsArticle = {
  id?: string | number
  title?: string
  slug?: string
  excerpt?: string
  publishDate?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  status?: string
  categories?: Array<{
    name?: string
    slug?: string
    themeColor?: string
  }>
}

function normalizePath(path: string) {
  if (path.startsWith('http')) return path
  return `${CMS_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function cmsFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(normalizePath(path), {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return fallback
    }

    return (await response.json()) as T
  } catch {
    return fallback
  }
}

function startOfCurrentWeekUTC() {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day

  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff))
  start.setUTCHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 7)
  end.setUTCHours(0, 0, 0, 0)

  return { start, end }
}

function seededShuffle<T>(items: T[]) {
  const dateSeed = new Date().toISOString().slice(0, 10)
  let seed = [...dateSeed].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280
    const j = Math.floor((seed / 233280) * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function articleToTickerItem(article: CmsArticle): NewsTickerArticle | null {
  if (!article.title) return null

  const category = article.categories?.[0]
  const href = article.slug ? `/news/${article.slug}` : `/news`

  return {
    id: article.id,
    label: article.title,
    href,
    eyebrow: category?.name || 'Story',
    accent: category?.themeColor,
  }
}

export async function getSiteSettings() {
  return cmsFetch<SiteSettings>('/api/globals/site-settings?depth=2', {
    siteTitle: 'WaveNation',
    tagline: 'Amplify Your Vibe',
  })
}

export async function getNavConfig() {
  return cmsFetch<NavConfig>('/api/globals/nav-config?depth=3', {
    mainNav: [],
  })
}

export async function getFooterConfig() {
  return cmsFetch<FooterConfig>('/api/globals/footer-config?depth=2', {
    columns: [],
    legalLinks: [],
  })
}

export async function getNewsTickerSettings() {
  return cmsFetch<NewsTickerSettings>('/api/globals/news-ticker-settings?depth=2', {
    defaultLabel: 'LATEST STORIES',
    scrollSpeed: 40,
    isCrisisMode: false,
    manualInjects: [],
  })
}

export async function getDynamicTickerConfig() {
  return cmsFetch<DynamicTickerConfig>('/api/globals/dynamic-ticker?depth=2', {
    displayDuration: 5000,
    transitionSpeed: 400,
    showVisualizer: true,
    items: [],
  })
}

export async function getCurrentWeekRandomTickerArticles(count = 5) {
  const { start, end } = startOfCurrentWeekUTC()
  const startIso = encodeURIComponent(start.toISOString())
  const endIso = encodeURIComponent(end.toISOString())

  const currentWeekPublishDatePath =
    `/api/articles?depth=2&limit=50&sort=-publishDate` +
    `&where[status][equals]=published` +
    `&where[publishDate][greater_than_equal]=${startIso}` +
    `&where[publishDate][less_than]=${endIso}`

  const currentWeekPublishedAtPath =
    `/api/articles?depth=2&limit=50&sort=-publishedAt` +
    `&where[status][equals]=published` +
    `&where[publishedAt][greater_than_equal]=${startIso}` +
    `&where[publishedAt][less_than]=${endIso}`

  const fallbackLatestPath = `/api/articles?depth=2&limit=50&sort=-createdAt&where[status][equals]=published`

  let response = await cmsFetch<PayloadListResponse<CmsArticle>>(currentWeekPublishDatePath, { docs: [] })

  if (!response.docs?.length) {
    response = await cmsFetch<PayloadListResponse<CmsArticle>>(currentWeekPublishedAtPath, { docs: [] })
  }

  if (!response.docs?.length) {
    response = await cmsFetch<PayloadListResponse<CmsArticle>>(fallbackLatestPath, { docs: [] })
  }

  return seededShuffle(response.docs ?? [])
    .map(articleToTickerItem)
    .filter(Boolean)
    .slice(0, count) as NewsTickerArticle[]
}