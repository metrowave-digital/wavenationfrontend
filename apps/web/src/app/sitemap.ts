import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wavenation.online'

const staticRoutes = [
  '',
  '/about',
  '/news',
  '/authors',
  '/listen',
  '/watch',
  '/privacy',
  '/terms',
  '/cookies',
  '/copyright',
  '/community-guidelines',
  '/licensing-and-rights',
  '/accessibility',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/news') ? 0.9 : 0.6,
  }))
}
