import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuthorProfile } from '@wavenation/ui-web'
import { getAuthorArticles, getAuthorBySlug } from '@/lib/wavenation-authors'
import styles from './page.module.css'

export const revalidate = 300

const AUTHORS_OG_IMAGE = '/images/og/wavenation-authors-og.jpg'

type AuthorPageParams = {
  slug: string
}

type AuthorPageProps = {
  params: Promise<AuthorPageParams>
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
  return new URL(pathOrUrl, getSiteUrl()).toString()
}

function truncateDescription(value: string | null | undefined, fallback: string) {
  const source = value?.replace(/\s+/g, ' ').trim() || fallback

  if (source.length <= 155) return source

  return `${source.slice(0, 152).trim()}...`
}

function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug).catch(() => null)

  if (!author) {
    return {
      metadataBase: getMetadataBase(),
      title: 'Author Not Found',
      description: 'The requested WaveNation author profile could not be found.',
      alternates: {
        canonical: `/authors/${encodeURIComponent(slug)}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = truncateDescription(
    author.bioText,
    `Read the latest WaveNation stories by ${author.fullName}.`
  )

  const canonical = `/authors/${author.slug}`

  const openGraphImages = author.avatarUrl
    ? [
        {
          url: author.avatarUrl,
          alt: author.avatarAlt ?? author.fullName,
        },
      ]
    : [
        {
          url: AUTHORS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${author.fullName} on WaveNation`,
        },
      ]

  return {
    metadataBase: getMetadataBase(),
    title: `${author.fullName} | Authors & Contributors`,
    description,
    authors: [
      {
        name: author.fullName,
        url: canonical,
      },
    ],
    creator: author.fullName,
    publisher: 'WaveNation Media',
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${author.fullName} | WaveNation`,
      description,
      type: 'profile',
      url: canonical,
      siteName: 'WaveNation',
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${author.fullName} | WaveNation`,
      description,
      images: [author.avatarUrl || AUTHORS_OG_IMAGE],
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

export default async function AuthorDetailPage({ params }: AuthorPageProps) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug).catch(() => null)

  if (!author) notFound()

  const articlesResponse = await getAuthorArticles(author.id, {
    page: 1,
    limit: 12,
  })

  const socialLinks =
    author.socialLinks
      ?.map((link) => link.url)
      .filter((url): url is string => Boolean(url)) ?? []

  const authorJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': absoluteUrl(`/authors/${author.slug}#profile`),
        name: `${author.fullName} | WaveNation`,
        description: truncateDescription(
          author.bioText,
          `Read the latest WaveNation stories by ${author.fullName}.`
        ),
        url: absoluteUrl(`/authors/${author.slug}`),
        isPartOf: {
          '@type': 'WebSite',
          name: 'WaveNation',
          url: absoluteUrl('/'),
        },
        mainEntity: {
          '@id': absoluteUrl(`/authors/${author.slug}#person`),
        },
      },
      {
        '@type': 'Person',
        '@id': absoluteUrl(`/authors/${author.slug}#person`),
        name: author.fullName,
        description: author.bioText || undefined,
        image: author.avatarUrl
          ? absoluteUrl(author.avatarUrl)
          : absoluteUrl(AUTHORS_OG_IMAGE),
        url: absoluteUrl(`/authors/${author.slug}`),
        sameAs: socialLinks.length > 0 ? socialLinks : undefined,
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
      data-analytics-page="author-profile"
      data-author-id={String(author.id)}
      data-author-slug={author.slug}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(authorJsonLd) }}
      />

      <AuthorProfile
        author={author}
        articles={articlesResponse.articles}
        articlesPagination={articlesResponse}
        backHref="/authors"
      />
    </main>
  )
}