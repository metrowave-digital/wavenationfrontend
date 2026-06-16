import {
  DynamicTicker,
  Footer,
  Header,
  NewsTicker,
  type WeatherSnapshot,
} from '@wavenation/ui-web'
import {
  getCurrentWeekRandomTickerArticles,
  getDynamicTickerConfig,
  getFooterConfig,
  getNavConfig,
  getNewsTickerSettings,
  getSiteSettings,
} from '@/lib/wavenation-nav'

import { WavePlayer } from '@/components/WavePlayer'

type SiteChromeProps = {
  children: React.ReactNode
}

const fallbackWeather: WeatherSnapshot = {
  city: 'Nashville, TN / Charlotte, NC',
  temperature: '--',
  condition: 'Weather provider pending',
  highLow: 'CMS-ready panel',
  details: 'Connect a weather API here when you choose the provider.',
}

export async function SiteChrome({ children }: SiteChromeProps) {
  const [
    siteSettings,
    navConfig,
    footerConfig,
    newsTickerSettings,
    dynamicTickerConfig,
    tickerArticles,
  ] = await Promise.all([
    getSiteSettings(),
    getNavConfig(),
    getFooterConfig(),
    getNewsTickerSettings(),
    getDynamicTickerConfig(),
    getCurrentWeekRandomTickerArticles(5),
  ])

  return (
    <>
      <NewsTicker settings={newsTickerSettings} articles={tickerArticles} />
      <Header siteSettings={siteSettings} navConfig={navConfig} weather={fallbackWeather} />
      <DynamicTicker config={dynamicTickerConfig} />

      {children}

      <Footer siteSettings={siteSettings} footerConfig={footerConfig} />
      <WavePlayer />
    </>
  )
}