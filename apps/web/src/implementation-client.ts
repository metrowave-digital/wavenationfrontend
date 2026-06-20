import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

const isProduction = process.env.NODE_ENV === 'production'

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false'
const analyticsDebug = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'

const posthogToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  process.env.NEXT_PUBLIC_POSTHOG_KEY

const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

const posthogUiHost =
  process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com'

const disablePostHogSessionRecording =
  process.env.NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING !== 'false'

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),

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

if (typeof window !== 'undefined' && analyticsEnabled && posthogToken) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    ui_host: posthogUiHost,

    // Recommended PostHog setting for Next.js 15.3+ instrumentation-client.ts.
    // Handles modern web analytics + SPA/history navigation behavior.
    defaults: '2026-01-30',

    capture_pageleave: true,

    // Keep Sentry Replay as your replay tool for now.
    // Set NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=false later
    // if you also want PostHog session recordings.
    disable_session_recording: disablePostHogSessionRecording,

    loaded: (client) => {
      if (analyticsDebug) {
        client.debug()
        console.info('[WaveNation Analytics] PostHog loaded')
      }
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart