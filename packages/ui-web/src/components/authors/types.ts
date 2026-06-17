export type AuthorSocialLink = {
  id?: string
  platform: string
  url: string
}

export type AuthorBeat = {
  id?: string | number
  name: string
  slug?: string
  description?: string
  themeColor?: string
}

export type AuthorProfileData = {
  id: string | number
  firstName?: string
  lastName?: string
  fullName: string
  initials?: string
  email?: string
  bioText?: string
  avatarUrl?: string
  avatarAlt?: string
  socialLinks?: AuthorSocialLink[]
  beats?: AuthorBeat[]
  aiAuthorityScore?: number
  slug: string
  status?: string
  role?: string
  href?: string
}

export type AuthorsPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number | null
  prevPage?: number | null
}

export type AuthorArticleSummary = {
  id: string | number
  title: string
  excerpt?: string
  href: string
  imageUrl?: string
  imageAlt?: string
  category?: string
  categoryColor?: string
  publishedAt?: string
  readingTime?: number
  badge?: string
}
