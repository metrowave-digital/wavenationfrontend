import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@wavenation/ui-web',
    '@wavenation/api-client',
    '@wavenation/config',
    '@wavenation/types',
    '@wavenation/auth',
    '@wavenation/media-sdk',
    '@wavenation/analytics',
    '@wavenation/feature-flags',
    '@wavenation/utils',
  ],

  images: {
    remotePatterns: [
      // Payload CMS media
      {
        protocol: 'https',
        hostname: 'cms.wavenation.online',
      },

      // Optional Render CMS fallback, useful if any old media URLs still point here
      {
        protocol: 'https',
        hostname: 'wavenation-cms.onrender.com',
      },

      // Live365 station/player/album art images
      {
        protocol: 'https',
        hostname: 'live365.com',
      },
      {
        protocol: 'https',
        hostname: '**.live365.com',
      },

      // Common CDN pattern in case Live365 metadata returns CDN-hosted artwork
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },

      // Future Cloudflare/R2/CDN-hosted WaveNation assets
      {
        protocol: 'https',
        hostname: '**.wavenation.online',
      },
      {
        protocol: 'https',
        hostname: '**.wavenation.media',
      },
      {
        protocol: 'https',
        hostname: '**.wavenation.plus',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG as string,
  project: process.env.SENTRY_PROJECT as string,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  widenClientFileUpload: true,

  // Helps avoid ad blockers blocking client-side Sentry events.
  tunnelRoute: '/monitoring',

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  errorHandler: (error) => {
    console.warn('Sentry build upload failed:', error)
  },
})