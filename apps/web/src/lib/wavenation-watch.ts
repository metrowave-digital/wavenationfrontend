import type {
  EventItem,
  LiveChannel,
  TVShow,
  VODItem,
  WatchAccessKind,
  WatchAccessState,
  WatchImage,
  WatchSponsor,
  WatchTalent,
} from '@wavenation/ui-web'

const CMS_URL = (
  process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || 'https://cms.wavenation.online'
).replace(/\/$/, '')

export type WatchVideoProvider =
  | 'mux'
  | 'hls'
  | 'strimm'
  | 'restream'
  | 'youtube'
  | 'vimeo'
  | 'embed'

export type WaveNationVODItem = VODItem & {
  provider?: WatchVideoProvider
  muxPlaybackId?: string
  muxAssetId?: string
  signedPlayback?: boolean
  embedUrl?: string
}

type RecordValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[]

type Obj = Record<string, RecordValue>

type PayloadList<T> = {
  docs?: T[]
  totalDocs?: number
}

function isObj(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asObj(value: unknown): Obj | undefined {
  return isObj(value) ? value : undefined
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function bool(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function idOf(value: unknown): string | number | undefined {
  if (typeof value === 'string' || typeof value === 'number') return value

  const obj = asObj(value)
  return obj ? idOf(obj.id) : undefined
}

function plainText(value: unknown): string | undefined {
  if (typeof value === 'string') return value

  const obj = asObj(value)
  const root = asObj(obj?.root)
  const children = arr(root?.children)
  const parts: string[] = []

  const walk = (nodes: unknown[]) => {
    for (const node of nodes) {
      const n = asObj(node)
      if (!n) continue

      if (typeof n.text === 'string') {
        parts.push(n.text)
      }

      walk(arr(n.children))
    }
  }

  walk(children)

  return parts.join(' ').replace(/\s+/g, ' ').trim() || undefined
}

function media(value: unknown): WatchImage | undefined {
  const obj = asObj(value)
  if (!obj) return undefined

  const url = text(obj.url) || text(obj.filename)
  if (!url) return undefined

  const finalUrl =
    url.startsWith('http') || url.startsWith('/')
      ? url
      : `${CMS_URL}${url.startsWith('/') ? '' : '/'}${url}`

  return {
    url: finalUrl,
    alt: text(obj.alt) || text(obj.title),
    width: num(obj.width),
    height: num(obj.height),
  }
}

function sponsors(value: unknown): WatchSponsor[] {
  return arr(value)
    .map(asObj)
    .filter(Boolean)
    .map((s) => ({
      id: String(idOf(s?.id) || ''),
      name: text(s?.name) || text(s?.title) || 'Sponsor',
      logoUrl: media(s?.logo || s?.image)?.url,
      href: text(s?.website) || text(s?.url),
      label: text(s?.label),
    }))
}

function talent(value: unknown): WatchTalent[] {
  return arr(value)
    .map(asObj)
    .filter(Boolean)
    .map((t) => ({
      id: idOf(t?.id),
      name:
        text(t?.fullName) ||
        [text(t?.firstName), text(t?.lastName)].filter(Boolean).join(' ') ||
        text(t?.name) ||
        'Talent',
      role: text(t?.role),
      slug: text(t?.slug),
      image: media(t?.avatar || t?.image),
      href: text(t?.slug) ? `/talent/${text(t?.slug)}` : undefined,
      bio: plainText(t?.bio) || text(t?.bio),
    }))
}

function publicUrl(path: string, params?: URLSearchParams) {
  const url = new URL(path.startsWith('http') ? path : `${CMS_URL}${path}`)

  if (params) {
    params.forEach((value, key) => url.searchParams.set(key, value))
  }

  return url.toString()
}

async function cmsList(path: string, params?: URLSearchParams): Promise<Obj[]> {
  const url = publicUrl(path, params)

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })

    if (!res.ok) {
      console.error(`[WaveNation CMS Error] ${res.status} ${res.statusText} ${url}`)
      return []
    }

    const data = (await res.json()) as PayloadList<Obj>
    return Array.isArray(data.docs) ? data.docs : []
  } catch (error) {
    console.error(`[WaveNation CMS Fetch Error] ${url}`, error)
    return []
  }
}

