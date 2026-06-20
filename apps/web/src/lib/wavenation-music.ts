import type {
  ChartEntryMovement,
  ChartEntrySummary,
  ChartSummary,
  ChartType,
  MoodSummary,
  MusicImage,
  PlatformLink,
  PlaylistSummary,
  PlaylistTrackSummary,
  TaxonomyTerm,
  TrackSummary,
} from '@wavenation/ui-web'

const DEFAULT_CMS_URL = 'https://cms.wavenation.online'
const DEFAULT_LIMIT = 100

export const CHART_TYPE_OPTIONS = [
  { label: 'The Hitlist', value: 'hitlist' },
  { label: 'Gospel', value: 'gospel' },
  { label: 'Southern Soul', value: 'southern_soul' },
  { label: 'Hip-Hop', value: 'hip_hop' },
  { label: 'R&B/Soul', value: 'rb_soul' },
  { label: 'BPM', value: 'bpm' },
] as const

export const PLAYLIST_TYPE_OPTIONS = [
  { label: 'Core Editorial', value: 'core_editorial' },
  { label: 'Category / Genre', value: 'category' },
  { label: 'Mood-Based', value: 'mood' },
  { label: 'Seasonal', value: 'seasonal' },
  { label: 'Event / Festival', value: 'event' },
  { label: 'Creator-Curated', value: 'creator_curated' },
  { label: 'Sponsored', value: 'sponsored' },
  { label: 'Show Companion', value: 'show_companion' },
  { label: 'Archive / Catalog', value: 'archive' },
] as const

const UPDATE_CADENCE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  seasonal: 'Seasonal',
  as_needed: 'As Needed',
}

const RANKING_MODE_LABELS: Record<string, string> = {
  manual_editorial: 'Manual Editorial',
  votes_editorial: 'Votes + Editorial',
  streams_radio_editorial: 'Streams + Radio + Editorial',
  custom: 'Custom',
}

const PLATFORM_FIELDS = [
  ['spotify', 'Spotify'],
  ['appleMusic', 'Apple Music'],
  ['youtubeMusic', 'YouTube Music'],
  ['youtube', 'YouTube'],
  ['audiomack', 'Audiomack'],
  ['tidal', 'Tidal'],
  ['pandora', 'Pandora'],
  ['soundCloud', 'SoundCloud'],
  ['bandcamp', 'Bandcamp'],
  ['wavenationEmbedUrl', 'WaveNation'],
  ['officialWebsite', 'Official Website'],
] as const

type CMSRecord = Record<string, unknown>

