export type ShowType = 'radio' | 'podcast' | 'tv'

export type ShowPerson = {
  id?: string | number
  name: string
  slug?: string
  role?: string
  href?: string
  imageUrl?: string
  imageAlt?: string
}

export type SponsorSummary = {
  id?: string | number
  name: string
  url?: string
  logoUrl?: string
  label?: string
}

export type ShowSchedule = {
  days?: string[]
  startTime?: string
  endTime?: string
  timezone?: string
  label?: string
}

export type ShowDistribution = {
  applePodcasts?: boolean | string | null
  spotify?: boolean | string | null
  youtube?: boolean | string | null
  wavenation?: boolean | string | null
}

export type ShowSeasonEpisode = {
  id?: string | number
  title: string
  slug?: string
  description?: string
  duration?: string
  publishDate?: string
  episodeNumber?: number | string
  mediaUrl?: string
  videoUrl?: string
  audioUrl?: string
  imageUrl?: string
  imageAlt?: string
}

export type ShowSeason = {
  id?: string | number
  title: string
  seasonNumber?: number | string
  description?: string
  episodes?: ShowSeasonEpisode[]
}

export type UnifiedShow = {
  id: string | number
  type: ShowType
  title: string
  slug: string
  href: string
  description?: string
  shortDescription?: string
  statusLabel?: string
  formatLabel?: string
  network?: string
  author?: string
  language?: string
  copyright?: string
  isExplicit?: boolean
  isFeatured?: boolean
  imageUrl?: string
  imageAlt?: string
  heroImageUrl?: string
  heroImageAlt?: string
  trailerUrl?: string
  schedule?: ShowSchedule
  scheduleLabel?: string
  hosts?: ShowPerson[]
  talent?: ShowPerson[]
  sponsors?: SponsorSummary[]
  genres?: string[]
  categories?: string[]
  seasons?: ShowSeason[]
  episodes?: ShowSeasonEpisode[]
  distribution?: ShowDistribution
  primaryActionLabel: string
  primaryActionHref: string
  secondaryActionLabel?: string
  secondaryActionHref?: string
}

export type ShowsHubProps = {
  featuredShows: UnifiedShow[]
  radioShows: UnifiedShow[]
  podcasts: UnifiedShow[]
  tvShows: UnifiedShow[]
  talentSpotlight?: Array<{
    id: string | number
    name: string
    slug: string
    href: string
    role?: string
    shortBio?: string
    imageUrl?: string
    imageAlt?: string
  }>
  scheduleHref?: string
  advertiseHref?: string
}

export type ShowsDirectoryProps = {
  eyebrow?: string
  title: string
  description?: string
  shows: UnifiedShow[]
  filters?: Array<{
    label: string
    href: string
    isActive?: boolean
  }>
  emptyTitle?: string
  emptyMessage?: string
  ctaLabel?: string
  ctaHref?: string
}

export type ShowProfileProps = {
  show: UnifiedShow
  relatedShows?: UnifiedShow[]
}
