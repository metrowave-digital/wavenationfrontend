export type Nullable<T> = T | null | undefined

export type WNMediaSize = {
  url?: Nullable<string>
  width?: Nullable<number>
  height?: Nullable<number>
  mimeType?: Nullable<string>
  filesize?: Nullable<number>
  filename?: Nullable<string>
}

export type WNMediaAsset = {
  id?: string | number
  alt?: Nullable<string>
  url?: Nullable<string>
  filename?: Nullable<string>
  sizes?: {
    hero?: WNMediaSize
    card?: WNMediaSize
    thumb?: WNMediaSize
    square?: WNMediaSize
  }
}

export type SiteSettings = {
  siteTitle?: Nullable<string>
  tagline?: Nullable<string>
  defaultSeoDescription?: Nullable<string>
  logoLight?: Nullable<WNMediaAsset>
  logoDark?: Nullable<WNMediaAsset>
  favicon?: Nullable<WNMediaAsset>
  appleTouchIcon?: Nullable<WNMediaAsset>
  defaultShareImage?: Nullable<WNMediaAsset>
  address?: Nullable<string>
  phone?: Nullable<string>
  email?: Nullable<string>
  instagramUrl?: Nullable<string>
  twitterUrl?: Nullable<string>
  youtubeUrl?: Nullable<string>
  tiktokUrl?: Nullable<string>
  facebookUrl?: Nullable<string>
}

export type Badge = 'none' | 'new' | 'live' | 'trending' | 'editor-pick'
export type FeaturedAccent = 'blue' | 'magenta' | 'news' | 'brand' | 'green'

export type HeaderNavLink = {
  id?: Nullable<string>
  label?: Nullable<string>
  href?: Nullable<string>
  badge?: Nullable<Badge>
}

export type HeaderNavColumn = {
  id?: Nullable<string>
  label?: Nullable<string>
  icon?: Nullable<string>
  links?: Nullable<HeaderNavLink[]>
}

export type HeaderNavItem = {
  id?: Nullable<string>
  label?: Nullable<string>
  href?: Nullable<string>
  columns?: Nullable<HeaderNavColumn[]>
  featured?: Nullable<{
    eyebrow?: Nullable<string>
    title?: Nullable<string>
    description?: Nullable<string>
    href?: Nullable<string>
    accent?: Nullable<FeaturedAccent>
  }>
}

export type NavConfig = {
  mainNav?: Nullable<HeaderNavItem[]>
}

export type FooterLink = {
  id?: Nullable<string>
  label?: Nullable<string>
  href?: Nullable<string>
}

export type FooterColumn = {
  id?: Nullable<string>
  label?: Nullable<string>
  links?: Nullable<FooterLink[]>
}

export type FooterConfig = {
  columns?: Nullable<FooterColumn[]>
  legalLinks?: Nullable<FooterLink[]>
}

export type NewsTickerArticle = {
  id?: string | number
  label: string
  href: string
  eyebrow?: Nullable<string>
  accent?: Nullable<string>
}

export type NewsTickerManualInject = {
  id?: Nullable<string>
  label?: Nullable<string>
  href?: Nullable<string>
  accentOverride?: Nullable<string>
  isBreaking?: Nullable<boolean>
  validUntil?: Nullable<string>
}

export type NewsTickerSettings = {
  defaultLabel?: Nullable<string>
  scrollSpeed?: Nullable<number>
  isCrisisMode?: Nullable<boolean>
  crisisPrimaryColor?: Nullable<string>
  crisisTextColor?: Nullable<string>
  manualInjects?: Nullable<NewsTickerManualInject[]>
}

export type DynamicTickerItem = {
  id?: Nullable<string>
  medium?: Nullable<string>
  status?: Nullable<string>
  isLive?: Nullable<boolean>
  title?: Nullable<string>
  subtext?: Nullable<string>
  accent?: Nullable<string>
  scheduledStart?: Nullable<string>
  scheduledEnd?: Nullable<string>
}

export type DynamicTickerConfig = {
  displayDuration?: Nullable<number>
  transitionSpeed?: Nullable<number>
  showVisualizer?: Nullable<boolean>
  items?: Nullable<DynamicTickerItem[]>
}

export type WeatherSnapshot = {
  city?: string
  temperature?: string
  condition?: string
  highLow?: string
  details?: string
}