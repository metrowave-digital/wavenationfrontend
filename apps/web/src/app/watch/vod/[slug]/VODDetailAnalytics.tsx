'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type VODDetailAnalyticsProps = {
  itemId: string
  title: string
  vodType?: string
  locked: boolean
}

export function VODDetailAnalytics({
  itemId,
  title,
  vodType,
  locked,
}: VODDetailAnalyticsProps) {
  useEffect(() => {
    trackEvent('watch_vod_detail_view', {
      page: '/watch/vod/[slug]',
      page_title: title,
      section: 'watch',
      content_type: 'vod_detail',
      item_id: itemId,
      vod_type: vodType,
      locked,
      access_type: locked ? 'locked' : 'free',
    })
  }, [itemId, title, vodType, locked])

  return null
}