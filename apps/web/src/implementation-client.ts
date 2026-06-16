import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),

  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

  sendDefaultPii: false,

  tracesSampleRate: isProduction ? 0.1 : 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],

  replaysSessionSampleRate: isProduction ? 0.02 : 0,
  replaysOnErrorSampleRate: isProduction ? 1.0 : 0,

  enableLogs: isProduction,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart