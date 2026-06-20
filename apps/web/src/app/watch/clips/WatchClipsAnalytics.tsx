'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type WatchClipsAnalyticsProps = {
  itemCount: number
  lockedCount: number
}

export function WatchClipsAnalytics({
  itemCount,
  lockedCount,
}: WatchClipsAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_clips_view', {
      page: '/watch/clips',
      page_title: 'Clips',
      section: 'watch',
      content_type: 'clips_library',
      item_count: itemCount,
      locked_count: lockedCount,
      has_items: itemCount > 0,
      has_locked_items: lockedCount > 0,
    })
  }, [itemCount, lockedCount])

  return null
}