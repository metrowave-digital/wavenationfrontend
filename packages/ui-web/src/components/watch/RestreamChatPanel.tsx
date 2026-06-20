'use client'

import { useEffect, useState } from 'react'
import styles from './Watch.module.css'

export function RestreamChatPanel({
  chatEmbedUrl,
  apiEndpoint = '/api/restream/chat-url',
  title = 'Live Chat',
}: {
  chatEmbedUrl?: string
  apiEndpoint?: string
  title?: string
}) {
  const [url, setUrl] = useState(chatEmbedUrl || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (chatEmbedUrl) return
    let ignore = false
    fetch(apiEndpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Chat unavailable'))))
      .then((data: { url?: string }) => {
        if (!ignore && data.url) setUrl(data.url)
      })
      .catch(() => {
        if (!ignore) setError('Restream chat is ready for API setup. Add RESTREAM_ACCESS_TOKEN to enable the embedded chat panel.')
      })
    return () => {
      ignore = true
    }
  }, [apiEndpoint, chatEmbedUrl])

  return (
    <aside className={`${styles.panel} ${styles.chatBox}`}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {url ? (
        <iframe className={styles.iframe} src={url} title={title} allow="clipboard-write" />
      ) : (
        <p className={styles.chatUnavailable}>{error || 'Loading live chat…'}</p>
      )}
    </aside>
  )
}
