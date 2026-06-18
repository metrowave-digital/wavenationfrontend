export type ScheduleMedium = 'radio' | 'tv'
export type DisplayTimeZone = 'ET' | 'CT'

export type CmsMedia = {
  url?: string | null
  alt?: string | null
  sizes?: Record<string, { url?: string | null } | null> | null
}

export type CmsHost = {
  id?: string | number
  displayName?: string | null
  firstName?: string | null
  lastName?: string | null
  slug?: string | null
}

export type CmsGenre =
  | string
  | {
      id?: string | number
      name?: string | null
      label?: string | null
      title?: string | null
      slug?: string | null
    }

export type CmsScheduleShow = {
  id?: string | number
  title?: string | null
  shortDescription?: string | null
  description?: string | null
  slug?: string | null
  format?: string | null
  showType?: string | null
  coverArt?: CmsMedia | null
  logo?: CmsMedia | null
  image?: CmsMedia | null
  posterArt?: CmsMedia | null
  heroBanner?: CmsMedia | null
  hosts?: CmsHost[] | null
  talent?: CmsHost[] | null
  genres?: CmsGenre[] | null
}

export type RawScheduleDoc = {
  id?: string | number
  label?: string | null
  radioShow?: CmsScheduleShow | null
  tvShow?: CmsScheduleShow | null
  vodEpisode?: CmsScheduleShow | null
  programmingType?: string | null
  liveStream?: {
    streamUrl?: string | null
    hlsUrl?: string | null
  } | null
  scheduleType?: 'recurring' | 'absolute' | string | null
  timezone?: string | null
  recurringRules?: {
    daysOfWeek?: string[] | null
    startTime?: string | null
    endTime?: string | null
    effectiveStartDate?: string | null
    effectiveEndDate?: string | null
  } | null
  absoluteTime?: {
    startDateTime?: string | null
    endDateTime?: string | null
  } | null
  conflictPriority?: number | null
  status?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type NormalizedScheduleItem = {
  id: string
  medium: ScheduleMedium
  label: string
  title: string
  description?: string
  slug?: string
  imageUrl?: string
  imageAlt?: string
  hosts: string[]
  genres: string[]
  format?: string
  programmingType?: string
  streamUrl?: string
  scheduleType: 'recurring' | 'absolute'
  sourceTimeZone: string
  daysOfWeek: string[]
  startTime?: string
  endTime?: string
  effectiveStartDate?: string
  effectiveEndDate?: string
  absoluteStart?: string
  absoluteEnd?: string
  status: string
  conflictPriority: number
}

export type ScheduleOccurrence = NormalizedScheduleItem & {
  occurrenceId: string
  start: string
  end: string
  startTimestamp: number
  endTimestamp: number
  isLive: boolean
  isUpcoming: boolean
  dateKey: string
  dayLabel: string
  displayStart: string
  displayEnd: string
  displayDate: string
  displayTimeRange: string
  displayZone: DisplayTimeZone
  ctaHref: string
  ctaLabel: string
}

export type ScheduleWindow = {
  displayZone: DisplayTimeZone
  generatedAt: string
  liveNow: ScheduleOccurrence[]
  upcomingRadio48: ScheduleOccurrence[]
  recentlyPlayedRadioToday: ScheduleOccurrence[]
  allOccurrences: ScheduleOccurrence[]
}

type PayloadResponse<T> = {
  docs?: T[]
  totalDocs?: number
  hasNextPage?: boolean
  nextPage?: number | null
  page?: number
}

const CMS_URL = process.env.NEXT_PUBLIC_WAVENATION_CMS_URL || 'https://cms.wavenation.online'
const RADIO_SCHEDULE_ENDPOINT = process.env.NEXT_PUBLIC_WAVENATION_RADIO_SCHEDULE_ENDPOINT || '/api/radioSchedule'
const TV_SCHEDULE_ENDPOINT = process.env.NEXT_PUBLIC_WAVENATION_TV_SCHEDULE_ENDPOINT || '/api/tvSchedule'
const DEFAULT_SOURCE_TIME_ZONE = 'America/New_York'
const ONE_DAY_MS = 86_400_000
const TWO_DAYS_MS = ONE_DAY_MS * 2

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function normalizeDisplayTimeZone(value?: string | string[] | null): DisplayTimeZone {
  const raw = Array.isArray(value) ? value[0] : value
  return raw?.toUpperCase() === 'CT' ? 'CT' : 'ET'
}

export function displayZoneToIana(zone: DisplayTimeZone) {
  return zone === 'CT' ? 'America/Chicago' : 'America/New_York'
}

function buildCmsUrl(endpoint: string, params?: URLSearchParams) {
  const cleanBase = CMS_URL.replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${cleanBase}${cleanEndpoint}`)

  if (params) {
    params.forEach((value, key) => url.searchParams.set(key, value))
  }

  return url
}

async function fetchScheduleDocs(endpoint: string): Promise<RawScheduleDoc[]> {
  const params = new URLSearchParams()
  params.set('depth', '4')
  params.set('limit', '100')
  params.set('where[status][equals]', 'active')

  const allDocs: RawScheduleDoc[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    params.set('page', String(page))
    const url = buildCmsUrl(endpoint, params)

    const response = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`WaveNation schedule API failed for ${endpoint}: ${response.status} ${response.statusText}`)
    }

    const json = (await response.json()) as PayloadResponse<RawScheduleDoc> | RawScheduleDoc[]
    const docs = Array.isArray(json) ? json : json.docs ?? []
    allDocs.push(...docs)

    if (Array.isArray(json)) {
      hasNextPage = false
    } else {
      hasNextPage = Boolean(json.hasNextPage && json.nextPage)
      page = Number(json.nextPage ?? page + 1)
    }
  }

  return allDocs
}

export async function getRadioScheduleDocs() {
  return fetchScheduleDocs(RADIO_SCHEDULE_ENDPOINT)
}

export async function getTvScheduleDocs() {
  return fetchScheduleDocs(TV_SCHEDULE_ENDPOINT)
}

export async function getNormalizedScheduleItems(): Promise<NormalizedScheduleItem[]> {
  const [radioDocs, tvDocs] = await Promise.all([getRadioScheduleDocs(), getTvScheduleDocs()])

  return [
    ...radioDocs.map((doc) => normalizeScheduleDoc(doc, 'radio')),
    ...tvDocs.map((doc) => normalizeScheduleDoc(doc, 'tv')),
  ].filter(isNormalizedScheduleItem)
}

function isNormalizedScheduleItem(item: NormalizedScheduleItem | null): item is NormalizedScheduleItem {
  return item !== null
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeScheduleDoc(doc: RawScheduleDoc, medium: ScheduleMedium): NormalizedScheduleItem | null {
  if (!doc || doc.status !== 'active') return null

  const show = medium === 'radio' ? doc.radioShow : doc.tvShow
  const id = String(doc.id ?? `${medium}-${doc.label ?? 'schedule'}`)
  const title = String(show?.title ?? doc.label ?? (medium === 'radio' ? 'WaveNation Radio' : 'WaveNation TV'))
  const media = pickMedia(show, medium)
  const scheduleType = doc.scheduleType === 'absolute' ? 'absolute' : 'recurring'
  const streamUrl = medium === 'radio' ? doc.liveStream?.streamUrl : doc.liveStream?.hlsUrl

  return {
    id,
    medium,
    label: String(doc.label ?? title),
    title,
    description: show?.shortDescription ?? show?.description ?? undefined,
    slug: show?.slug ?? undefined,
    imageUrl: media?.url ?? undefined,
    imageAlt: media?.alt ?? title,
    hosts: normalizeHosts(show?.hosts ?? show?.talent ?? []),
    genres: normalizeGenres(show?.genres ?? []),
    format: show?.format ?? show?.showType ?? undefined,
    programmingType: doc.programmingType ?? undefined,
    streamUrl: streamUrl ?? undefined,
    scheduleType,
    sourceTimeZone: doc.timezone || DEFAULT_SOURCE_TIME_ZONE,
    daysOfWeek: doc.recurringRules?.daysOfWeek ?? [],
    startTime: normalizeClock(doc.recurringRules?.startTime),
    endTime: normalizeClock(doc.recurringRules?.endTime),
    effectiveStartDate: doc.recurringRules?.effectiveStartDate ?? undefined,
    effectiveEndDate: doc.recurringRules?.effectiveEndDate ?? undefined,
    absoluteStart: doc.absoluteTime?.startDateTime ?? undefined,
    absoluteEnd: doc.absoluteTime?.endDateTime ?? undefined,
    status: doc.status || 'active',
    conflictPriority: doc.conflictPriority ?? 1,
  }
}

function pickMedia(show: CmsScheduleShow | null | undefined, medium: ScheduleMedium): CmsMedia | null {
  const media = medium === 'radio'
    ? show?.coverArt ?? show?.logo ?? show?.image ?? null
    : show?.posterArt ?? show?.heroBanner ?? show?.image ?? null

  if (!media) return null

  const preferredUrl =
    media?.sizes?.card?.url ??
    media?.sizes?.thumb?.url ??
    media?.sizes?.square?.url ??
    media?.url ??
    null

  return {
    url: preferredUrl,
    alt: media.alt ?? show?.title ?? null,
    sizes: media.sizes ?? null,
  }
}

function normalizeHosts(hosts: CmsHost[] | null | undefined): string[] {
  if (!Array.isArray(hosts)) return []

  return hosts
    .map((host) => host.displayName || [host.firstName, host.lastName].filter(isNonEmptyString).join(' '))
    .filter(isNonEmptyString)
}

function normalizeGenres(genres: CmsGenre[] | null | undefined): string[] {
  if (!Array.isArray(genres)) return []

  return genres
    .map((genre) => {
      if (typeof genre === 'string') return genre
      return genre.name ?? genre.label ?? genre.title ?? genre.slug
    })
    .filter(isNonEmptyString)
}

function normalizeClock(value?: string | null) {
  if (!value) return undefined
  const clean = value.replace(/[^0-9]/g, '').padStart(4, '0').slice(0, 4)
  return clean.length === 4 ? clean : undefined
}

export async function getScheduleWindow(options: {
  displayZone?: DisplayTimeZone
  days?: number
  now?: Date
} = {}): Promise<ScheduleWindow> {
  const displayZone = options.displayZone ?? 'ET'
  const now = options.now ?? new Date()
  const days = options.days ?? 8
  const items = await getNormalizedScheduleItems()
  const allOccurrences = expandScheduleItems(items, {
    now,
    days,
    displayZone,
  })

  const nowMs = now.getTime()
  const todayKey = formatDateKey(now, DEFAULT_SOURCE_TIME_ZONE)

  const liveNow = allOccurrences.filter((item) => item.startTimestamp <= nowMs && item.endTimestamp > nowMs)
  const upcomingRadio48 = allOccurrences
    .filter((item) => item.medium === 'radio')
    .filter((item) => item.startTimestamp >= nowMs && item.startTimestamp < nowMs + TWO_DAYS_MS)
    .sort(sortOccurrences)

  const recentlyPlayedRadioToday = allOccurrences
    .filter((item) => item.medium === 'radio')
    .filter((item) => item.endTimestamp <= nowMs)
    .filter((item) => item.dateKey === todayKey)
    .sort((a, b) => b.startTimestamp - a.startTimestamp)

  return {
    displayZone,
    generatedAt: now.toISOString(),
    liveNow: liveNow.sort(sortOccurrences),
    upcomingRadio48,
    recentlyPlayedRadioToday,
    allOccurrences: allOccurrences.sort(sortOccurrences),
  }
}

function expandScheduleItems(items: NormalizedScheduleItem[], options: {
  now: Date
  days: number
  displayZone: DisplayTimeZone
}) {
  const occurrences: ScheduleOccurrence[] = []
  const from = startOfZonedDay(options.now, DEFAULT_SOURCE_TIME_ZONE)
  const untilMs = from.getTime() + options.days * ONE_DAY_MS

  for (const item of items) {
    if (item.scheduleType === 'absolute') {
      const occurrence = buildAbsoluteOccurrence(item, options.now, options.displayZone)
      if (occurrence && occurrence.endTimestamp >= from.getTime() && occurrence.startTimestamp <= untilMs) {
        occurrences.push(occurrence)
      }
      continue
    }

    occurrences.push(...buildRecurringOccurrences(item, from, options.days, options.now, options.displayZone))
  }

  return occurrences.sort(sortOccurrences)
}

function buildAbsoluteOccurrence(item: NormalizedScheduleItem, now: Date, displayZone: DisplayTimeZone): ScheduleOccurrence | null {
  if (!item.absoluteStart || !item.absoluteEnd) return null
  const start = new Date(item.absoluteStart)
  const end = new Date(item.absoluteEnd)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  return decorateOccurrence(item, start, end, now, displayZone)
}

function buildRecurringOccurrences(
  item: NormalizedScheduleItem,
  from: Date,
  days: number,
  now: Date,
  displayZone: DisplayTimeZone,
) {
  const occurrences: ScheduleOccurrence[] = []
  if (!item.startTime || !item.endTime || !item.daysOfWeek.length) return occurrences

  const sourceZone = item.sourceTimeZone || DEFAULT_SOURCE_TIME_ZONE
  const effectiveStart = item.effectiveStartDate ? new Date(item.effectiveStartDate).getTime() : null
  const effectiveEnd = item.effectiveEndDate ? new Date(item.effectiveEndDate).getTime() : null
  const daySet = new Set(item.daysOfWeek.map((day) => day.toLowerCase()))

  for (let offset = 0; offset < days; offset += 1) {
    const localDate = addDaysToZonedDate(from, offset, sourceZone)
    const dayName = DAY_NAMES[localDate.weekday].toLowerCase()
    if (!daySet.has(dayName)) continue

    const startHour = Number(item.startTime.slice(0, 2))
    const startMinute = Number(item.startTime.slice(2, 4))
    const endHour = Number(item.endTime.slice(0, 2))
    const endMinute = Number(item.endTime.slice(2, 4))

    const start = zonedTimeToUtc(
      localDate.year,
      localDate.month,
      localDate.day,
      startHour,
      startMinute,
      sourceZone,
    )

    let endDate = { ...localDate }
    const startsAfterEnd = endHour * 60 + endMinute <= startHour * 60 + startMinute
    if (startsAfterEnd) {
      endDate = addDaysToPlainDate(endDate, 1)
    }

    const end = zonedTimeToUtc(endDate.year, endDate.month, endDate.day, endHour, endMinute, sourceZone)

    if (effectiveStart && end.getTime() < effectiveStart) continue
    if (effectiveEnd && start.getTime() > effectiveEnd) continue

    occurrences.push(decorateOccurrence(item, start, end, now, displayZone))
  }

  return occurrences
}

function decorateOccurrence(
  item: NormalizedScheduleItem,
  start: Date,
  end: Date,
  now: Date,
  displayZone: DisplayTimeZone,
): ScheduleOccurrence {
  const displayTimeZone = displayZoneToIana(displayZone)
  const startTimestamp = start.getTime()
  const endTimestamp = end.getTime()
  const dateKey = formatDateKey(start, DEFAULT_SOURCE_TIME_ZONE)
  const dayLabel = formatDayLabel(start, displayTimeZone)
  const displayDate = formatDateLabel(start, displayTimeZone)
  const displayStart = formatTimeLabel(start, displayTimeZone)
  const displayEnd = formatTimeLabel(end, displayTimeZone)

  return {
    ...item,
    occurrenceId: `${item.medium}-${item.id}-${startTimestamp}`,
    start: start.toISOString(),
    end: end.toISOString(),
    startTimestamp,
    endTimestamp,
    isLive: startTimestamp <= now.getTime() && endTimestamp > now.getTime(),
    isUpcoming: startTimestamp > now.getTime(),
    dateKey,
    dayLabel,
    displayStart,
    displayEnd,
    displayDate,
    displayTimeRange: `${displayStart} – ${displayEnd} ${displayZone}`,
    displayZone,
    ctaHref: item.medium === 'radio' ? '/listen-live' : '/watch',
    ctaLabel: item.medium === 'radio' ? 'Listen Live' : 'Watch Live',
  }
}

function sortOccurrences(a: ScheduleOccurrence, b: ScheduleOccurrence) {
  if (a.startTimestamp !== b.startTimestamp) return a.startTimestamp - b.startTimestamp
  return b.conflictPriority - a.conflictPriority
}

function startOfZonedDay(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone)
  return zonedTimeToUtc(parts.year, parts.month, parts.day, 0, 0, timeZone)
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value
    return acc
  }, {})

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: DAY_NAMES.indexOf(parts.weekday),
    hour: Number(parts.hour === '24' ? '0' : parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  }
}

function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const parts = getZonedParts(utcGuess, timeZone)
  const zonedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  const offset = zonedAsUtc - utcGuess.getTime()
  return new Date(utcGuess.getTime() - offset)
}

function addDaysToZonedDate(from: Date, days: number, timeZone: string) {
  const parts = getZonedParts(new Date(from.getTime() + days * ONE_DAY_MS + 12 * 60 * 60 * 1000), timeZone)
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    weekday: parts.weekday,
  }
}

function addDaysToPlainDate(date: { year: number; month: number; day: number; weekday: number }, days: number) {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days, 12, 0, 0))
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
    weekday: next.getUTCDay(),
  }
}

function formatDateKey(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

function formatTimeLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function formatDayLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
  }).format(date)
}

function formatDateLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function filterScheduleByView(
  occurrences: ScheduleOccurrence[],
  view: string | string[] | undefined,
  now: Date = new Date(),
) {
  const currentView = Array.isArray(view) ? view[0] : view
  const todayKey = formatDateKey(now, DEFAULT_SOURCE_TIME_ZONE)

  switch (currentView) {
    case 'radio':
      return occurrences.filter((item) => item.medium === 'radio')
    case 'tv':
      return occurrences.filter((item) => item.medium === 'tv')
    case 'today':
      return occurrences.filter((item) => item.dateKey === todayKey)
    case 'week':
    case 'all':
    default:
      return occurrences
  }
}

export function normalizeScheduleView(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === 'radio' || raw === 'tv' || raw === 'today' || raw === 'week' || raw === 'all') return raw
  return 'all'
}

export function groupOccurrencesByDate(occurrences: ScheduleOccurrence[]) {
  return occurrences.reduce<Array<{ dateKey: string; label: string; items: ScheduleOccurrence[] }>>((groups, item) => {
    const existing = groups.find((group) => group.dateKey === item.dateKey)
    if (existing) {
      existing.items.push(item)
      return groups
    }

    groups.push({
      dateKey: item.dateKey,
      label: item.displayDate,
      items: [item],
    })

    return groups
  }, [])
}
