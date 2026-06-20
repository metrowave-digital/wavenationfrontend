'use client'

import { sendGAEvent } from '@next/third-parties/google'
import posthog from 'posthog-js'
import {
  createAnalyticsPayload,
  sanitizeAnalyticsProperties,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from '@wavenation/analytics'

function isAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false'
}

function hasGA4() {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
}

function hasPostHog() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)
}

export function trackEvent(
  eventName: AnalyticsEventName | (string & {}),
  properties: AnalyticsProperties = {}
) {
  if (!isAnalyticsEnabled()) return

  const event = String(eventName)
  const payload = createAnalyticsPayload(properties)

  if (hasGA4()) {
    try {
      sendGAEvent('event', event, payload)
    } catch (error) {
      if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true') {
        console.warn('[WaveNation Analytics] GA4 event failed:', error)
      }
    }
  }

  if (typeof window !== 'undefined' && hasPostHog()) {
    try {
      posthog.capture(event, payload)
    } catch (error) {
      if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true') {
        console.warn('[WaveNation Analytics] PostHog event failed:', error)
      }
    }
  }

  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true') {
    console.info('[WaveNation Analytics]', event, payload)
  }
}

export function identifyAnalyticsUser(
  userId: string,
  properties: AnalyticsProperties = {}
) {
  if (!isAnalyticsEnabled()) return
  if (!hasPostHog()) return
  if (typeof window === 'undefined') return

  posthog.identify(userId, sanitizeAnalyticsProperties(properties))
}

export function resetAnalyticsIdentity() {
  if (!isAnalyticsEnabled()) return
  if (!hasPostHog()) return
  if (typeof window === 'undefined') return

  posthog.reset()
}

export function trackCtaClick({
  label,
  href,
  location,
}: {
  label: string
  href?: string
  location?: string
}) {
  trackEvent('cta_click', {
    label,
    href,
    location,
  })
}