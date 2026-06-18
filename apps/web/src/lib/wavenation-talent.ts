import type { TalentAssociatedItem, TalentProfileSummary } from '@wavenation/ui-web'

const CMS_URL = process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || 'https://cms.wavenation.online'
const DEFAULT_REVALIDATE_SECONDS = 300

type PayloadCollection<T> = {
  docs?: T[]
}

type MediaAsset = {
  id?: string | number
  alt?: string | null
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  sizes?: Record<string, { url?: string | null } | null>
}

type RawTalent = {
  id: string | number
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  shortBio?: string | null
  fullBio?: unknown
  mediaAssets?: {
    headshot?: MediaAsset | number | string | null
    heroBanner?: MediaAsset | number | string | null
    pressKit?: MediaAsset | number | string | null
  } | null
  associatedShows?: RawAssociatedItem[] | null
  associatedPodcasts?: RawAssociatedItem[] | null
  curatedPlaylists?: RawAssociatedItem[] | null
  socials?: Record<string, string | null | undefined> | null
  bookingInfo?: {
    managerName?: string | null
    bookingEmail?: string | null
    isPublic?: boolean | null
  } | null
  slug?: string | null
  status?: string | null
  role?: string | null
  isFeatured?: boolean | null
  updatedAt?: string | null
  createdAt?: string | null
}

type RawAssociatedItem =
  | number
  | string
  | {
      id?: string | number
      title?: string | null
      name?: string | null
      slug?: string | null
      showType?: string | null
      podcastFormat?: string | null
      coverArt?: MediaAsset | number | string | null
      logo?: MediaAsset | number | string | null
      posterArt?: MediaAsset | number | string | null
      heroBanner?: MediaAsset | number | string | null
    }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTalentProfileSummary(person: TalentProfileSummary | null): person is TalentProfileSummary {
  return person !== null
}

function isTalentAssociatedItem(item: TalentAssociatedItem | undefined): item is TalentAssociatedItem {
  return item !== undefined
}

function cleanText(value?: string | null): string | undefined {
  if (!value) return undefined

  return value
    .replace(/Â/g, '')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    .replace(/â€"/g, '—')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeUrl(value?: string | null) {
  if (!value) return undefined
  if (value.startsWith('http') || value.startsWith('/')) return value
  return `https://${value}`
}

function normalizeLabel(value?: string | null) {
  return cleanText(value)?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function lexicalToPlainText(value: unknown): string | undefined {
  if (!value || !isObject(value)) return undefined

  const root = value.root

  if (!isObject(root) || !Array.isArray(root.children)) return undefined

  const walk = (node: unknown): string => {
    if (!isObject(node)) return ''

    if (typeof node.text === 'string') {
      return node.text
    }

    if (Array.isArray(node.children)) {
      return node.children.map(walk).join(' ')
    }

    return ''
  }

  return cleanText(root.children.map(walk).join('\n\n'))
}

function getMediaUrl(
  media: MediaAsset | number | string | null | undefined,
  preferred: 'hero' | 'card' | 'square' | 'thumb' = 'card',
) {
  if (!media || typeof media === 'number') return undefined

  if (typeof media === 'string') {
    return media.startsWith('http') || media.startsWith('/') ? media : undefined
  }

  return (
    media.sizes?.[preferred]?.url ||
    media.sizes?.card?.url ||
    media.sizes?.square?.url ||
    media.sizes?.hero?.url ||
    media.sizes?.thumb?.url ||
    media.thumbnailURL ||
    media.url ||
    undefined
  )
}

function getMediaAlt(media: MediaAsset | number | string | null | undefined, fallback: string) {
  if (!media || typeof media !== 'object') return fallback
  return cleanText(media.alt || media.filename) || fallback
}

async function fetchFromCms<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const url = new URL(path, CMS_URL)

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`WaveNation CMS REST failed: ${response.status} ${response.statusText} for ${url.pathname}`)
  }

  return response.json() as Promise<T>
}

async function fetchCollection<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  const response = await fetchFromCms<PayloadCollection<T>>(path, params)
  return Array.isArray(response.docs) ? response.docs : []
}

function detectAssociatedType(item: Record<string, unknown>): TalentAssociatedItem['type'] {
  if (item.podcastFormat) return 'podcast'
  if (item.posterArt || item.heroBanner) return 'tv'
  if (item.showType) return 'radio'
  return 'show'
}

function associatedHref(item: Record<string, unknown>, type: TalentAssociatedItem['type']) {
  const slug = cleanText(typeof item.slug === 'string' ? item.slug : undefined)

  if (!slug) return undefined

  if (type === 'podcast') return `/shows/podcasts/${slug}`
  if (type === 'tv') return `/shows/tv/${slug}`
  if (type === 'radio') return `/shows/radio/${slug}`

  return undefined
}

