'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type AnalyticsValue = string | number | boolean | null | undefined

type RouteAnalyticsProps = {
  page: string
  route: string
  section?: string
  title?: string
  properties?: Record<string, AnalyticsValue | AnalyticsValue[]>
}

export function RouteAnalytics({
  page,
  route,
  section,
  title,
  properties = {},
}: RouteAnalyticsProps) {
  useEffect(() => {
    const baseProperties = {
      page,
      route,
      section: section ?? null,
      title: title ?? document.title,
      path: window.location.pathname,
      search: window.location.search,
      url: window.location.href,
      ...properties,
    }

    trackEvent('route_view', baseProperties)
    trackEvent(`${page}_page_view`, baseProperties)

    function handleClick(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const analyticsTarget = target.closest('[data-analytics-event]')

      if (!(analyticsTarget instanceof HTMLElement)) {
        return
      }

      const eventName = analyticsTarget.dataset.analyticsEvent

      if (!eventName) {
        return
      }

      trackEvent(eventName, {
        ...baseProperties,
        label:
          analyticsTarget.dataset.analyticsLabel ||
          analyticsTarget.textContent?.trim() ||
          null,
        href: analyticsTarget.getAttribute('href'),
      })
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [page, route, section, title, properties])

  return null
}