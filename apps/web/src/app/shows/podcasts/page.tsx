import type { Metadata } from 'next'
import { ShowsDirectory } from '@wavenation/ui-web'
import {
  filterShows,
  getFilterLinks,
  getPodcasts,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Podcasts | WaveNation',
  description:
    'Browse WaveNation podcasts, on-demand conversations, culture shows, and storytelling series.',
}

type PageProps = {
  searchParams?: Promise<{
    filter?: string | string[]
  }>
}

export default async function PodcastsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawFilter = resolvedSearchParams.filter
  const activeFilter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter

  const podcasts = await getPodcasts().catch(() => [])

  const filterValues = podcasts
    .flatMap((show) => [...(show.categories || []), show.formatLabel || ''])
    .filter((value): value is string => Boolean(value))

  const filteredPodcasts = filterShows(podcasts, activeFilter)

  return (
    <main className={styles.page}>
      <ShowsDirectory
        eyebrow="Podcast Network"
        title="Podcasts"
        description="On-demand shows, interviews, commentary, and original audio storytelling from the WaveNation ecosystem."
        shows={filteredPodcasts}
        filters={getFilterLinks(
          '/shows/podcasts',
          'All Podcasts',
          filterValues,
          activeFilter,
        )}
        ctaLabel="View full schedule"
        ctaHref="/schedule"
        emptyTitle="No podcasts found"
        emptyMessage="Try another filter or check back as new WaveNation podcasts are published."
      />
    </main>
  )
}