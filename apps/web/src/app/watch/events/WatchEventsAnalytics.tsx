'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchEventsAnalyticsProps = {
  eventCount: number
  lockedCount: number
}

export function WatchEventsAnalytics({
  eventCount,
  lockedCount,
}: WatchEventsAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_events_view', {
      page: '/watch/events',
      page_title: 'Watch Events',
      section: 'watch',
      content_type: 'watch_events_directory',
      event_count: eventCount,
      locked_count: lockedCount,
      has_events: eventCount > 0,
      has_locked_events: lockedCount > 0,
    })
  }, [eventCount, lockedCount])

  return null
}