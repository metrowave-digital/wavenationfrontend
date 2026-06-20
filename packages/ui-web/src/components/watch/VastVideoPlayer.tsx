'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Watch.module.css'
import type { VODAdSettings } from './types'

type ImaAdsLoader = {
  addEventListener: (event: string, cb: (event: unknown) => void, capture?: boolean) => void
  requestAds: (request: unknown) => void
  contentComplete: () => void
}

type ImaAdsManager = {
  init: (width: number, height: number, viewMode: string) => void
  start: () => void
  destroy: () => void
}

declare global {
  interface Window {
    google?: {
      ima?: {
        AdDisplayContainer: new (container: HTMLElement, video: HTMLVideoElement) => { initialize?: () => void }
        AdsLoader: new (container: unknown) => ImaAdsLoader
        AdsRequest: new () => {
          adTagUrl?: string
          linearAdSlotWidth?: number
          linearAdSlotHeight?: number
          nonLinearAdSlotWidth?: number
          nonLinearAdSlotHeight?: number
        }
        AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: string } }
        AdErrorEvent: { Type: { AD_ERROR: string } }
        ViewMode: { NORMAL: string }
      }
    }
  }
}

function loadIma() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.ima) return resolve()

    const existing = document.querySelector<HTMLScriptElement>('script[data-wn-ima="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('IMA failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js'
    script.async = true
    script.dataset.wnIma = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('IMA failed to load'))
    document.head.appendChild(script)
  })
}

export function VastVideoPlayer({
  hlsUrl,
  mp4Url,
  posterUrl,
  title = 'WaveNation video',
  ads,
}: {
  hlsUrl?: string
  mp4Url?: string
  posterUrl?: string
  title?: string
  ads?: VODAdSettings
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const adContainerRef = useRef<HTMLDivElement | null>(null)
  const midrollPlayed = useRef(false)
  const [error, setError] = useState('')
  const [adMessage, setAdMessage] = useState('')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: { destroy: () => void } | undefined

    async function attach() {
      try {
        if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsUrl
          return
        }

        if (hlsUrl) {
          const HlsModule = await import('hls.js')
          const Hls = HlsModule.default
          if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true })
            hls.loadSource(hlsUrl)
            hls.attachMedia(video)
            return
          }
        }

        if (mp4Url) {
          video.src = mp4Url
          return
        }

        setError('No playable video source is available for this item.')
      } catch {
        if (mp4Url) video.src = mp4Url
        else setError('The branded video player could not load this stream.')
      }
    }

    attach()
    return () => hls?.destroy()
  }, [hlsUrl, mp4Url])

  useEffect(() => {
    const video = videoRef.current
    const container = adContainerRef.current
    if (!video || !container || !ads?.adsEnabled) return

    let adsManager: ImaAdsManager | undefined

    const playAd = async (tag?: string) => {
      if (!tag) return

      try {
        await loadIma()
        const ima = window.google?.ima
        if (!ima) return

        const displayContainer = new ima.AdDisplayContainer(container, video)
        displayContainer.initialize?.()
        const adsLoader = new ima.AdsLoader(displayContainer)

        adsLoader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (event: unknown) => {
          const loadedEvent = event as { getAdsManager?: (video: HTMLVideoElement) => ImaAdsManager }
          adsManager = loadedEvent.getAdsManager?.(video)
          adsManager?.init(video.clientWidth || 1280, video.clientHeight || 720, ima.ViewMode.NORMAL)
          adsManager?.start()
        })

        adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, () => {
          setAdMessage('')
          video.play().catch(() => undefined)
        })

        const request = new ima.AdsRequest()
        request.adTagUrl = tag
        request.linearAdSlotWidth = video.clientWidth || 1280
        request.linearAdSlotHeight = video.clientHeight || 720
        request.nonLinearAdSlotWidth = video.clientWidth || 1280
        request.nonLinearAdSlotHeight = Math.round((video.clientHeight || 720) / 3)

        setAdMessage('Advertisement')
        adsLoader.requestAds(request)
      } catch {
        setAdMessage('')
      }
    }

    const onFirstPlay = () => {
      video.removeEventListener('play', onFirstPlay)
      if (ads.preRoll) playAd(ads.preRoll)
    }

    const onTime = () => {
      const offset = ads.midRollOffset || 0
      if (ads.midRoll && offset > 0 && video.currentTime >= offset && !midrollPlayed.current) {
        midrollPlayed.current = true
        playAd(ads.midRoll)
      }
    }

    const onEnded = () => {
      if (ads.postRoll) playAd(ads.postRoll)
    }

    video.addEventListener('play', onFirstPlay)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('play', onFirstPlay)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', onEnded)
      adsManager?.destroy()
    }
  }, [ads])

  return (
    <div className={styles.playerFrame}>
      <video
        ref={videoRef}
        className={styles.video}
        poster={posterUrl}
        controls
        playsInline
        aria-label={title}
      />
      <div ref={adContainerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div className={styles.playerChrome}>
        <span className={styles.liveBadge}><span className={styles.liveDot} />WaveNation Player</span>
      </div>
      {adMessage ? <span className={styles.badge}>{adMessage}</span> : null}
      {error ? <div className={styles.empty}>{error}</div> : null}
    </div>
  )
}
