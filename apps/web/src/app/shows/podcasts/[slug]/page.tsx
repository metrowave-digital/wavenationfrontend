import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import {
  getPodcastBySlug,
  getPodcastEpisodes,
  getPodcasts,
} from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

type PodcastPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const { slug } = await params
  const podcast = await getPodcastBySlug(slug).catch(() => null)

  if (!podcast) {
    return {
      title: 'Podcast Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description =
    podcast.shortDescription ||
    podcast.description ||
    `Listen to ${podcast.title} from WaveNation.`

  return {
    title: `${podcast.title} | WaveNation Podcasts`,
    description,
    openGraph: {
      title: podcast.title,
      description,
      images: podcast.imageUrl ? [podcast.imageUrl] : undefined,
    },
  }
}

export default async function PodcastDetailPage({
  params,
}: PodcastPageProps) {
  const { slug } = await params

  const podcast = await getPodcastBySlug(slug).catch(() => null)

  if (!podcast) {
    notFound()
  }

  const [episodes, relatedShows] = await Promise.all([
    getPodcastEpisodes(podcast.id).catch(() => []),
    getPodcasts()
      .then((shows) =>
        shows
          .filter((show) => show.slug !== podcast.slug)
          .slice(0, 3),
      )
      .catch(() => []),
  ])

  return (
    <main className={styles.page}>
      <ShowProfile show={{ ...podcast, episodes }} relatedShows={relatedShows} />
    </main>
  )
}