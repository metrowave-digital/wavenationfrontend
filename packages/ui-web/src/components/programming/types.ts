export type ProgrammingMedium = 'radio' | 'tv'

export type ProgrammingOccurrence = {
  occurrenceId: string
  medium: ProgrammingMedium
  title: string
  label: string
  description?: string
  slug?: string
  imageUrl?: string
  imageAlt?: string
  hosts?: string[]
  genres?: string[]
  format?: string
  programmingType?: string
  isLive: boolean
  isUpcoming: boolean
  displayDate: string
  dayLabel: string
  displayStart: string
  displayEnd: string
  displayTimeRange: string
  ctaHref: string
  ctaLabel: string
}

export type ScheduleTab = {
  label: string
  href: string
  active?: boolean
}
