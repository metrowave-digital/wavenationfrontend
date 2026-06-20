'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchPageAnalyticsProps = {
  channelCount: number
  featuredVodCount: number
  latestVodCount: number
  showCount: number
  eventCount: number
}

export function WatchPageAnalytics({
  channelCount,
  featuredVodCount,
  latestVodCount,
  showCount,
  eventCount,
}: WatchPageAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_page_view', {
      page: '/watch',
      page_title: 'Watch',
      section: 'watch',
      content_type: 'video_hub',
      channel_count: channelCount,
      featured_vod_count: featuredVodCount,
      latest_vod_count: latestVodCount,
      show_count: showCount,
      event_count: eventCount,
      has_channels: channelCount > 0,
      has_vod: featuredVodCount > 0 || latestVodCount > 0,
      has_shows: showCount > 0,
      has_events: eventCount > 0,
    })
  }, [channelCount, featuredVodCount, latestVodCount, showCount, eventCount])

  return null
}