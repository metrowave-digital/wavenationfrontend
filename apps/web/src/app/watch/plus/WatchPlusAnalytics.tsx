'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchPlusAnalyticsProps = {
  itemCount: number
  lockedCount: number
}

export function WatchPlusAnalytics({
  itemCount,
  lockedCount,
}: WatchPlusAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_plus_view', {
      page: '/watch/plus',
      page_title: 'WaveNation+',
      section: 'watch',
      content_type: 'premium_video_hub',
      item_count: itemCount,
      locked_count: lockedCount,
      has_items: itemCount > 0,
      has_locked_items: lockedCount > 0,
    })
  }, [itemCount, lockedCount])

  return null
}