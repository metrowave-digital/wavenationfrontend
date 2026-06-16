import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import { SiteChrome } from '@/components/SiteChrome'
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: {
      default: settings.siteTitle || 'WaveNation',
      template: `%s | ${settings.siteTitle || 'WaveNation'}`,
    },
    description:
      settings.defaultSeoDescription ||
      'WaveNation is a digital media network streaming 24/7 urban radio, culture news, playlists, and video content.',
    icons: {
      icon: settings.favicon?.url || undefined,
      apple: settings.appleTouchIcon?.url || undefined,
    },
    openGraph: {
      title: settings.siteTitle || 'WaveNation',
      description: settings.defaultSeoDescription || undefined,
      images: settings.defaultShareImage?.url ? [settings.defaultShareImage.url] : undefined,
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
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}