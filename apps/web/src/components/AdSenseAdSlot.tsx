'use client'

import { AdSlot } from '@wavenation/ui-web'
import { GoogleAd } from '@/components/GoogleAd'

type AdSlotSize =
  | 'leaderboard'
  | 'billboard'
  | 'rectangle'
  | 'wideRectangle'
  | 'skyscraper'
  | 'mobileBanner'
  | 'fluid'

type AdSenseAdSlotProps = {
  id: string
  slot?: string
  label?: string
  size?: AdSlotSize
  format?: string
  className?: string
}

export function AdSenseAdSlot({
  id,
  slot,
  label = 'Advertisement',
  size = 'fluid',
  format = 'auto',
  className,
}: AdSenseAdSlotProps) {
  if (!slot) {
    return <AdSlot id={id} label={label} size={size} isEmpty className={className} />
  }

  return (
    <AdSlot id={id} label={label} size={size} className={className}>
      <GoogleAd slot={slot} format={format} />
    </AdSlot>
  )
}