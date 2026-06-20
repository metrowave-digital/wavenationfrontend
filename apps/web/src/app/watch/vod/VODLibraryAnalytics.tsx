'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type VODLibraryAnalyticsProps = {
  itemCount: number
  lockedCount: number
  freeCount: number
}

export function VODLibraryAnalytics({
  itemCount,
  lockedCount,
  freeCount,
}: VODLibraryAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_vod_view', {
      page: '/watch/vod',
      page_title: 'VOD Library',
      section: 'watch',
      content_type: 'vod_library',
      item_count: itemCount,
      locked_count: lockedCount,
      free_count: freeCount,
      has_items: itemCount > 0,
      has_locked_items: lockedCount > 0,
    })
  }, [itemCount, lockedCount, freeCount])

  return null
}