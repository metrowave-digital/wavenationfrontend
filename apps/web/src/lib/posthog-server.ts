import { PostHog } from 'posthog-node'
import {
  createAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from '@wavenation/analytics'

function isAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false'
}

function getPostHogToken() {
  return (
    process.env.POSTHOG_PROJECT_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    ''
  )
}

function getPostHogHost() {
  return (
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    'https://us.i.posthog.com'
  )
}

export async function trackServerEvent({
  event,
  distinctId = 'server',
  properties = {},
}: {
  event: AnalyticsEventName | (string & {})
  distinctId?: string
  properties?: AnalyticsProperties
}) {
  if (!isAnalyticsEnabled()) return

  const token = getPostHogToken()
  if (!token) return

  const posthog = new PostHog(token, {
    host: getPostHogHost(),
    flushAt: 1,
    flushInterval: 0,
  })

  try {
    posthog.capture({
      distinctId,
      event: String(event),
      properties: createAnalyticsPayload({
        ...properties,
        source: 'server',
      }),
    })
  } finally {
    await posthog.shutdown()
  }
}