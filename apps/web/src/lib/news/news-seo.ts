import type { Metadata } from 'next'

type OpenGraphType = 'website' | 'article'

type SocialImage = {
  url: string
  width: number
  height: number
  alt: string
}

type BuildNewsMetadataArgs = {
  title: string
  description?: string
  route: string
  image?: SocialImage
  type?: OpenGraphType
  noIndex?: boolean
  keywords?: string[]
}

type JsonLdBreadcrumbItem = {
  name: string
  path: string
}

export const siteName = 'WaveNation'
export const publisherName = 'WaveNation Media'

export const siteBaseUrl = (
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'
).replace(/\/$/, '')

export const newsSocialImage: SocialImage = {
  url: '/images/wavenation-news-social-card.jpg',
  width: 1200,
  height: 630,
  alt: 'WaveNation News social preview image',
}

export function absoluteUrl(path = '/') {
  if (!path) return siteBaseUrl

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${siteBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function normalizeRoute(route: string) {
  if (!route) return '/'
  return route.startsWith('/') ? route : `/${route}`
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function buildNewsMetadata({
  title,
  description,
  route,
  image = newsSocialImage,
  type = 'website',
  noIndex = false,
  keywords = [],
}: BuildNewsMetadataArgs): Metadata {
  const canonical = normalizeRoute(route)
  const safeDescription =
    description ||
    'Fresh music, culture, sports, film, lifestyle, business, technology, and community stories from WaveNation.'

  return {
    metadataBase: new URL(siteBaseUrl),
    title,
    description: safeDescription,
    alternates: {
      canonical,
    },
    keywords,
    applicationName: siteName,
    authors: [{ name: publisherName }],
    creator: publisherName,
    publisher: publisherName,
    category: 'News',
    openGraph: {
      title,
      description: safeDescription,
      url: canonical,
      siteName,
      type,
      locale: 'en_US',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: safeDescription,
      images: [
        {
          url: image.url,
          alt: image.alt,
        },
      ],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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

export function createBreadcrumbJsonLd(items: JsonLdBreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function createCollectionPageJsonLd({
  route,
  name,
  description,
}: {
  route: string
  name: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(route)}#webpage`,
    url: absoluteUrl(route),
    name,
    description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteBaseUrl}/#website`,
      name: siteName,
      url: siteBaseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      url: siteBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(newsSocialImage.url),
        width: newsSocialImage.width,
        height: newsSocialImage.height,
      },
    },
  }
}