type PayloadListResponse<T> = {
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

export type MusicListResult<T> = {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

function getCMSBaseUrl() {
  return (process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || DEFAULT_CMS_URL).replace(/\/$/, '')
}

function isRecord(value: unknown): value is CMSRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function asId(value: unknown): string | number | undefined {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function labelFromOptions(value: unknown, options: readonly { label: string; value: string }[]) {
  const stringValue = asString(value)
  return options.find((option) => option.value === stringValue)?.label || stringValue
}

function normalizeUrl(value: unknown) {
  const url = asString(value)

  if (!url) return undefined

  if (
    url.startsWith('/') ||
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:')
  ) {
    return url
  }

  if (/^https?:\/\//i.test(url)) return url

  return `https://${url}`
}

function mediaUrl(value: unknown): MusicImage | undefined {
  const record = isRecord(value) ? value : undefined
  const url = record ? asString(record.url) : asString(value)

  if (!url) return undefined

  return {
    id: record ? asId(record.id) : undefined,
    url,
    alt: record ? asString(record.alt) || asString(record.caption) : undefined,
    width: record ? asNumber(record.width) : undefined,
    height: record ? asNumber(record.height) : undefined,
  }
}

function mapTerm(value: unknown): TaxonomyTerm | undefined {
  if (!isRecord(value)) return undefined

  const name = asString(value.name) || asString(value.title)

  if (!name) return undefined

  return {
    id: asId(value.id),
    name,
    slug: asString(value.slug),
    description: asString(value.description),
    themeColor: asString(value.themeColor),
    icon: mediaUrl(value.icon),
  }
}

function mapTerms(value: unknown): TaxonomyTerm[] {
  return asArray(value)
    .map(mapTerm)
    .filter((term): term is TaxonomyTerm => Boolean(term))
}

function mapTagLabels(value: unknown) {
  return asArray(value)
    .map((tag) => (isRecord(tag) ? asString(tag.label) : asString(tag)))
    .filter((tag): tag is string => Boolean(tag))
}

function mapPlatformLinks(value: unknown): PlatformLink[] {
  if (!isRecord(value)) return []

  const links: PlatformLink[] = []

  for (const [key, label] of PLATFORM_FIELDS) {
    const url = normalizeUrl(value[key])

    if (url) {
      links.push({
        key,
        label,
        url,
      })
    }
  }

  return links
}

function mapTrack(value: unknown): TrackSummary | undefined {
  if (!isRecord(value)) return undefined

  const title = asString(value.title)

  if (!title) return undefined

  const featuredArtists = asArray(value.featuredArtists)
    .map((artist) => (isRecord(artist) ? asString(artist.name) : asString(artist)))
    .filter((artist): artist is string => Boolean(artist))

  return {
    id: asId(value.id),
    title,
    artistName: asString(value.artistName),
    featuredArtists,
    albumOrProject: asString(value.albumOrProject),
    releaseDate: asString(value.releaseDate),
    duration: asString(value.duration),
    explicit: asBoolean(value.explicit),
    artwork: mediaUrl(value.artwork),
    platformLinks: mapPlatformLinks(value.platformLinks),
  }
}

function mapPlaylistTrack(value: unknown, index: number): PlaylistTrackSummary | undefined {
  if (!isRecord(value)) return undefined

  const track = mapTrack(value.track)
  const title = track?.title || asString(value.customTitle)

  if (!title) return undefined

  return {
    id: asId(value.id) || track?.id,
    position: asNumber(value.position) || index + 1,
    title,
    artistName: track?.artistName || asString(value.customArtistName),
    albumOrProject: track?.albumOrProject,
    duration: track?.duration,
    artwork: track?.artwork,
    explicit: track?.explicit,
    editorialNote: asString(value.editorialNote),
    isNewThisWeek: asBoolean(value.isNewThisWeek),
    isFeaturedPlacement: asBoolean(value.isFeaturedPlacement),
    isIndieSpotlight: asBoolean(value.isIndieSpotlight),
    platformLinks: track?.platformLinks,
  }
}

function isPublishedDoc(record: CMSRecord) {
  const payloadStatus = asString(record._status)

  if (payloadStatus) return payloadStatus === 'published'

  const customStatus = asString(record.status)

  if (customStatus) {
    return customStatus === 'published' || customStatus === 'active'
  }

  return Boolean(asString(record.publishedAt))
}

function isPublishedChartDoc(record: CMSRecord) {
  const payloadStatus = asString(record._status)
  const editorialStatus = asString(record.editorialStatus)
  const publishedAt = asString(record.publishedAt)

  if (payloadStatus && payloadStatus !== 'published') return false

  return editorialStatus === 'published' || editorialStatus === 'approved' || Boolean(publishedAt)
}

function mapPlaylist(value: unknown): PlaylistSummary | undefined {
  if (!isRecord(value)) return undefined

  const title = asString(value.title)
  const slug = asString(value.slug)

  if (!title || !slug) return undefined

  const playlistType = asString(value.playlistType)
  const updateCadence = asString(value.updateCadence)
  const genres = mapTerms(value.genres)
  const moods = mapTerms(value.moods) as MoodSummary[]
  const customAccentColor = asString(value.customAccentColor)

  return {
    id: asId(value.id),
    title,
    slug,
    playlistType,
    playlistTypeLabel: labelFromOptions(playlistType, PLAYLIST_TYPE_OPTIONS),
    shortDescription: asString(value.shortDescription),
    description: asString(value.description),
    curatorName: asString(value.curatorName),
    curatorRole: asString(value.curatorRole),
    coverArt: mediaUrl(value.coverArt),
    heroImage: mediaUrl(value.heroImage),
    accentColor: customAccentColor ? 'custom' : asString(value.accentColor),
    customAccentColor,
    genres,
    moods,
    tags: mapTagLabels(value.tags),
    targetAudience: asString(value.targetAudience),
    tracks: asArray(value.tracks)
      .map(mapPlaylistTrack)
      .filter((track): track is PlaylistTrackSummary => Boolean(track))
      .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999)),
    primaryPlatform: asString(value.primaryPlatform),
    platformLinks: mapPlatformLinks(value.platformLinks),
    isSponsored: asBoolean(value.isSponsored),
    sponsorName: asString(value.sponsorName),
    sponsorLogo: mediaUrl(value.sponsorLogo),
    sponsorUrl: normalizeUrl(value.sponsorUrl),
    sponsorDisclosure: asString(value.sponsorDisclosure),
    publishedAt: asString(value.publishedAt),
    updateCadence,
    updateCadenceLabel: updateCadence
      ? UPDATE_CADENCE_LABELS[updateCadence] || updateCadence
      : undefined,
    isFeatured: asBoolean(value.isFeatured),
    seoTitle: asString(value.seoTitle),
    seoDescription: asString(value.seoDescription),
  }
}

function mapChartEntry(value: unknown, index: number): ChartEntrySummary | undefined {
  if (!isRecord(value)) return undefined

  const track = mapTrack(value.track)
  const title = track?.title || asString(value.fallbackTitle)

  if (!title) return undefined

  return {
    id: asId(value.id),
    entryLabel: asString(value.entryLabel),
    position: asNumber(value.position) || index + 1,
    lastWeekPosition: asNumber(value.lastWeekPosition),
    peakPosition: asNumber(value.peakPosition),
    weeksOnChart: asNumber(value.weeksOnChart),
    movementDirection: asString(value.movementDirection) as ChartEntryMovement | undefined,
    movementValue: asNumber(value.movementValue),
    title,
    artistName: track?.artistName || asString(value.fallbackArtistName),
    artwork: track?.artwork,
    track,
    platformLinks: track?.platformLinks,
    isNewEntry: asBoolean(value.isNewEntry),
    isReEntry: asBoolean(value.isReEntry),
    isIndieSpotlight: asBoolean(value.isIndieSpotlight),
    isPremiere: asBoolean(value.isPremiere),
    isStaffPick: asBoolean(value.isStaffPick),
    badgeLabel: asString(value.badgeLabel),
    publicNote: asString(value.publicNote),
  }
}

function mapChart(value: unknown): ChartSummary | undefined {
  if (!isRecord(value)) return undefined

  const title = asString(value.title)
  const slug = asString(value.slug)

  if (!title || !slug) return undefined

  const chartType = asString(value.chartType) as ChartType | undefined
  const rankingMode = asString(value.rankingMode)

  return {
    id: asId(value.id),
    title,
    slug,
    chartType,
    chartTypeLabel: labelFromOptions(chartType, CHART_TYPE_OPTIONS),
    publicDescription: asString(value.publicDescription),
    weekLabel: asString(value.weekLabel),
    weekStart: asString(value.weekStart),
    weekEnd: asString(value.weekEnd),
    chartSize: asNumber(value.chartSize),
    publishedAt: asString(value.publishedAt),
    isCurrent: asBoolean(value.isCurrent),
    entries: asArray(value.entries)
      .map(mapChartEntry)
      .filter((entry): entry is ChartEntrySummary => Boolean(entry))
      .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999)),
    coverArt: mediaUrl(value.coverArt),
    heroImage: mediaUrl(value.heroImage),
    socialCard: mediaUrl(value.socialCard),
    accentColor: asString(value.accentColor),
    rankingMode,
    rankingModeLabel: rankingMode ? RANKING_MODE_LABELS[rankingMode] || rankingMode : undefined,
    methodologyNote: asString(value.methodologyNote),
    editorialStatus: asString(value.editorialStatus),
    featuredOnHomepage: asBoolean(value.featuredOnHomepage),
    featuredOnMusicPage: asBoolean(value.featuredOnMusicPage),
    relatedArticleUrl: normalizeUrl(value.relatedArticleUrl),
    seoTitle: asString(value.seoTitle),
    seoDescription: asString(value.seoDescription),
  }
}

