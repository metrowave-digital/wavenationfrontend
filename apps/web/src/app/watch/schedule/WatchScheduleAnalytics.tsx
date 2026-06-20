'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchScheduleAnalyticsProps = {
  eventCount: number
  lockedCount: number
}

export function WatchScheduleAnalytics({
  eventCount,
  lockedCount,
}: WatchScheduleAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_schedule_view', {
      page: '/watch/schedule',
      page_title: 'Watch Schedule',
      section: 'watch',
      content_type: 'watch_schedule',
      event_count: eventCount,
      locked_count: lockedCount,
      has_events: eventCount > 0,
      has_locked_events: lockedCount > 0,
    })
  }, [eventCount, lockedCount])

  return null
}