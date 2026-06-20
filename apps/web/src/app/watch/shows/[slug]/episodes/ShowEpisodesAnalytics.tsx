'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type ShowEpisodesAnalyticsProps = {
  showId: string
  showTitle: string
  episodeCount: number
}

export function ShowEpisodesAnalytics({
  showId,
  showTitle,
  episodeCount,
}: ShowEpisodesAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_show_episodes_view', {
      page: '/watch/shows/[slug]/episodes',
      page_title: `${showTitle} Episodes`,
      section: 'watch',
      content_type: 'show_episodes',
      show_id: showId,
      show_title: showTitle,
      episode_count: episodeCount,
      has_episodes: episodeCount > 0,
    })
  }, [showId, showTitle, episodeCount])

  return null
}