export type TalentSocials = Record<string, string | null | undefined>

export type TalentAssociatedItem = {
  id?: string | number
  title: string
  slug?: string
  href?: string
  type?: 'radio' | 'podcast' | 'tv' | 'playlist' | 'show'
  imageUrl?: string
  imageAlt?: string
}

export type TalentBookingInfo = {
  managerName?: string
  bookingEmail?: string
  isPublic?: boolean
}

export type TalentProfileSummary = {
  id: string | number
  firstName?: string
  lastName?: string
  name: string
  displayName?: string
  slug: string
  href: string
  role?: string
  status?: string
  shortBio?: string
  fullBio?: string
  imageUrl?: string
  imageAlt?: string
  heroImageUrl?: string
  heroImageAlt?: string
  socials?: TalentSocials
  bookingInfo?: TalentBookingInfo
  isFeatured?: boolean
  associatedShows?: TalentAssociatedItem[]
  associatedPodcasts?: TalentAssociatedItem[]
  curatedPlaylists?: TalentAssociatedItem[]
}

export type TalentDirectoryProps = {
  eyebrow?: string
  title: string
  description?: string
  talent: TalentProfileSummary[]
  filters?: Array<{
    label: string
    href: string
    isActive?: boolean
  }>
  emptyTitle?: string
  emptyMessage?: string
}

export type TalentProfileProps = {
  talent: TalentProfileSummary
}
