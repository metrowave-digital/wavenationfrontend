import type { Metadata } from 'next'
import { ShowsDirectory } from '@wavenation/ui-web'
import {
  filterShows,
  getFilterLinks,
  getRadioShows,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Radio Shows | WaveNation',
  description:
    'Browse active WaveNation FM radio shows, syndicated programs, DJs, and specialty blocks.',
}

type PageProps = {
  searchParams?: Promise<{
    filter?: string | string[]
  }>
}

export default async function RadioShowsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawFilter = resolvedSearchParams.filter
  const activeFilter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter

  const shows = await getRadioShows().catch(() => [])

  const filterValues = shows
    .flatMap((show) => [...(show.genres || []), show.formatLabel || ''])
    .filter((value): value is string => Boolean(value))

  const filteredShows = filterShows(shows, activeFilter)

  return (
    <main className={styles.page}>
      <ShowsDirectory
        eyebrow="WaveNation FM"
        title="Radio Shows"
        description="Live, syndicated, and specialty shows built for the WaveNation FM listening experience."
        shows={filteredShows}
        filters={getFilterLinks(
          '/shows/radio',
          'All Radio',
          filterValues,
          activeFilter,
        )}
        ctaLabel="View full schedule"
        ctaHref="/schedule"
        emptyTitle="No radio shows found"
        emptyMessage="Try another filter or check back as more WaveNation FM shows are published."
      />
    </main>
  )
}