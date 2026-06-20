'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchShowsAnalyticsProps = {
  showCount: number
}

export function WatchShowsAnalytics({ showCount }: WatchShowsAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_shows_view', {
      page: '/watch/shows',
      page_title: 'TV Shows',
      section: 'watch',
      content_type: 'tv_shows_directory',
      show_count: showCount,
      has_shows: showCount > 0,
    })
  }, [showCount])

  return null
}