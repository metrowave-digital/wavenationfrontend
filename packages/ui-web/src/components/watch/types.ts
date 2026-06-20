export type WatchImage = {
  url?: string
  alt?: string
  width?: number
  height?: number
}

export type WatchSponsor = {
  id?: string
  name: string
  logoUrl?: string
  href?: string
  label?: string
}

export type WatchTalent = {
  id?: string | number
  name: string
  role?: string
  slug?: string
  image?: WatchImage
  href?: string
  bio?: string
}

export type WatchLink = {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export type WatchAccessKind = 'free' | 'premium' | 'ppv' | 'unlisted' | 'private' | 'ticketed'

export type WatchAccessState = {
  kind: WatchAccessKind
  isLocked: boolean
  label: string
  message?: string
  priceDisplay?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export type LiveChannel = {
  id: string
  title: string
  slug: string
  description?: string
  provider: 'strimm' | 'cloudflare' | 'hls' | 'iframe' | 'custom'
  embedUrl?: string
  hlsUrl?: string
  poster?: WatchImage
  logo?: WatchImage
  isPrimary?: boolean
  sponsor?: WatchSponsor
  badge?: string
  adsEnabled?: boolean
  vastTagUrl?: string
}

export type VODAdSettings = {
  adsEnabled?: boolean
  disableForPremium?: boolean
  preRoll?: string
  midRoll?: string
  midRollOffset?: number
  postRoll?: string
}

export type VODItem = {
  id: string | number
  title: string
  slug: string
  description?: string
  vodType?: 'episode' | 'film' | 'documentary' | 'clip' | 'liveReplay' | string
  source?: 'original' | 'creator' | 'partner' | string
  status?: string
  visibility?: WatchAccessKind
  releaseDate?: string
  publishDate?: string
  runtimeSeconds?: number
  hlsUrl?: string
  providerAssetId?: string
  fallbackMp4Url?: string
  poster?: WatchImage
  captions?: Array<{ language?: string; vttUrl?: string }>
  chapters?: Array<{ title?: string; timestampSeconds?: number }>
  sponsor?: WatchSponsor
  ads?: VODAdSettings
  show?: Pick<TVShow, 'id' | 'title' | 'slug'>
  season?: number
  episodeNumber?: number
  isFeatured?: boolean
  access: WatchAccessState
  href: string
}

export type TVShow = {
  id: string | number
  title: string
  slug: string
  description?: string
  format?: string
  network?: string
  showStatus?: string
  posterArt?: WatchImage
  heroBanner?: WatchImage
  trailerUrl?: string
  sponsors?: WatchSponsor[]
  seasons?: Array<{ id?: string | number; title?: string; seasonNumber?: number; slug?: string }>
  ageRating?: string
  talent?: WatchTalent[]
  genres?: Array<{ id?: string | number; name?: string; slug?: string }>
  href: string
}

export type EventScheduleItem = {
  id?: string | number
  title: string
  startTime?: string
  endTime?: string
  location?: string
  description?: string
}

export type EventLineupMember = {
  id?: string | number
  name: string
  role?: string
  image?: WatchImage
  performanceTime?: string
  bio?: string
  externalUrl?: string
}

export type EventItem = {
  id: string | number
  title: string
  slug: string
  subtitle?: string
  summary?: string
  descriptionText?: string
  eventStatus?: string
  eventType?: string
  categories?: Array<{ id?: string | number; name?: string; slug?: string }>
  featured?: boolean
  isActive?: boolean
  startDate?: string
  endDate?: string
  timezone?: string
  doorsOpenAt?: string
  schedule?: EventScheduleItem[]
  location?: string
  virtualAccessType?: string
  livestreamProvider?: 'cloudflare_stream' | 'youtube_live' | 'vimeo' | 'zoom' | 'restream' | 'other' | string
  livestreamUrl?: string
  replayUrl?: string
  entryDetails?: string
  parkingInfo?: string
  accessibilityInfo?: string
  primaryCTA?: string
  registrationRequired?: boolean
  priceDisplay?: string
  ticketLinks?: Array<{ label: string; href: string }>
  lineup?: EventLineupMember[]
  sponsors?: WatchSponsor[]
  heroImage?: WatchImage
  posterImage?: WatchImage
  socialCard?: WatchImage
  gallery?: WatchImage[]
  promoVideoUrl?: string
  access: WatchAccessState
  href: string
  watchHref: string
}

export type WatchCardItem = {
  id?: string | number
  eyebrow?: string
  title: string
  description?: string
  href?: string
  image?: WatchImage
  badge?: string
  meta?: string
  accent?: 'blue' | 'magenta' | 'green' | 'teal' | 'news'
  isLive?: boolean
  locked?: boolean
}
