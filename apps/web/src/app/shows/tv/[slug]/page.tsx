import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import { getTvShowBySlug, getTvShows } from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const show = await getTvShowBySlug(slug).catch(() => null)

  if (!show) {
    return {
      title: 'TV Show Not Found | WaveNation',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${show.title} | WaveNation One`,
    description: show.shortDescription || show.description || `Watch ${show.title} on WaveNation One.`,
    openGraph: {
      title: show.title,
      description: show.shortDescription || show.description,
      images: show.imageUrl ? [show.imageUrl] : undefined,
    },
  }
}

export default async function TvShowDetailPage({ params }: PageProps) {
  const { slug } = await params
  const show = await getTvShowBySlug(slug).catch(() => null)

  if (!show) notFound()

  const relatedShows = (await getTvShows().catch(() => []))
    .filter((related) => related.slug !== show.slug)
    .slice(0, 3)

  return (
    <main className={styles.page}>
      <ShowProfile show={show} relatedShows={relatedShows} />
    </main>
  )
}
