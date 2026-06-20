export type MusicAccent =
  | 'electric_blue'
  | 'neon_green'
  | 'magenta_pulse'
  | 'signal_teal'
  | 'southern_heat'
  | 'custom'
  | string

export type MusicImage = {
  id?: string | number
  url?: string
  alt?: string
  width?: number
  height?: number
}

export type TaxonomyTerm = {
  id?: string | number
  name: string
  slug?: string
  description?: string
  themeColor?: string
  icon?: MusicImage
}

export type MoodSummary = TaxonomyTerm

export type PlatformLink = {
  key: string
  label: string
  url: string
}

export type TrackSummary = {
  id?: string | number
  title: string
  artistName?: string
  featuredArtists?: string[]
  albumOrProject?: string
  releaseDate?: string
  duration?: string
  explicit?: boolean
  artwork?: MusicImage
  platformLinks?: PlatformLink[]
}

export type PlaylistTrackSummary = {
  id?: string | number
  position?: number
  title: string
  artistName?: string
  albumOrProject?: string
  duration?: string
  artwork?: MusicImage
  explicit?: boolean
  editorialNote?: string
  isNewThisWeek?: boolean
  isFeaturedPlacement?: boolean
  isIndieSpotlight?: boolean
  platformLinks?: PlatformLink[]
}

export type PlaylistSummary = {
  id?: string | number
  title: string
  slug: string
  playlistType?: string
  playlistTypeLabel?: string
  shortDescription?: string
  description?: string
  curatorName?: string
  curatorRole?: string
  coverArt?: MusicImage
  heroImage?: MusicImage
  accentColor?: MusicAccent
  customAccentColor?: string
  genres?: TaxonomyTerm[]
  moods?: MoodSummary[]
  tags?: string[]
  targetAudience?: string
  tracks?: PlaylistTrackSummary[]
  primaryPlatform?: string
  platformLinks?: PlatformLink[]
  isSponsored?: boolean
  sponsorName?: string
  sponsorLogo?: MusicImage
  sponsorUrl?: string
  sponsorDisclosure?: string
  publishedAt?: string
  updateCadence?: string
  updateCadenceLabel?: string
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
}

export type ChartType = 'hitlist' | 'gospel' | 'southern_soul' | 'hip_hop' | 'rb_soul' | 'bpm' | string

export type ChartEntryMovement = 'new' | 'up' | 'down' | 'same' | 're_entry' | 'drop_off' | string

export type ChartEntrySummary = {
  id?: string | number
  entryLabel?: string
  position?: number
  lastWeekPosition?: number
  peakPosition?: number
  weeksOnChart?: number
  movementDirection?: ChartEntryMovement
  movementValue?: number
  title: string
  artistName?: string
  artwork?: MusicImage
  track?: TrackSummary
  platformLinks?: PlatformLink[]
  isNewEntry?: boolean
  isReEntry?: boolean
  isIndieSpotlight?: boolean
  isPremiere?: boolean
  isStaffPick?: boolean
  badgeLabel?: string
  publicNote?: string
}

export type ChartSummary = {
  id?: string | number
  title: string
  slug: string
  chartType?: ChartType
  chartTypeLabel?: string
  publicDescription?: string
  weekLabel?: string
  weekStart?: string
  weekEnd?: string
  chartSize?: number
  publishedAt?: string
  isCurrent?: boolean
  entries?: ChartEntrySummary[]
  coverArt?: MusicImage
  heroImage?: MusicImage
  socialCard?: MusicImage
  accentColor?: MusicAccent
  rankingMode?: string
  rankingModeLabel?: string
  methodologyNote?: string
  editorialStatus?: string
  featuredOnHomepage?: boolean
  featuredOnMusicPage?: boolean
  relatedArticleUrl?: string
  seoTitle?: string
  seoDescription?: string
}

export type MusicTab = {
  label: string
  href: string
  isActive?: boolean
  count?: number
}
