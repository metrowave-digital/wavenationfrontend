import Script from 'next/script'

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-RC4PJPVL6Z'

export function AnalyticsScripts() {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'false') {
    return null
  }

  if (!gaMeasurementId) {
    return null
  }

  return (
    <>
      <Script
        id="wavenation-ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />

      <Script
        id="wavenation-ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `,
        }}
      />
    </>
  )
}