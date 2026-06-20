'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type EpisodeWatchAnalyticsProps = {
  episodeId: string
  title: string
  showTitle?: string
  vodType?: string
  locked: boolean
}

export function EpisodeWatchAnalytics({
  episodeId,
  title,
  showTitle,
  vodType,
  locked,
}: EpisodeWatchAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_episode_view', {
      page: '/watch/shows/[slug]/episodes/[episodeSlug]',
      page_title: title,
      section: 'watch',
      content_type: 'episode_detail',
      episode_id: episodeId,
      show_title: showTitle,
      vod_type: vodType,
      locked,
      access_type: locked ? 'locked' : 'free',
    })
  }, [episodeId, title, showTitle, vodType, locked])

  return null
}