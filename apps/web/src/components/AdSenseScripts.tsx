import Script from 'next/script'

const adsenseEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED !== 'false'

const adsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID

export function AdSenseScripts() {
  if (!adsenseEnabled || !adsenseClientId) {
    return null
  }

  return (
    <Script
      id="wavenation-google-adsense"
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
    />
  )
}