function mapAssociatedItem(raw: RawAssociatedItem): TalentAssociatedItem | undefined {
  if (!isObject(raw)) return undefined

  const title =
    cleanText(typeof raw.title === 'string' ? raw.title : undefined) ||
    cleanText(typeof raw.name === 'string' ? raw.name : undefined)

  if (!title) return undefined

  const type = detectAssociatedType(raw)

  const logo = raw.logo as MediaAsset | number | string | null | undefined
  const coverArt = raw.coverArt as MediaAsset | number | string | null | undefined
  const posterArt = raw.posterArt as MediaAsset | number | string | null | undefined
  const heroBanner = raw.heroBanner as MediaAsset | number | string | null | undefined

  const image = logo || coverArt || posterArt || heroBanner

  return {
    id: raw.id as string | number | undefined,
    title,
    slug: cleanText(typeof raw.slug === 'string' ? raw.slug : undefined),
    href: associatedHref(raw, type),
    type,
    imageUrl: getMediaUrl(image, 'card'),
    imageAlt: getMediaAlt(image, title),
  }
}

function normalizeSocials(socials?: Record<string, string | null | undefined> | null) {
  return Object.fromEntries(
    Object.entries(socials || {})
      .filter(([, url]) => Boolean(url))
      .map(([platform, url]) => [platform, normalizeUrl(url || undefined)]),
  )
}

export function mapTalent(raw: RawTalent): TalentProfileSummary | null {
  const name = cleanText(raw.displayName) || cleanText(`${raw.firstName || ''} ${raw.lastName || ''}`.trim())
  const slug = cleanText(raw.slug)

  if (!name || !slug) return null

  const headshot = raw.mediaAssets?.headshot
  const heroBanner = raw.mediaAssets?.heroBanner

  return {
    id: raw.id,
    firstName: cleanText(raw.firstName),
    lastName: cleanText(raw.lastName),
    name,
    displayName: cleanText(raw.displayName),
    slug,
    href: `/talent/${slug}`,
    role: normalizeLabel(raw.role),
    status: normalizeLabel(raw.status),
    shortBio: cleanText(raw.shortBio),
    fullBio: lexicalToPlainText(raw.fullBio) || cleanText(raw.shortBio),
    imageUrl: getMediaUrl(headshot, 'square') || getMediaUrl(headshot, 'card'),
    imageAlt: getMediaAlt(headshot, `${name} headshot`),
    heroImageUrl: getMediaUrl(heroBanner, 'hero') || getMediaUrl(heroBanner, 'card'),
    heroImageAlt: getMediaAlt(heroBanner, `${name} hero banner`),
    socials: normalizeSocials(raw.socials),
    bookingInfo: raw.bookingInfo
      ? {
          managerName: cleanText(raw.bookingInfo.managerName),
          bookingEmail: cleanText(raw.bookingInfo.bookingEmail),
          isPublic: Boolean(raw.bookingInfo.isPublic),
        }
      : undefined,
    isFeatured: Boolean(raw.isFeatured),
    associatedShows: (raw.associatedShows || []).map(mapAssociatedItem).filter(isTalentAssociatedItem),
    associatedPodcasts: (raw.associatedPodcasts || []).map(mapAssociatedItem).filter(isTalentAssociatedItem),
    curatedPlaylists: (raw.curatedPlaylists || []).map(mapAssociatedItem).filter(isTalentAssociatedItem),
  }
}

function byFeaturedThenName(a: TalentProfileSummary, b: TalentProfileSummary) {
  if (a.isFeatured && !b.isFeatured) return -1
  if (!a.isFeatured && b.isFeatured) return 1
  return a.name.localeCompare(b.name)
}

export async function getTalent() {
  const docs = await fetchCollection<RawTalent>('/api/talent', {
    depth: 4,
    limit: 100,
    sort: 'displayName',
    'where[status][equals]': 'active',
  })

  return docs.map(mapTalent).filter(isTalentProfileSummary).sort(byFeaturedThenName)
}

export async function getFeaturedTalent(limit = 4) {
  const talent = await getTalent().catch(() => [])

  return talent
    .filter((person) => person.isFeatured)
    .concat(talent)
    .filter((person, index, array) => array.findIndex((candidate) => candidate.id === person.id) === index)
    .slice(0, limit)
}

export async function getTalentBySlug(slug: string) {
  const docs = await fetchCollection<RawTalent>('/api/talent', {
    depth: 4,
    limit: 1,
    'where[slug][equals]': slug,
    'where[status][equals]': 'active',
  })

  return docs[0] ? mapTalent(docs[0]) : null
}

export function getTalentRoleFilters(talent: TalentProfileSummary[], active?: string) {
  const roles = Array.from(new Set(talent.map((person) => person.role).filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b),
  )

  return [
    {
      label: 'All Talent',
      href: '/talent',
      isActive: !active,
    },
    ...roles.map((role) => ({
      label: role,
      href: `/talent?role=${encodeURIComponent(role.toLowerCase())}`,
      isActive: active === role.toLowerCase(),
    })),
  ]
}