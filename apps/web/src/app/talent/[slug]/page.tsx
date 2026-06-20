import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TalentProfile } from '@wavenation/ui-web'
import { getTalentBySlug } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

const TALENT_OG_IMAGE = '/images/og/wavenation-talent-og.jpg'

type TalentPageParams = {
  slug: string
}

type PageProps = {
  params: Promise<TalentPageParams>
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

function truncateDescription(value: string | null | undefined, fallback: string) {
  const source = value?.replace(/\s+/g, ' ').trim() || fallback

  if (source.length <= 155) {
    return source
  }

  return `${source.slice(0, 152).trim()}...`
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const talent = await getTalentBySlug(slug).catch(() => null)

  if (!talent) {
    return {
      metadataBase: getMetadataBase(),
      title: 'Talent Not Found | WaveNation',
      description: 'The requested WaveNation talent profile could not be found.',
      alternates: {
        canonical: `/talent/${encodeURIComponent(slug)}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = truncateDescription(
    talent.shortBio || talent.fullBio,
    `Meet ${talent.name} from WaveNation.`
  )

  const canonical = `/talent/${talent.slug}`

  const images = talent.imageUrl
    ? [
        {
          url: talent.imageUrl,
          alt: talent.name,
        },
      ]
    : [
        {
          url: TALENT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${talent.name} on WaveNation`,
        },
      ]

  return {
    metadataBase: getMetadataBase(),
    title: `${talent.name} | WaveNation Talent`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${talent.name} | WaveNation Talent`,
      description,
      type: 'profile',
      url: canonical,
      siteName: 'WaveNation',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${talent.name} | WaveNation Talent`,
      description,
      images: [talent.imageUrl || TALENT_OG_IMAGE],
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

export default async function TalentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const talent = await getTalentBySlug(slug).catch(() => null)

  if (!talent) {
    notFound()
  }

  const description = truncateDescription(
    talent.shortBio || talent.fullBio,
    `Meet ${talent.name} from WaveNation.`
  )

  const talentJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': absoluteUrl(`/talent/${talent.slug}#profile`),
        name: `${talent.name} | WaveNation Talent`,
        description,
        url: absoluteUrl(`/talent/${talent.slug}`),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        mainEntity: {
          '@id': absoluteUrl(`/talent/${talent.slug}#person`),
        },
      },
      {
        '@type': 'Person',
        '@id': absoluteUrl(`/talent/${talent.slug}#person`),
        name: talent.name,
        description,
        image: talent.imageUrl
          ? absoluteUrl(talent.imageUrl)
          : absoluteUrl(TALENT_OG_IMAGE),
        url: absoluteUrl(`/talent/${talent.slug}`),
        worksFor: {
          '@type': 'Organization',
          name: 'WaveNation Media',
          url: absoluteUrl('/'),
        },
      },
    ],
  }

  return (
    <main
      className={styles.page}
      data-analytics-page="talent-profile"
      data-talent-id={String(talent.id)}
      data-talent-slug={talent.slug}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(talentJsonLd) }}
      />

      <TalentProfile talent={talent} />
    </main>
  )
}