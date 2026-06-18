import type {
  ShowDistribution,
  ShowPerson,
  ShowSchedule,
  ShowSeason,
  ShowSeasonEpisode,
  SponsorSummary,
  UnifiedShow,
} from '@wavenation/ui-web'

const CMS_URL = process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || 'https://cms.wavenation.online'
const DEFAULT_REVALIDATE_SECONDS = 300

type PayloadCollection<T> = {
  docs?: T[]
  totalDocs?: number
  totalPages?: number
  page?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

type MediaAsset = {
  id?: string | number
  alt?: string | null
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  sizes?: Record<
    string,
    | {
        url?: string | null
        width?: number | null
        height?: number | null
      }
    | null
  >
}

type RawSchedule = ShowSchedule & {
  label?: string | null
  days?: string[] | null
  startTime?: string | null
  endTime?: string | null
  timezone?: string | null
}

type TalentRelationship =
  | number
  | string
  | {
      id?: string | number
      firstName?: string | null
      lastName?: string | null
      displayName?: string | null
      slug?: string | null
      role?: string | null
      shortBio?: string | null
      mediaAssets?: {
        headshot?: MediaAsset | number | string | null
      } | null
    }

type SponsorRelationship =
  | number
  | string
  | {
      id?: string | number
      name?: string | null
      title?: string | null
      url?: string | null
      website?: string | null
      logo?: MediaAsset | number | string | null
      logoUrl?: string | null
      label?: string | null
    }

type RawRadioShow = {
  id: string | number
  title?: string | null
  showType?: string | null
  description?: string | null
  hosts?: TalentRelationship[] | null
  sponsors?: SponsorRelationship[] | null
  coverArt?: MediaAsset | number | string | null
  logo?: MediaAsset | number | string | null
  themeColor?: string | null
  standardSchedule?: RawSchedule | null
  genres?: string[] | null
  chart?: unknown
  slug?: string | null
  radioStatus?: string | null
  isFeatured?: boolean | null
  isPodcast?: boolean | null
  updatedAt?: string | null
  createdAt?: string | null
  _status?: string | null
}

type RawPodcast = {
  id: string | number
  title?: string | null
  description?: string | null
  podcastFormat?: string | null
  hosts?: TalentRelationship[] | null
  seasons?: RawSeason[] | null
  coverArt?: MediaAsset | number | string | null
  trailer?: {
    audioFile?: MediaAsset | string | null
    duration?: string | number | null
  } | null
  author?: string | null
  language?: string | null
  copyright?: string | null
  isExplicit?: boolean | null
  categories?: string[] | null
  distribution?: ShowDistribution | null
  ads?: {
    adsEnabled?: boolean | null
    disableForPremium?: boolean | null
    sponsorBrand?: string | null
  } | null
  slug?: string | null
  status?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  _status?: string | null
}

type TvTrailer =
  | MediaAsset
  | string
  | {
      url?: string | null
      videoUrl?: string | null
    }

type RawTvShow = {
  id: string | number
  title?: string | null
  description?: string | null
  format?: string | null
  network?: string | null
  sponsors?: SponsorRelationship[] | null
  posterArt?: MediaAsset | number | string | null
  heroBanner?: MediaAsset | number | string | null
  trailer?: TvTrailer | null
  seasons?: RawSeason[] | null
  ageRating?: string | null
  talent?: TalentRelationship[] | null
  genres?: string[] | null
  slug?: string | null
  showStatus?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  _status?: string | null
}

type RawSeason = {
  id?: string | number
  title?: string | null
  name?: string | null
  seasonNumber?: number | string | null
  number?: number | string | null
  description?: string | null
  episodes?: RawEpisode[] | null
}

type RawEpisode = {
  id?: string | number
  title?: string | null
  slug?: string | null
  description?: string | null
  duration?: string | number | null
  publishDate?: string | null
  publishedAt?: string | null
  episodeNumber?: number | string | null
  number?: number | string | null
  media?: MediaAsset | string | null
  audioFile?: MediaAsset | string | null
  videoFile?: MediaAsset | string | null
  audioUrl?: string | null
  videoUrl?: string | null
  image?: MediaAsset | null
  coverArt?: MediaAsset | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUnifiedShow(show: UnifiedShow | null): show is UnifiedShow {
  return show !== null
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

function truncate(value?: string, max = 190): string | undefined {
  if (!value) return undefined
  return value.length > max ? `${value.slice(0, max).trim()}...` : value
}

function normalizeLabel(value?: string | null) {
  return cleanText(value)?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getMediaUrl(
  media: MediaAsset | number | string | null | undefined,
  preferred: 'hero' | 'card' | 'square' | 'thumb' = 'card',
) {
  if (!media || typeof media === 'number') return undefined

  if (typeof media === 'string') {
    return media.startsWith('http') || media.startsWith('/') ? media : undefined
  }

  const preferredUrl = media.sizes?.[preferred]?.url
  const cardUrl = media.sizes?.card?.url
  const heroUrl = media.sizes?.hero?.url
  const squareUrl = media.sizes?.square?.url
  const thumbUrl = media.sizes?.thumb?.url

  return preferredUrl || cardUrl || heroUrl || squareUrl || thumbUrl || media.thumbnailURL || media.url || undefined
}

function getMediaAlt(media: MediaAsset | number | string | null | undefined, fallback: string) {
  if (!media || typeof media !== 'object') return fallback
  return cleanText(media.alt || media.filename) || fallback
}

function normalizeUrl(value?: string | null) {
  if (!value) return undefined
  if (value.startsWith('http') || value.startsWith('/')) return value
  return `https://${value}`
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

function formatTime(value?: string | null) {
  if (!value) return undefined

  const raw = value.replace(':', '').padStart(4, '0')
  const hours = Number(raw.slice(0, 2))
  const minutes = raw.slice(2, 4)

  if (Number.isNaN(hours)) return value

  const suffix = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12

  return minutes === '00' ? `${displayHour} ${suffix}` : `${displayHour}:${minutes} ${suffix}`
}

function timezoneLabel(value?: string | null) {
  if (!value) return undefined
  if (value === 'America/New_York') return 'ET'
  if (value === 'America/Chicago') return 'CT'
  if (value === 'America/Denver') return 'MT'
  if (value === 'America/Los_Angeles') return 'PT'
  return value.replace('America/', '').replace(/_/g, ' ')
}

function formatSchedule(schedule?: RawSchedule | null) {
  if (!schedule) return undefined
  if (schedule.label) return cleanText(schedule.label)

  const days = schedule.days?.length ? schedule.days.join(', ') : undefined
  const start = formatTime(schedule.startTime)
  const end = formatTime(schedule.endTime)
  const zone = timezoneLabel(schedule.timezone)
  const time = start && end ? `${start}-${end}` : start || end

  return [days, time, zone].filter(Boolean).join(' • ') || undefined
}

function mapTalentPerson(person: TalentRelationship): ShowPerson | undefined {
  if (!isObject(person)) return undefined

  const displayName = typeof person.displayName === 'string' ? person.displayName : undefined
  const firstName = typeof person.firstName === 'string' ? person.firstName : undefined
  const lastName = typeof person.lastName === 'string' ? person.lastName : undefined
  const slug = typeof person.slug === 'string' ? person.slug : undefined
  const role = typeof person.role === 'string' ? person.role : undefined

  const name = cleanText(displayName) || cleanText(`${firstName || ''} ${lastName || ''}`.trim())

  if (!name) return undefined

  const mediaAssets = isObject(person.mediaAssets) ? person.mediaAssets : undefined
  const headshot = mediaAssets?.headshot as MediaAsset | number | string | null | undefined

  return {
    id: person.id as string | number | undefined,
    name,
    slug: cleanText(slug),
    role: normalizeLabel(role),
    href: slug ? `/talent/${slug}` : undefined,
    imageUrl: getMediaUrl(headshot, 'square'),
    imageAlt: `${name} headshot`,
  }
}

function mapSponsors(sponsors?: SponsorRelationship[] | null): SponsorSummary[] {
  return (sponsors || [])
    .map((sponsor) => {
      if (!isObject(sponsor)) return undefined

      const name =
        cleanText(typeof sponsor.name === 'string' ? sponsor.name : undefined) ||
        cleanText(typeof sponsor.title === 'string' ? sponsor.title : undefined)

      if (!name) return undefined

      const url = typeof sponsor.url === 'string' ? sponsor.url : undefined
      const website = typeof sponsor.website === 'string' ? sponsor.website : undefined
      const logoUrl = typeof sponsor.logoUrl === 'string' ? sponsor.logoUrl : undefined
      const label = typeof sponsor.label === 'string' ? sponsor.label : undefined

      return {
        id: sponsor.id as string | number | undefined,
        name,
        url: normalizeUrl(url || website),
        logoUrl: getMediaUrl(sponsor.logo as MediaAsset | undefined) || cleanText(logoUrl),
        label: cleanText(label),
      }
    })
    .filter(Boolean) as SponsorSummary[]
}

function mapEpisode(raw: RawEpisode, index: number): ShowSeasonEpisode {
  const title = cleanText(raw.title) || `Episode ${raw.episodeNumber || raw.number || index + 1}`
  const mediaUrl = getMediaUrl(raw.media) || getMediaUrl(raw.audioFile) || getMediaUrl(raw.videoFile)

  return {
    id: raw.id,
    title,
    slug: cleanText(raw.slug),
    description: cleanText(raw.description),
    duration: raw.duration ? String(raw.duration) : undefined,
    publishDate: raw.publishDate || raw.publishedAt || undefined,
    episodeNumber: raw.episodeNumber || raw.number || index + 1,
    mediaUrl,
    audioUrl: cleanText(raw.audioUrl) || getMediaUrl(raw.audioFile),
    videoUrl: cleanText(raw.videoUrl) || getMediaUrl(raw.videoFile),
    imageUrl: getMediaUrl(raw.image || raw.coverArt || undefined, 'card'),
    imageAlt: getMediaAlt(raw.image || raw.coverArt || undefined, title),
  }
}

function mapSeasons(seasons?: RawSeason[] | null): ShowSeason[] {
  return (seasons || []).map((season, index) => ({
    id: season.id,
    title: cleanText(season.title || season.name) || `Season ${season.seasonNumber || season.number || index + 1}`,
    seasonNumber: season.seasonNumber || season.number || index + 1,
    description: cleanText(season.description),
    episodes: (season.episodes || []).map(mapEpisode),
  }))
}

function filterStrings(values?: string[] | null) {
  return (values || []).map((value) => normalizeLabel(value)).filter(Boolean) as string[]
}

function getTvTrailerUrl(trailer: RawTvShow['trailer']) {
  if (!trailer) return undefined

  if (typeof trailer === 'string') {
    return trailer
  }

  if (!isObject(trailer)) {
    return undefined
  }

  const trailerRecord = trailer as {
    url?: string | null
    videoUrl?: string | null
  }

  return cleanText(trailerRecord.videoUrl || trailerRecord.url) || getMediaUrl(trailer as MediaAsset)
}

export function mapRadioShow(raw: RawRadioShow): UnifiedShow | null {
  const title = cleanText(raw.title)
  const slug = cleanText(raw.slug)

  if (!title || !slug) return null

  const scheduleLabel = formatSchedule(raw.standardSchedule)

  return {
    id: raw.id,
    type: 'radio',
    title,
    slug,
    href: `/shows/radio/${slug}`,
    description: cleanText(raw.description),
    shortDescription: truncate(cleanText(raw.description)),
    statusLabel: normalizeLabel(raw.radioStatus),
    formatLabel: normalizeLabel(raw.showType),
    isFeatured: Boolean(raw.isFeatured),
    imageUrl: getMediaUrl(raw.logo || raw.coverArt, 'card'),
    imageAlt: getMediaAlt(raw.logo || raw.coverArt, title),
    heroImageUrl: getMediaUrl(raw.coverArt || raw.logo, 'hero'),
    heroImageAlt: getMediaAlt(raw.coverArt || raw.logo, title),
    schedule: raw.standardSchedule || undefined,
    scheduleLabel,
    hosts: (raw.hosts || []).map(mapTalentPerson).filter(Boolean) as ShowPerson[],
    sponsors: mapSponsors(raw.sponsors),
    genres: filterStrings(raw.genres),
    primaryActionLabel: 'Listen Live',
    primaryActionHref: '/listen',
    secondaryActionLabel: 'View Details',
    secondaryActionHref: `/shows/radio/${slug}`,
  }
}

export function mapPodcast(raw: RawPodcast): UnifiedShow | null {
  const title = cleanText(raw.title)
  const slug = cleanText(raw.slug)

  if (!title || !slug) return null

  return {
    id: raw.id,
    type: 'podcast',
    title,
    slug,
    href: `/shows/podcasts/${slug}`,
    description: cleanText(raw.description),
    shortDescription: truncate(cleanText(raw.description)),
    statusLabel: raw._status === 'published' ? 'Published' : normalizeLabel(raw.status),
    formatLabel: normalizeLabel(raw.podcastFormat),
    author: cleanText(raw.author),
    language: cleanText(raw.language),
    copyright: cleanText(raw.copyright),
    isExplicit: Boolean(raw.isExplicit),
    imageUrl: getMediaUrl(raw.coverArt, 'card'),
    imageAlt: getMediaAlt(raw.coverArt, title),
    heroImageUrl: getMediaUrl(raw.coverArt, 'hero') || getMediaUrl(raw.coverArt, 'card'),
    heroImageAlt: getMediaAlt(raw.coverArt, title),
    trailerUrl: getMediaUrl(raw.trailer?.audioFile),
    hosts: (raw.hosts || []).map(mapTalentPerson).filter(Boolean) as ShowPerson[],
    categories: filterStrings(raw.categories),
    seasons: mapSeasons(raw.seasons),
    distribution: raw.distribution || undefined,
    primaryActionLabel: 'Listen / View Episodes',
    primaryActionHref: `/shows/podcasts/${slug}#episodes`,
    secondaryActionLabel: 'View Details',
    secondaryActionHref: `/shows/podcasts/${slug}`,
  }
}

export function mapTvShow(raw: RawTvShow): UnifiedShow | null {
  const title = cleanText(raw.title)
  const slug = cleanText(raw.slug)

  if (!title || !slug) return null

  const trailerUrl = getTvTrailerUrl(raw.trailer)

  return {
    id: raw.id,
    type: 'tv',
    title,
    slug,
    href: `/shows/tv/${slug}`,
    description: cleanText(raw.description),
    shortDescription: truncate(cleanText(raw.description)),
    statusLabel: normalizeLabel(raw.showStatus),
    formatLabel: normalizeLabel(raw.format),
    network: normalizeLabel(raw.network),
    imageUrl: getMediaUrl(raw.posterArt || raw.heroBanner, 'card'),
    imageAlt: getMediaAlt(raw.posterArt || raw.heroBanner, title),
    heroImageUrl: getMediaUrl(raw.heroBanner || raw.posterArt, 'hero') || getMediaUrl(raw.posterArt, 'card'),
    heroImageAlt: getMediaAlt(raw.heroBanner || raw.posterArt, title),
    trailerUrl,
    talent: (raw.talent || []).map(mapTalentPerson).filter(Boolean) as ShowPerson[],
    sponsors: mapSponsors(raw.sponsors),
    genres: filterStrings(raw.genres),
    seasons: mapSeasons(raw.seasons),
    primaryActionLabel: trailerUrl ? 'Watch Trailer' : 'Watch Show',
    primaryActionHref: trailerUrl || `/shows/tv/${slug}#seasons`,
    secondaryActionLabel: 'View Details',
    secondaryActionHref: `/shows/tv/${slug}`,
  }
}

function byFeaturedThenTitle(a: UnifiedShow, b: UnifiedShow) {
  if (a.isFeatured && !b.isFeatured) return -1
  if (!a.isFeatured && b.isFeatured) return 1
  return a.title.localeCompare(b.title)
}

export async function getRadioShows() {
  const docs = await fetchCollection<RawRadioShow>('/api/radioShows', {
    depth: 3,
    limit: 100,
    sort: 'title',
    'where[radioStatus][equals]': 'active',
  })

  return docs.map(mapRadioShow).filter(isUnifiedShow).sort(byFeaturedThenTitle)
}

export async function getPodcasts() {
  const docs = await fetchCollection<RawPodcast>('/api/podcasts', {
    depth: 3,
    limit: 100,
    sort: 'title',
    'where[_status][equals]': 'published',
  })

  return docs.map(mapPodcast).filter(isUnifiedShow).sort(byFeaturedThenTitle)
}

export async function getTvShows() {
  const docs = await fetchCollection<RawTvShow>('/api/tvShows', {
    depth: 3,
    limit: 100,
    sort: 'title',
    'where[showStatus][equals]': 'airing',
  })

  return docs.map(mapTvShow).filter(isUnifiedShow).sort(byFeaturedThenTitle)
}

export async function getShowsHubData() {
  const [radioShows, podcasts, tvShows] = await Promise.all([
    getRadioShows().catch(() => []),
    getPodcasts().catch(() => []),
    getTvShows().catch(() => []),
  ])

  const allShows = [...radioShows, ...podcasts, ...tvShows]

  const featuredShows = allShows
    .filter((show) => show.isFeatured)
    .concat(allShows.slice(0, 3))
    .filter(
      (show, index, array) =>
        array.findIndex((candidate) => candidate.type === show.type && candidate.id === show.id) === index,
    )
    .slice(0, 6)

  return {
    featuredShows,
    radioShows,
    podcasts,
    tvShows,
  }
}

async function getOne<T>(path: string, params: Record<string, string | number | boolean | undefined | null>) {
  const docs = await fetchCollection<T>(path, {
    depth: 4,
    limit: 1,
    ...params,
  })

  return docs[0] || null
}

export async function getRadioShowBySlug(slug: string) {
  const doc = await getOne<RawRadioShow>('/api/radioShows', {
    'where[slug][equals]': slug,
    'where[radioStatus][equals]': 'active',
  })

  return doc ? mapRadioShow(doc) : null
}

export async function getPodcastBySlug(slug: string) {
  const doc = await getOne<RawPodcast>('/api/podcasts', {
    'where[slug][equals]': slug,
    'where[_status][equals]': 'published',
  })

  return doc ? mapPodcast(doc) : null
}

export async function getTvShowBySlug(slug: string) {
  const doc = await getOne<RawTvShow>('/api/tvShows', {
    'where[slug][equals]': slug,
    'where[showStatus][equals]': 'airing',
  })

  return doc ? mapTvShow(doc) : null
}

export async function getPodcastEpisodes(podcastId: string | number) {
  try {
    const docs = await fetchCollection<RawEpisode>('/api/podcast-episodes', {
      depth: 2,
      limit: 100,
      sort: '-publishDate',
      'where[podcast][equals]': podcastId,
      'where[_status][equals]': 'published',
    })

    return docs.map(mapEpisode)
  } catch {
    return []
  }
}

export function getFilterLinks(basePath: string, allLabel: string, values: string[], active?: string) {
  const uniqueValues = Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))

  return [
    {
      label: allLabel,
      href: basePath,
      isActive: !active,
    },
    ...uniqueValues.map((value) => ({
      label: value,
      href: `${basePath}?filter=${encodeURIComponent(value.toLowerCase())}`,
      isActive: active === value.toLowerCase(),
    })),
  ]
}

export function filterShows(shows: UnifiedShow[], activeFilter?: string) {
  if (!activeFilter) return shows

  return shows.filter((show) => {
    const values = [...(show.genres || []), ...(show.categories || []), show.formatLabel || '', show.statusLabel || '']

    return values.some((value) => value.toLowerCase() === activeFilter.toLowerCase())
  })
}