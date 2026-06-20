'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchLiveAnalyticsProps = {
  eventCount: number
  channelCount: number
}

export function WatchLiveAnalytics({
  eventCount,
  channelCount,
}: WatchLiveAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_live_view', {
      page: '/watch-live',
      page_title: 'Watch Live',
      content_type: 'live_video',
      section: 'watch',
      event_count: eventCount,
      channel_count: channelCount,
      has_events: eventCount > 0,
      has_channels: channelCount > 0,
    })
  }, [eventCount, channelCount])

  return null
}