function mapMood(value: unknown): MoodSummary | undefined {
  const term = mapTerm(value)

  if (!term) return undefined

  return term
}

async function cmsGet<T>(pathname: string, params?: URLSearchParams): Promise<T | null> {
  const url = new URL(`${getCMSBaseUrl()}${pathname}`)

  if (params) {
    params.forEach((value, key) => url.searchParams.set(key, value))
  }

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[WaveNation CMS Error]', response.status, response.statusText, url.toString())
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    console.error('[WaveNation CMS Fetch Failed]', error)
    return null
  }
}

function toListResult<T>(
  response: PayloadListResponse<CMSRecord> | null,
  mapper: (doc: CMSRecord, index: number) => T | undefined,
): MusicListResult<T> {
  const docs = (response?.docs ?? [])
    .map((doc, index) => mapper(doc, index))
    .filter((doc): doc is T => Boolean(doc))

  return {
    docs,
    totalDocs: response?.totalDocs ?? docs.length,
    totalPages: response?.totalPages ?? 1,
    page: response?.page ?? 1,
    hasNextPage: Boolean(response?.hasNextPage),
    hasPrevPage: Boolean(response?.hasPrevPage),
  }
}

function publicParams(limit = DEFAULT_LIMIT) {
  const params = new URLSearchParams()

  params.set('depth', '4')
  params.set('limit', String(limit))
  params.set('where[_status][equals]', 'published')

  return params
}

