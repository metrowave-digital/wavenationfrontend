'use client'

import { useEffect, useState } from 'react'
import styles from './Header.module.css'
import { HeaderBrand } from './HeaderBrand'
import { HeaderNav } from './HeaderNav'
import { HeaderActions } from './HeaderActions'
import { MobileMenu } from './MobileMenu'
import { SearchPopup } from './SearchPopup'
import { WeatherPopup } from './WeatherPopup'
import { ProfilePopup } from './ProfilePopup'
import type { NavConfig, SiteSettings, WeatherSnapshot } from './types'

type HeaderProps = {
  siteSettings?: SiteSettings | null
  navConfig?: NavConfig | null
  weather?: WeatherSnapshot | null
}

export function Header({ siteSettings, navConfig, weather }: HeaderProps) {
  const [isCompact, setIsCompact] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 24)
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`${styles.shell} ${isCompact ? styles.compact : ''}`}>
        <div className={styles.inner}>
          <HeaderBrand siteSettings={siteSettings} isCompact={isCompact} />

          <HeaderNav items={navConfig?.mainNav ?? []} />

          <HeaderActions
            onSearch={() => setSearchOpen(true)}
            onWeather={() => setWeatherOpen(true)}
            onProfile={() => setProfileOpen(true)}
            onMenu={() => setMobileOpen(true)}
          />
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        siteSettings={siteSettings}
        items={navConfig?.mainNav ?? []}
      />

      <SearchPopup isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <WeatherPopup isOpen={weatherOpen} onClose={() => setWeatherOpen(false)} weather={weather} />
      <ProfilePopup isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}