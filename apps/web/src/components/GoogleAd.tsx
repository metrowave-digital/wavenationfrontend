'use client'

import { useEffect, type CSSProperties } from 'react'

type AdsByGoogleWindow = Window & {
  adsbygoogle?: unknown[]
}

type GoogleAdProps = {
  slot: string
  format?: string
  layout?: string
  layoutKey?: string
  fullWidthResponsive?: boolean
  className?: string
  style?: CSSProperties
}

const adsenseEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED !== 'false'

const adsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID

export function GoogleAd({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  fullWidthResponsive = true,
  className,
  style,
}: GoogleAdProps) {
  useEffect(() => {
    if (!adsenseEnabled || !adsenseClientId || !slot) return

    try {
      const adsWindow = window as AdsByGoogleWindow
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || []
      adsWindow.adsbygoogle.push({})
    } catch (error) {
      if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true') {
        console.warn('[WaveNation AdSense] Ad push failed', error)
      }
    }
  }, [slot])

  if (!adsenseEnabled || !adsenseClientId || !slot) {
    return null
  }

  return (
    <ins
      className={['adsbygoogle', className].filter(Boolean).join(' ')}
      style={{
        display: 'block',
        textAlign: 'center',
        ...style,
      }}
      data-ad-client={adsenseClientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-ad-layout-key={layoutKey}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  )
}