function strictChartParams(limit = DEFAULT_LIMIT) {
  const params = new URLSearchParams()

  params.set('depth', '4')
  params.set('limit', String(limit))
  params.set('where[_status][equals]', 'published')
  params.set('where[editorialStatus][equals]', 'published')

  return params
}

function looseChartParams(limit = DEFAULT_LIMIT) {
  const params = new URLSearchParams()

  params.set('depth', '4')
  params.set('limit', String(limit))

  return params
}

function applyChartQueryOptions(
  params: URLSearchParams,
  options: {
    page?: number
    currentOnly?: boolean
    chartType?: string
    slug?: string
  } = {},
) {
  params.set('sort', '-weekStart')

  if (options.page) params.set('page', String(options.page))
  if (options.currentOnly) params.set('where[isCurrent][equals]', 'true')
  if (options.chartType) params.set('where[chartType][equals]', options.chartType)
  if (options.slug) params.set('where[slug][equals]', options.slug)

  return params
}

function mapPublishedCharts(response: PayloadListResponse<CMSRecord> | null) {
  return toListResult(response, (doc) => (isPublishedChartDoc(doc) ? mapChart(doc) : undefined))
}

export async function getActiveMoods(limit = DEFAULT_LIMIT): Promise<MoodSummary[]> {
  const params = new URLSearchParams()

  params.set('depth', '2')
  params.set('limit', String(limit))
  params.set('sort', 'name')
  params.set('where[status][equals]', 'active')

  const response = await cmsGet<PayloadListResponse<CMSRecord>>('/api/moods', params)

  return toListResult(response, mapMood).docs
}

export async function getPlaylists(
  options: { page?: number; limit?: number } = {},
): Promise<MusicListResult<PlaylistSummary>> {
  const params = publicParams(options.limit ?? DEFAULT_LIMIT)

  params.set('sort', '-publishedAt')

  if (options.page) params.set('page', String(options.page))

  const response = await cmsGet<PayloadListResponse<CMSRecord>>('/api/playlists', params)

  return toListResult(response, (doc) => (isPublishedDoc(doc) ? mapPlaylist(doc) : undefined))
}

export async function getFeaturedPlaylists(limit = 6): Promise<PlaylistSummary[]> {
  const params = publicParams(limit)

  params.set('sort', '-publishedAt')
  params.set('where[isFeatured][equals]', 'true')

  const response = await cmsGet<PayloadListResponse<CMSRecord>>('/api/playlists', params)

  const featured = toListResult(response, (doc) =>
    isPublishedDoc(doc) ? mapPlaylist(doc) : undefined,
  ).docs

  if (featured.length > 0) return featured

  return (await getPlaylists({ limit })).docs
}

export async function getPlaylistBySlug(slug: string): Promise<PlaylistSummary | null> {
  const params = publicParams(1)

  params.set('where[slug][equals]', slug)

  const response = await cmsGet<PayloadListResponse<CMSRecord>>('/api/playlists', params)
  const doc = response?.docs?.[0]

  if (!doc || !isPublishedDoc(doc)) return null

  return mapPlaylist(doc) ?? null
}

export async function getCharts(
  options: {
    page?: number
    limit?: number
    currentOnly?: boolean
    chartType?: string
  } = {},
): Promise<MusicListResult<ChartSummary>> {
  const limit = options.limit ?? DEFAULT_LIMIT

  const strictParams = applyChartQueryOptions(strictChartParams(limit), options)
  const strictResponse = await cmsGet<PayloadListResponse<CMSRecord>>('/api/charts', strictParams)
  const strictResult = mapPublishedCharts(strictResponse)

  if (strictResult.docs.length > 0) {
    return strictResult
  }

  const looseParams = applyChartQueryOptions(looseChartParams(limit), options)
  const looseResponse = await cmsGet<PayloadListResponse<CMSRecord>>('/api/charts', looseParams)
  const looseResult = mapPublishedCharts(looseResponse)

  return looseResult
}