async function cmsFirst(
  path: string,
  params?: URLSearchParams,
): Promise<Obj | null> {
  const docs = await cmsList(path, params)
  return docs[0] || null
}

function getDefaultVideoProvider(): WatchVideoProvider {
  const provider = (
    process.env.NEXT_PUBLIC_WAVENATION_VIDEO_PROVIDER || 'mux'
  )
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')

  if (
    provider === 'mux' ||
    provider === 'hls' ||
    provider === 'strimm' ||
    provider === 'restream' ||
    provider === 'youtube' ||
    provider === 'vimeo' ||
    provider === 'embed'
  ) {
    return provider
  }

  return 'mux'
}

function normalizeVideoProvider(
  value: unknown,
  fallback: WatchVideoProvider = getDefaultVideoProvider(),
): WatchVideoProvider {
  const provider = text(value)?.toLowerCase().replace(/-/g, '_')

  if (
    provider === 'mux' ||
    provider === 'hls' ||
    provider === 'strimm' ||
    provider === 'restream' ||
    provider === 'youtube' ||
    provider === 'vimeo' ||
    provider === 'embed'
  ) {
    return provider
  }

  return fallback
}

function extractMuxPlaybackId(value: unknown) {
  const raw = text(value)
  if (!raw) return ''

  if (!raw.includes('mux.com')) {
    return raw
  }

  const streamMatch = raw.match(/stream\.mux\.com\/([^./?]+)\.m3u8/i)
  if (streamMatch?.[1]) return streamMatch[1]

  const playerMatch = raw.match(/player\.mux\.com\/([^/?#]+)/i)
  if (playerMatch?.[1]) return playerMatch[1]

  const imageMatch = raw.match(/image\.mux\.com\/([^/?#]+)/i)
  if (imageMatch?.[1]) return imageMatch[1]

  return ''
}

function getMuxPlaybackId(doc: Obj, streaming?: Obj) {
  const mux = asObj(doc.mux)

  return (
    extractMuxPlaybackId(streaming?.muxPlaybackId) ||
    extractMuxPlaybackId(streaming?.playbackId) ||
    extractMuxPlaybackId(doc.muxPlaybackId) ||
    extractMuxPlaybackId(doc.playbackId) ||
    extractMuxPlaybackId(mux?.playbackId) ||
    extractMuxPlaybackId(streaming?.hlsUrl)
  )
}

function getMuxAssetId(doc: Obj, streaming?: Obj) {
  const mux = asObj(doc.mux)

  return (
    text(streaming?.muxAssetId) ||
    text(streaming?.assetId) ||
    text(doc.muxAssetId) ||
    text(doc.assetId) ||
    text(mux?.assetId)
  )
}

function isSignedMuxPlayback(doc: Obj, streaming?: Obj) {
  const mux = asObj(doc.mux)

  const explicitSigned =
    bool(streaming?.signedPlayback) ?? bool(mux?.signedPlayback)

  if (typeof explicitSigned === 'boolean') {
    return explicitSigned
  }

  const visibility = normalizeAccessKind(text(doc.visibility))

  return visibility === 'premium' || visibility === 'ppv' || visibility === 'private'
}

function normalizeAccessKind(kind?: string): WatchAccessKind {
  const normalized = (kind || 'free').trim().toLowerCase().replace(/-/g, '_')

  if (
    normalized === 'premium' ||
    normalized === 'wavenation_plus' ||
    normalized === 'plus'
  ) {
    return 'premium'
  }

  if (
    normalized === 'ppv' ||
    normalized === 'ticketed' ||
    normalized === 'ticketed_stream'
  ) {
    return 'ppv'
  }

  if (normalized === 'private' || normalized === 'private_link') {
    return 'private'
  }

  if (normalized === 'unlisted') {
    return 'unlisted'
  }

  return 'free'
}

function access(kind?: string, priceDisplay?: string): WatchAccessState {
  const normalized = normalizeAccessKind(kind)

  if (normalized === 'premium') {
    return {
      kind: 'premium',
      isLocked: true,
      label: 'WaveNation+',
      message: 'This video is part of the premium WaveNation+ experience.',
      primaryHref: '/watch/plus',
      primaryLabel: 'Explore WaveNation+',
      secondaryHref: '/api/auth/login',
      secondaryLabel: 'Sign in',
    }
  }

  if (normalized === 'ppv') {
    return {
      kind: 'ppv',
      isLocked: true,
      label: 'Pay Per View',
      message: 'This event or video requires a ticket or pay-per-view unlock.',
      priceDisplay,
      primaryHref: '/subscribe',
      primaryLabel: priceDisplay ? `Unlock ${priceDisplay}` : 'Unlock Access',
      secondaryHref: '/api/auth/login',
      secondaryLabel: 'Sign in',
    }
  }

  if (normalized === 'private') {
    return {
      kind: 'private',
      isLocked: true,
      label: 'Private Stream',
      message:
        'This stream is private. Sign in with an authorized account or use the private access link.',
      primaryHref: '/api/auth/login',
      primaryLabel: 'Sign in',
    }
  }

  return {
    kind: normalized === 'unlisted' ? 'unlisted' : 'free',
    isLocked: false,
    label: normalized === 'unlisted' ? 'Unlisted' : 'Free',
  }
}

function vodHref(item: WaveNationVODItem) {
  if (item.vodType === 'episode' && item.show?.slug) {
    return `/watch/shows/${item.show.slug}/episodes/${item.slug}`
  }

  return `/watch/vod/${item.slug}`
}

function mapVOD(doc: Obj): WaveNationVODItem | null {
  const slug = text(doc.slug)
  const title = text(doc.title)

  if (!slug || !title) return null

  const streaming = asObj(doc.streaming)
  const fallbackMp4 = media(doc.fallbackMp4)
  const poster = media(doc.poster)
  const tvShowContext = asObj(doc.tvShowContext)
  const showObj = asObj(tvShowContext?.series)
  const sponsorArr = sponsors(doc.sponsor ? [doc.sponsor] : [])
  const adsObj = asObj(doc.ads)

  const muxPlaybackId = getMuxPlaybackId(doc, streaming)
  const muxAssetId = getMuxAssetId(doc, streaming)

  const provider = muxPlaybackId
    ? 'mux'
    : normalizeVideoProvider(
        streaming?.provider || doc.videoProvider || doc.provider,
        getDefaultVideoProvider(),
      )

  const item: WaveNationVODItem = {
    id: idOf(doc.id) || slug,
    title,
    slug,
    description: text(doc.description),
    vodType: text(doc.vodType),
    source: text(doc.source),
    status: text(doc.status) || text(doc._status),
    visibility: (text(doc.visibility) || 'free') as WatchAccessKind,
    releaseDate: text(doc.releaseDate),
    publishDate: text(doc.publishDate),

    provider,
    muxPlaybackId: muxPlaybackId || undefined,
    muxAssetId,
    signedPlayback: isSignedMuxPlayback(doc, streaming),
    embedUrl: text(streaming?.embedUrl) || text(doc.embedUrl),

    runtimeSeconds: num(streaming?.runtimeSeconds),
    hlsUrl: text(streaming?.hlsUrl),
    providerAssetId:
      text(streaming?.providerAssetId) ||
      muxAssetId ||
      muxPlaybackId ||
      undefined,
    fallbackMp4Url: fallbackMp4?.url,
    poster,

    captions: arr(doc.captions)
      .map(asObj)
      .filter(Boolean)
      .map((cap) => ({
        language: text(cap?.language),
        vttUrl: media(cap?.vttFile)?.url,
      })),

    chapters: arr(doc.chapters)
      .map(asObj)
      .filter(Boolean)
      .map((chapter) => ({
        title: text(chapter?.title),
        timestampSeconds: num(chapter?.timestampSeconds),
      })),

    sponsor: sponsorArr[0],

    ads: adsObj
      ? {
          adsEnabled: bool(adsObj.adsEnabled),
          disableForPremium: bool(adsObj.disableForPremium),
          preRoll: text(adsObj.preRoll),
          midRoll: text(adsObj.midRoll),
          midRollOffset: num(adsObj.midRollOffset),
          postRoll: text(adsObj.postRoll),
        }
      : undefined,

    show: showObj
      ? {
          id: idOf(showObj.id) || '',
          title: text(showObj.title) || 'TV Show',
          slug: text(showObj.slug) || '',
        }
      : undefined,

    season: num(tvShowContext?.season),
    episodeNumber: num(tvShowContext?.episodeNumber),
    isFeatured: bool(doc.isFeatured),
    access: access(text(doc.visibility), text(asObj(doc.pricing)?.price)),
    href: `/watch/vod/${slug}`,
  }

  item.href = vodHref(item)

  return item
}

function mapShow(doc: Obj): TVShow | null {
  const slug = text(doc.slug)
  const title = text(doc.title)

  if (!slug || !title) return null

  return {
    id: idOf(doc.id) || slug,
    title,
    slug,
    description: text(doc.description),
    format: text(doc.format),
    network: text(doc.network),
    showStatus: text(doc.showStatus),
    posterArt: media(doc.posterArt),
    heroBanner: media(doc.heroBanner),
    trailerUrl: media(doc.trailer)?.url || text(doc.trailer),
    sponsors: sponsors(doc.sponsors),

    seasons: arr(doc.seasons)
      .map(asObj)
      .filter(Boolean)
      .map((season) => ({
        id: idOf(season?.id),
        title: text(season?.title),
        seasonNumber: num(season?.seasonNumber),
        slug: text(season?.slug),
      })),

    ageRating: text(doc.ageRating),
    talent: talent(doc.talent),

    genres: arr(doc.genres)
      .map(asObj)
      .filter(Boolean)
      .map((g) => ({
        id: idOf(g?.id),
        name: text(g?.name),
        slug: text(g?.slug),
      })),

    href: `/watch/shows/${slug}`,
  }
}

function mapTicketLink(value: unknown): { label: string; href: string } | null {
  const obj = asObj(value)
  if (!obj) return null

  const href = text(obj.url) || text(obj.href) || text(obj.ticketUrl)
  if (!href) return null

  return {
    label: text(obj.label) || text(obj.title) || 'Tickets',
    href,
  }
}

function mapEvent(doc: Obj): EventItem | null {
  const slug = text(doc.slug)
  const title = text(doc.title)

  if (!slug || !title) return null

  const venue = asObj(doc.venue)

  const location =
    text(doc.locationOverride) ||
    text(venue?.name) ||
    text(venue?.title) ||
    text(venue?.address)

  const virtualAccessType = text(doc.virtualAccessType) || 'none'

  const event: EventItem = {
    id: idOf(doc.id) || slug,
    title,
    slug,
    subtitle: text(doc.subtitle),
    summary: text(doc.summary),
    descriptionText: plainText(doc.description),
    eventStatus: text(doc.eventStatus),
    eventType: text(doc.eventType),

    categories: arr(doc.eventCategories)
      .map(asObj)
      .filter(Boolean)
      .map((c) => ({
        id: idOf(c?.id),
        name: text(c?.name) || text(c?.title),
        slug: text(c?.slug),
      })),

    featured: bool(doc.featured),
    isActive: bool(doc.isActive),
    startDate: text(doc.startDate),
    endDate: text(doc.endDate),
    timezone: text(doc.timezone),
    doorsOpenAt: text(doc.doorsOpenAt),

    schedule: arr(doc.schedule)
      .map(asObj)
      .filter(Boolean)
      .map((s) => ({
        id: idOf(s?.id),
        title: text(s?.title) || 'Schedule Item',
        startTime: text(s?.startTime),
        endTime: text(s?.endTime),
        location: text(s?.location),
        description: text(s?.description),
      })),

    location,
    virtualAccessType,
    livestreamProvider: text(doc.livestreamProvider),
    livestreamUrl: text(doc.livestreamUrl),
    replayUrl: text(doc.replayUrl),
    entryDetails: text(doc.entryDetails),
    parkingInfo: text(doc.parkingInfo),
    accessibilityInfo: text(doc.accessibilityInfo),
    primaryCTA: text(doc.primaryCTA),
    registrationRequired: bool(doc.registrationRequired),
    priceDisplay: text(doc.priceDisplay),

    ticketLinks: arr(doc.ticketLinks).map(mapTicketLink).filter(Boolean) as Array<{
      label: string
      href: string
    }>,

    lineup: arr(doc.lineup)
      .map(asObj)
      .filter(Boolean)
      .map((m) => ({
        id: idOf(m?.id),
        name: text(m?.name) || 'Lineup Member',
        role: text(m?.role),
        image: media(m?.image),
        performanceTime: text(m?.performanceTime),
        bio: text(m?.bio),
        externalUrl: text(m?.externalUrl),
      })),

    sponsors: sponsors(doc.sponsors),
    heroImage: media(doc.heroImage),
    posterImage: media(doc.posterImage),
    socialCard: media(doc.socialCard),
    gallery: arr(doc.gallery).map(media).filter(Boolean) as WatchImage[],
    promoVideoUrl: text(doc.promoVideoUrl),

    access: access(
      virtualAccessType === 'none' ? 'free' : virtualAccessType,
      text(doc.priceDisplay),
    ),

    href: `/events/${slug}`,
    watchHref: `/watch/events/${slug}`,
  }

  return event
}

export function getLiveChannels(): LiveChannel[] {
  const defaults = [
    {
      id: 'wavenation-one',
      title: 'WaveNation One',
      slug: 'one',
      description:
        'Main 24/7 culture, music, interviews, and original video channel.',
      isPrimary: true,
    },
    {
      id: 'wavenation-plus-live',
      title: 'WaveNation+ Live',
      slug: 'plus-live',
      description: 'Premium specials, premieres, and exclusive event windows.',
    },
    {
      id: 'creator-hub-live',
      title: 'Creator Hub Live',
      slug: 'creator-hub-live',
      description: 'Creator showcases, workshops, and partner live blocks.',
    },
  ]

  return defaults.map((item, index) => {
    const i = index + 1

    const provider = (
      process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_PROVIDER`] ||
      'strimm'
    ) as LiveChannel['provider']

    const posterUrl =
      process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_POSTER`]

    return {
      ...item,
      title:
        process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_NAME`] ||
        item.title,
      description:
        process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_DESCRIPTION`] ||
        item.description,
      provider,
      embedUrl:
        process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_EMBED_URL`],
      hlsUrl: process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_HLS_URL`],
      poster: posterUrl ? { url: posterUrl } : undefined,
      adsEnabled:
        process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_ADS_ENABLED`] ===
        'true',
      vastTagUrl:
        process.env[`NEXT_PUBLIC_WAVENATION_WATCH_CHANNEL_${i}_VAST_TAG_URL`],
    }
  })
}

export async function getVODItems(
  options: {
    vodType?: string
    source?: string
    visibility?: string
    featured?: boolean
    limit?: number
  } = {},
): Promise<WaveNationVODItem[]> {
  const params = new URLSearchParams({
    depth: '4',
    limit: String(options.limit || 48),
    sort: '-publishDate',
  })

  params.set('where[status][equals]', 'published')

  const docs = await cmsList('/api/vod', params)

  return docs
    .map(mapVOD)
    .filter(Boolean)
    .filter((item) => {
      if (!item) return false
      if (options.vodType && item.vodType !== options.vodType) return false
      if (options.source && item.source !== options.source) return false
      if (options.visibility && item.visibility !== options.visibility) {
        return false
      }
      if (options.featured && !item.isFeatured) return false

      return true
    }) as WaveNationVODItem[]
}

export async function getVODBySlug(slug: string) {
  const params = new URLSearchParams({
    depth: '4',
    limit: '1',
  })

  params.set('where[slug][equals]', slug)

  const doc = await cmsFirst('/api/vod', params)

  return doc ? mapVOD(doc) : null
}

export async function getTVShows(
  options: {
    limit?: number
    airingOnly?: boolean
  } = {},
) {
  const params = new URLSearchParams({
    depth: '4',
    limit: String(options.limit || 48),
    sort: 'title',
  })

  if (options.airingOnly) {
    params.set('where[showStatus][equals]', 'airing')
  }

  const docs = await cmsList('/api/tvShows', params)

  return docs.map(mapShow).filter(Boolean) as TVShow[]
}

export async function getTVShowBySlug(slug: string) {
  const params = new URLSearchParams({
    depth: '4',
    limit: '1',
  })

  params.set('where[slug][equals]', slug)

  const doc = await cmsFirst('/api/tvShows', params)

  return doc ? mapShow(doc) : null
}

export async function getEpisodesForShow(showId: string | number) {
  const episodes = await getVODItems({
    vodType: 'episode',
    limit: 100,
  })

  return episodes.filter((episode) => String(episode.show?.id) === String(showId))
}

export async function getEvents(
  options: {
    virtualOnly?: boolean
    includeCompleted?: boolean
    featuredOnly?: boolean
    limit?: number
  } = {},
) {
  const params = new URLSearchParams({
    depth: '4',
    limit: String(options.limit || 60),
    sort: 'startDate',
  })

  params.set('where[isActive][equals]', 'true')

  const docs = await cmsList('/api/events', params)

  return docs
    .map(mapEvent)
    .filter(Boolean)
    .filter((event) => {
      if (!event) return false

      const publicStatuses = options.includeCompleted
        ? ['published', 'open_registration', 'sold_out', 'completed']
        : ['published', 'open_registration', 'sold_out']

      if (!publicStatuses.includes(event.eventStatus || '')) return false

      if (
        options.virtualOnly &&
        !['virtual', 'hybrid', 'livestream'].includes(event.eventType || '') &&
        !event.livestreamUrl
      ) {
        return false
      }

      if (options.featuredOnly && !event.featured) return false

      return true
    }) as EventItem[]
}

export async function getEventBySlug(slug: string) {
  const params = new URLSearchParams({
    depth: '4',
    limit: '1',
  })

  params.set('where[slug][equals]', slug)

  const doc = await cmsFirst('/api/events', params)

  return doc ? mapEvent(doc) : null
}

export async function getWatchHomeData() {
  const [vod, shows, events] = await Promise.all([
    getVODItems({ limit: 24 }),
    getTVShows({ limit: 12 }),
    getEvents({
      virtualOnly: true,
      includeCompleted: false,
      limit: 12,
    }),
  ])

  const videoProvider = getDefaultVideoProvider()

  return {
    channels: getLiveChannels(),
    featuredVod: vod.filter((item) => item.isFeatured).slice(0, 8),
    latestVod: vod.slice(0, 12),
    shows: shows.slice(0, 12),
    events: events.slice(0, 8),
    videoProvider,
    muxEnabled: videoProvider === 'mux',

    // Kept as an empty legacy field so older components do not crash
    // while you finish removing Cloudflare references elsewhere.
    cloudflareAccountHash: '',
  }
}