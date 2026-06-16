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
      {
        protocol: 'https',
        hostname: 'cms.wavenation.online',
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