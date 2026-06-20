'use client'

import { useMemo, useState } from 'react'
import styles from './Watch.module.css'
import type { LiveChannel } from './types'
import { cx } from './utils'
import { StrimmEmbedPlayer } from './StrimmEmbedPlayer'
import { HlsVideoPlayer } from './HlsVideoPlayer'
import { CloudflareStreamPlayer } from './CloudflareStreamPlayer'

function ChannelPlayer({ channel }: { channel: LiveChannel }) {
  if (channel.provider === 'strimm' || channel.provider === 'iframe') {
    return <StrimmEmbedPlayer embedUrl={channel.embedUrl} title={channel.title} />
  }

  if (channel.provider === 'cloudflare') {
    return <CloudflareStreamPlayer playbackIdOrUrl={channel.hlsUrl} posterUrl={channel.poster?.url} title={channel.title} />
  }

  return <HlsVideoPlayer hlsUrl={channel.hlsUrl} posterUrl={channel.poster?.url} title={channel.title} />
}

export function LiveChannelSwitcher({ channels }: { channels: LiveChannel[] }) {
  const primary = useMemo(() => channels.find((channel) => channel.isPrimary) || channels[0], [channels])
  const [activeId, setActiveId] = useState(primary?.id)
  const active = channels.find((channel) => channel.id === activeId) || primary

  if (!active) return <div className={styles.empty}>No live channels are configured yet.</div>

  return (
    <div className={styles.channelSwitcher}>
      <div>
        <ChannelPlayer channel={active} />
      </div>
      <aside className={styles.panel}>
        <h2 className={styles.panelTitle}>Live Channels</h2>
        <div className={styles.channelTabs}>
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className={cx(styles.channelButton, channel.id === active.id && styles.channelButtonActive)}
              onClick={() => setActiveId(channel.id)}
            >
              {channel.title}
            </button>
          ))}
        </div>
        <p className={styles.cardText}>{active.description || 'Streaming live from the WaveNation video network.'}</p>
      </aside>
    </div>
  )
}
