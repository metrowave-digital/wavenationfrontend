import type { Metadata } from 'next'
import { ShowsDirectory } from '@wavenation/ui-web'
import {
  filterShows,
  getFilterLinks,
  getTvShows,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'TV Shows | WaveNation',
  description:
    'Browse WaveNation One TV shows, video series, talk shows, and original programming.',
}

type PageProps = {
  searchParams?: Promise<{
    filter?: string | string[]
  }>
}

export default async function TvShowsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawFilter = resolvedSearchParams.filter
  const activeFilter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter

  const tvShows = await getTvShows().catch(() => [])

  const filterValues = tvShows
    .flatMap((show) => [...(show.genres || []), show.formatLabel || ''])
    .filter((value): value is string => Boolean(value))

  const filteredShows = filterShows(tvShows, activeFilter)

  return (
    <main className={styles.page}>
      <ShowsDirectory
        eyebrow="WaveNation One"
        title="TV Shows"
        description="Video-first programming, visual interviews, talk shows, music features, and original series for WaveNation screens."
        shows={filteredShows}
        filters={getFilterLinks(
          '/shows/tv',
          'All TV',
          filterValues,
          activeFilter,
        )}
        ctaLabel="View full schedule"
        ctaHref="/schedule"
        emptyTitle="No TV shows found"
        emptyMessage="Try another filter or check back as more WaveNation One shows are published."
      />
    </main>
  )
}