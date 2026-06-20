'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchShowDetailAnalyticsProps = {
  showId: string
  title: string
  episodeCount: number
}

export function WatchShowDetailAnalytics({
  showId,
  title,
  episodeCount,
}: WatchShowDetailAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_show_detail_view', {
      page: '/watch/shows/[slug]',
      page_title: title,
      section: 'watch',
      content_type: 'tv_show_detail',
      show_id: showId,
      episode_count: episodeCount,
      has_episodes: episodeCount > 0,
    })
  }, [showId, title, episodeCount])

  return null
}