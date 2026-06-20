'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Watch.module.css'
import type { VODAdSettings } from './types'

type HlsInstance = {
  loadSource: (source: string) => void
  attachMedia: (media: HTMLMediaElement) => void
  destroy: () => void
}

type ImaAdsLoader = {
  addEventListener: (
    event: string,
    cb: (event: unknown) => void,
    capture?: boolean
  ) => void
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
        AdDisplayContainer: new (
          container: HTMLElement,
          video: HTMLVideoElement
        ) => {
          initialize?: () => void
        }
        AdsLoader: new (container: unknown) => ImaAdsLoader
        AdsRequest: new () => {
          adTagUrl?: string
          linearAdSlotWidth?: number
          linearAdSlotHeight?: number
          nonLinearAdSlotWidth?: number
          nonLinearAdSlotHeight?: number
        }
        AdsManagerLoadedEvent: {
          Type: {
            ADS_MANAGER_LOADED: string
          }
        }
        AdErrorEvent: {
          Type: {
            AD_ERROR: string
          }
        }
        ViewMode: {
          NORMAL: string
        }
      }
    }
  }
}

function loadIma() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.ima) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-wn-ima="true"]'
    )

    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('IMA failed to load'))
      )
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

type VastVideoPlayerProps = {
  hlsUrl?: string
  mp4Url?: string
  posterUrl?: string
  title?: string
  ads?: VODAdSettings
}

export function VastVideoPlayer({
  hlsUrl,
  mp4Url,
  posterUrl,
  title = 'WaveNation video',
  ads,
}: VastVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const adContainerRef = useRef<HTMLDivElement | null>(null)
  const midrollPlayed = useRef(false)

  const [error, setError] = useState('')
  const [adMessage, setAdMessage] = useState('')

  useEffect(() => {
    const videoElement = videoRef.current

    if (!videoElement) {
      return
    }

    let hls: HlsInstance | undefined
    let cancelled = false

    async function attachVideoSource(targetVideo: HTMLVideoElement) {
      try {
        setError('')

        if (hlsUrl && targetVideo.canPlayType('application/vnd.apple.mpegurl')) {
          targetVideo.src = hlsUrl
          return
        }

        if (hlsUrl) {
          const HlsModule = await import('hls.js')
          const Hls = HlsModule.default

          if (!cancelled && Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            }) as HlsInstance

            hls.loadSource(hlsUrl)
            hls.attachMedia(targetVideo)
            return
          }
        }

        if (mp4Url) {
          targetVideo.src = mp4Url
          return
        }

        setError('No playable video source is available for this item.')
      } catch {
        if (mp4Url) {
          targetVideo.src = mp4Url
          return
        }

        setError('The branded video player could not load this stream.')
      }
    }

    attachVideoSource(videoElement)

    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [hlsUrl, mp4Url])

  useEffect(() => {
    const videoElement = videoRef.current
    const adContainer = adContainerRef.current

    if (!videoElement || !adContainer || !ads?.adsEnabled) {
      return
    }

    let adsManager: ImaAdsManager | undefined
    let disposed = false

    const playAd = async (
      tag: string | undefined,
      targetVideo: HTMLVideoElement,
      targetContainer: HTMLDivElement
    ) => {
      if (!tag || disposed) {
        return
      }

      try {
        await loadIma()

        if (disposed) {
          return
        }

        const ima = window.google?.ima

        if (!ima) {
          return
        }

        const displayContainer = new ima.AdDisplayContainer(
          targetContainer,
          targetVideo
        )

        displayContainer.initialize?.()

        const adsLoader = new ima.AdsLoader(displayContainer)

        adsLoader.addEventListener(
          ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (event: unknown) => {
            const loadedEvent = event as {
              getAdsManager?: (video: HTMLVideoElement) => ImaAdsManager
            }

            adsManager = loadedEvent.getAdsManager?.(targetVideo)

            adsManager?.init(
              targetVideo.clientWidth || 1280,
              targetVideo.clientHeight || 720,
              ima.ViewMode.NORMAL
            )

            adsManager?.start()
          }
        )

        adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, () => {
          setAdMessage('')
          targetVideo.play().catch(() => undefined)
        })

        const request = new ima.AdsRequest()
        request.adTagUrl = tag
        request.linearAdSlotWidth = targetVideo.clientWidth || 1280
        request.linearAdSlotHeight = targetVideo.clientHeight || 720
        request.nonLinearAdSlotWidth = targetVideo.clientWidth || 1280
        request.nonLinearAdSlotHeight = Math.round(
          (targetVideo.clientHeight || 720) / 3
        )

        setAdMessage('Advertisement')
        adsLoader.requestAds(request)
      } catch {
        setAdMessage('')
      }
    }

    const onFirstPlay = () => {
      videoElement.removeEventListener('play', onFirstPlay)

      if (ads.preRoll) {
        playAd(ads.preRoll, videoElement, adContainer)
      }
    }

    const onTimeUpdate = () => {
      const offset = ads.midRollOffset || 0

      if (
        ads.midRoll &&
        offset > 0 &&
        videoElement.currentTime >= offset &&
        !midrollPlayed.current
      ) {
        midrollPlayed.current = true
        playAd(ads.midRoll, videoElement, adContainer)
      }
    }

    const onEnded = () => {
      if (ads.postRoll) {
        playAd(ads.postRoll, videoElement, adContainer)
      }
    }

    videoElement.addEventListener('play', onFirstPlay)
    videoElement.addEventListener('timeupdate', onTimeUpdate)
    videoElement.addEventListener('ended', onEnded)

    return () => {
      disposed = true
      videoElement.removeEventListener('play', onFirstPlay)
      videoElement.removeEventListener('timeupdate', onTimeUpdate)
      videoElement.removeEventListener('ended', onEnded)
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

      <div
        ref={adContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      <div className={styles.playerChrome}>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} />
          WaveNation Player
        </span>
      </div>

      {adMessage ? <span className={styles.badge}>{adMessage}</span> : null}

      {error ? <div className={styles.empty}>{error}</div> : null}
    </div>
  )
}