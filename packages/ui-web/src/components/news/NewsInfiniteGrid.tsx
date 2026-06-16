'use client'

import { useCallback, useRef, useState } from 'react'
import type { NewsArticle } from '../../../../../apps/web/src/lib/news/news-types'
import { NewsCard } from './NewsCard'
import { NewsEmptyState } from './NewsCollectionShell'
import styles from './News.module.css'

type NewsInfiniteGridProps = {
  initialDocs: NewsArticle[]
  initialPage?: number
  initialHasNextPage?: boolean
  limit?: number
  filters?: {
    categorySlug?: string
    subcategorySlug?: string
    topicSlug?: string
    tagSlug?: string
    authorSlug?: string
    q?: string
    year?: string
    month?: string
  }
  emptyTitle?: string
  emptyDescription?: string
}

export function NewsInfiniteGrid({
  initialDocs,
  initialPage = 1,
  initialHasNextPage = false,
  limit = 12,
  filters = {},
  emptyTitle,
  emptyDescription,
}: NewsInfiniteGridProps) {
  const [docs, setDocs] = useState(initialDocs)
  const [page, setPage] = useState(initialPage)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingRef.current) return

    loadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const nextPage = page + 1
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      const response = await fetch(`/api/news/articles?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Unable to load more WaveNation stories.')
      }

      const data = await response.json()

      setDocs((current) => [...current, ...(data.docs || [])])
      setPage(data.page || nextPage)
      setHasNextPage(Boolean(data.hasNextPage))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Something went wrong.')
    } finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [filters, hasNextPage, limit, page])

  if (!docs.length) {
    return <NewsEmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className={styles.infiniteWrap}>
      <div className={styles.grid}>
        {docs.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {hasNextPage ? (
        <button type="button" className={styles.loadMore} onClick={loadMore} disabled={isLoading}>
          {isLoading ? 'Loading the next wave…' : 'Load More Stories'}
        </button>
      ) : (
        <p className={styles.endNote}>You’re caught up on this wave.</p>
      )}
    </div>
  )
}