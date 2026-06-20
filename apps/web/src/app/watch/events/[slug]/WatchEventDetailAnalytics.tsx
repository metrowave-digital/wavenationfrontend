'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchEventDetailAnalyticsProps = {
  eventId: string
  title: string
  eventType?: string
  locked: boolean
  includeStream?: boolean
}

export function WatchEventDetailAnalytics({
  eventId,
  title,
  eventType,
  locked,
  includeStream = false,
}: WatchEventDetailAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_event_detail_view', {
      page: '/watch/events/[slug]',
      page_title: title,
      section: 'watch',
      content_type: 'watch_event_detail',
      event_id: eventId,
      event_type: eventType,
      locked,
      access_type: locked ? 'locked' : 'free',
      include_stream: includeStream,
    })
  }, [eventId, title, eventType, locked, includeStream])

  return null
}