export async function getCurrentCharts(limit = 6): Promise<ChartSummary[]> {
  const current = (await getCharts({ limit, currentOnly: true })).docs

  if (current.length > 0) return current

  return (await getCharts({ limit })).docs
}

export async function getChartBySlug(slug: string): Promise<ChartSummary | null> {
  const strictParams = applyChartQueryOptions(strictChartParams(1), { slug })
  const strictResponse = await cmsGet<PayloadListResponse<CMSRecord>>('/api/charts', strictParams)

  let doc = strictResponse?.docs?.[0]

  if (!doc) {
    const looseParams = applyChartQueryOptions(looseChartParams(1), { slug })
    const looseResponse = await cmsGet<PayloadListResponse<CMSRecord>>('/api/charts', looseParams)
    doc = looseResponse?.docs?.[0]
  }

  if (!doc || !isPublishedChartDoc(doc)) return null

  const chart = mapChart(doc)

  if (!chart) return null

  if ((chart.entries?.length ?? 0) === 0 && chart.id !== undefined) {
    chart.entries = await getChartEntriesForChart(chart.id)
  }

  return chart
}

export async function getChartEntriesForChart(chartId: string | number): Promise<ChartEntrySummary[]> {
  const params = new URLSearchParams()

  params.set('depth', '4')
  params.set('limit', '100')
  params.set('sort', 'position')
  params.set('where[chart][equals]', String(chartId))

  const response = await cmsGet<PayloadListResponse<CMSRecord>>('/api/chart-entries', params)

  return toListResult(response, mapChartEntry).docs.sort(
    (a, b) => (a.position ?? 9999) - (b.position ?? 9999),
  )
}

export async function getChartArchive(
  options: {
    query?: string
    chartType?: string
    page?: number
    limit?: number
  } = {},
): Promise<MusicListResult<ChartSummary>> {
  const response = await getCharts({ limit: 500 })
  const query = options.query?.trim().toLowerCase()
  const type = options.chartType?.trim()
  const page = options.page && options.page > 0 ? options.page : 1
  const pageSize = options.limit ?? 24

  const filtered = response.docs.filter((chart) => {
    const matchesType = !type || type === 'all' || chart.chartType === type

    const haystack = [chart.title, chart.weekLabel, chart.publicDescription, chart.chartTypeLabel]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesQuery = !query || haystack.includes(query)

    return matchesType && matchesQuery
  })

  const start = (page - 1) * pageSize
  const paginatedDocs = filtered.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return {
    docs: paginatedDocs,
    totalDocs: filtered.length,
    totalPages,
    page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export async function getDiscoverData() {
  const [featuredPlaylists, currentCharts, moods] = await Promise.all([
    getFeaturedPlaylists(6),
    getCurrentCharts(6),
    getActiveMoods(24),
  ])

  return {
    featuredPlaylists,
    currentCharts,
    moods,
  }
}

export function filterPlaylists(
  playlists: PlaylistSummary[],
  filters: {
    playlistType?: string
    moodSlug?: string
    genreSlug?: string
  },
) {
  return playlists.filter((playlist) => {
    const matchesType =
      !filters.playlistType ||
      filters.playlistType === 'all' ||
      playlist.playlistType === filters.playlistType

    const matchesMood =
      !filters.moodSlug || playlist.moods?.some((mood) => mood.slug === filters.moodSlug)

    const matchesGenre =
      !filters.genreSlug || playlist.genres?.some((genre) => genre.slug === filters.genreSlug)

    return matchesType && matchesMood && matchesGenre
  })
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): MusicListResult<T> {
  const safePage = page > 0 ? page : 1
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const start = (safePage - 1) * pageSize

  return {
    docs: items.slice(start, start + pageSize),
    totalDocs: items.length,
    totalPages,
    page: safePage,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  }
}

export function buildPaginationHref(
  basePath: string,
  currentParams: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams()

  Object.entries(currentParams).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  params.set('page', String(page))

  return `${basePath}?${params.toString()}`
}