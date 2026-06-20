'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type CreatorVideoAnalyticsProps = {
  itemCount: number
  lockedCount: number
}

export function CreatorVideoAnalytics({
  itemCount,
  lockedCount,
}: CreatorVideoAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_creator_video_view', {
      page: '/watch/creators',
      page_title: 'Creator Video',
      section: 'watch',
      content_type: 'creator_video_library',
      item_count: itemCount,
      locked_count: lockedCount,
      has_items: itemCount > 0,
      has_locked_items: lockedCount > 0,
    })
  }, [itemCount, lockedCount])

  return null
}