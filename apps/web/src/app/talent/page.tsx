import type { Metadata } from 'next'
import { TalentDirectory } from '@wavenation/ui-web'
import { getTalent, getTalentRoleFilters } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

const TALENT_PATH = '/talent'
const TALENT_OG_IMAGE = '/images/og/wavenation-talent-og.jpg'

const pageTitle = 'Talent'
const pageDescription =
  'Meet WaveNation hosts, DJs, creators, and on-air personalities powering radio, podcasts, TV, live events, and culture programming.'

type TalentPageSearchParams = {
  role?: string | string[]
}

type PageProps = {
  searchParams?: Promise<TalentPageSearchParams>
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://wavenation.online'
  )
}

function getMetadataBase() {
  try {
    return new URL(getSiteUrl())
  } catch {
    return new URL('https://wavenation.online')
  }
}

function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, getMetadataBase()).toString()
  } catch {
    return new URL('/', getMetadataBase()).toString()
  }
}

function readFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase()
}

function safeRole(value?: string) {
  const normalized = value?.trim()
  return normalized || undefined
}

function formatRoleTitle(role: string) {
  return role
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStringProperty<TalentItem extends object>(
  person: TalentItem,
  key: 'role' | 'roleLabel' | 'type' | 'formatLabel'
) {
  const value = person[key as keyof TalentItem]
  return typeof value === 'string' ? value : undefined
}

function getStringArrayProperty<TalentItem extends object>(
  person: TalentItem,
  key: 'roles'
) {
  const value = person[key as keyof TalentItem]

  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function filterTalentByActiveRole<TalentItem extends object>(
  talent: TalentItem[],
  activeRole?: string
) {
  const normalizedRole = normalizeValue(activeRole)

  if (!normalizedRole || normalizedRole === 'all') {
    return talent
  }

  return talent.filter((person) => {
    const possibleRoles = [
      getStringProperty(person, 'role'),
      getStringProperty(person, 'roleLabel'),
      getStringProperty(person, 'type'),
      getStringProperty(person, 'formatLabel'),
      ...getStringArrayProperty(person, 'roles'),
    ]

    return possibleRoles.some((role) => normalizeValue(role) === normalizedRole)
  })
}

function buildTalentHref(role?: string) {
  if (!role || normalizeValue(role) === 'all') {
    return TALENT_PATH
  }

  const params = new URLSearchParams()
  params.set('role', role)

  return `${TALENT_PATH}?${params.toString()}`
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const activeRole = safeRole(readFirst(resolvedSearchParams.role))
  const roleTitle = activeRole ? formatRoleTitle(activeRole) : undefined

  const title = roleTitle
    ? `${roleTitle} Talent | WaveNation`
    : 'Talent | WaveNation'

  const description = roleTitle
    ? `Meet WaveNation ${roleTitle} talent, hosts, DJs, creators, and on-air personalities.`
    : pageDescription

  const canonical = buildTalentHref(activeRole)

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: 'WaveNation',
      images: [
        {
          url: TALENT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'WaveNation talent, hosts, DJs, and creators',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [TALENT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export default async function TalentPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawRole = resolvedSearchParams.role
  const activeRole = safeRole(readFirst(rawRole))

  const talent = await getTalent().catch(() => [])
  const filteredTalent = filterTalentByActiveRole(talent, activeRole)

  const directoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: absoluteUrl(buildTalentHref(activeRole)),
    isPartOf: {
      '@type': 'WebSite',
      name: 'WaveNation',
      url: absoluteUrl('/'),
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredTalent.length,
      itemListElement: filteredTalent.map((person, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: person.name,
        url: absoluteUrl(`/talent/${person.slug}`),
      })),
    },
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="talent-directory"
      data-active-role={activeRole ?? 'all'}
      data-talent-count={filteredTalent.length}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(directoryJsonLd) }}
      />

      <TalentDirectory
        title="Talent"
        description="Meet the hosts, DJs, creators, and personalities powering WaveNation radio, podcasts, and TV programming."
        talent={filteredTalent}
        filters={getTalentRoleFilters(talent, activeRole)}
      />
    </main>
  )
}