'use client'

import { useEffect, useRef, useState } from 'react'
import type Hls from 'hls.js'
import styles from './Watch.module.css'

type HlsVideoPlayerProps = {
  hlsUrl?: string
  mp4Url?: string
  posterUrl?: string
  title?: string
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
}

export function HlsVideoPlayer({
  hlsUrl,
  mp4Url,
  posterUrl,
  title = 'WaveNation video',
  autoPlay = false,
  muted = false,
  controls = true,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current

    if (!videoElement) {
      return
    }

    let hlsInstance: Hls | null = null
    let cancelled = false

    const src = hlsUrl || mp4Url

    if (!src) {
      setError('No video source is available for this item.')
      return
    }

    setError(null)

    async function attachVideoSource(video: HTMLVideoElement) {
      try {
        if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsUrl
          return
        }

        if (hlsUrl) {
          const HlsModule = await import('hls.js')
          const HlsConstructor = HlsModule.default

          if (cancelled) {
            return
          }

          if (HlsConstructor.isSupported()) {
            hlsInstance = new HlsConstructor({
              enableWorker: true,
              lowLatencyMode: true,
            })

            hlsInstance.loadSource(hlsUrl)
            hlsInstance.attachMedia(video)
            return
          }
        }

        if (mp4Url) {
          video.src = mp4Url
          return
        }

        setError('This browser cannot play the selected video source.')
      } catch {
        if (mp4Url) {
          video.src = mp4Url
        } else {
          setError('The video player could not load this stream.')
        }
      }
    }

    void attachVideoSource(videoElement)

    return () => {
      cancelled = true

      if (hlsInstance) {
        hlsInstance.destroy()
      }
    }
  }, [hlsUrl, mp4Url])

  return (
    <div className={styles.playerFrame}>
      <video
        ref={videoRef}
        className={styles.video}
        poster={posterUrl}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        aria-label={title}
      />

      <div className={styles.playerChrome}>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} />
          WaveNation Player
        </span>
      </div>

      {error ? <div className={styles.empty}>{error}</div> : null}
    </div>
  )
}