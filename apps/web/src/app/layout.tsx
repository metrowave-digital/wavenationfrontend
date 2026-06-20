import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import { SiteChrome } from '@/components/SiteChrome'
import { AnalyticsScripts } from './components/AnalyticsScripts'
import { AdSenseScripts } from '../components/AdSenseScripts'
import { getSiteSettings } from '@/lib/wavenation-nav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const siteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteTitle = settings.siteTitle || 'WaveNation'
  const description =
    settings.defaultSeoDescription ||
    'WaveNation is a digital media network streaming 24/7 urban radio, culture news, live video, events, and creator-focused content.'

  return {
    metadataBase: new URL(siteBaseUrl),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description,
    applicationName: 'WaveNation',
    authors: [{ name: 'WaveNation Media' }],
    creator: 'WaveNation Media',
    publisher: 'WaveNation Media',
    icons: {
      icon: settings.favicon?.url || undefined,
      apple: settings.appleTouchIcon?.url || undefined,
    },
    openGraph: {
      title: siteTitle,
      description,
      url: '/',
      siteName: siteTitle,
      type: 'website',
      locale: 'en_US',
      images: settings.defaultShareImage?.url
        ? [settings.defaultShareImage.url]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description,
      images: settings.defaultShareImage?.url
        ? [settings.defaultShareImage.url]
        : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <head>
        <AnalyticsScripts />
        <AdSenseScripts />
      </head>

      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}