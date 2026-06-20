'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchReplaysAnalyticsProps = {
  itemCount: number
  lockedCount: number
}

export function WatchReplaysAnalytics({
  itemCount,
  lockedCount,
}: WatchReplaysAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_replays_view', {
      page: '/watch/replays',
      page_title: 'Live Replays',
      section: 'watch',
      content_type: 'live_replays',
      item_count: itemCount,
      locked_count: lockedCount,
      has_items: itemCount > 0,
      has_locked_items: lockedCount > 0,
    })
  }, [itemCount, lockedCount])

  return null
}