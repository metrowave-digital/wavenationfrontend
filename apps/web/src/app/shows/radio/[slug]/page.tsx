import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import { getRadioShowBySlug, getRadioShows } from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const show = await getRadioShowBySlug(slug).catch(() => null)

  if (!show) {
    return {
      title: 'Radio Show Not Found | WaveNation',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${show.title} | WaveNation Radio`,
    description: show.shortDescription || show.description || `Listen to ${show.title} on WaveNation FM.`,
    openGraph: {
      title: show.title,
      description: show.shortDescription || show.description,
      images: show.imageUrl ? [show.imageUrl] : undefined,
    },
  }
}

export default async function RadioShowDetailPage({ params }: PageProps) {
  const { slug } = await params
  const show = await getRadioShowBySlug(slug).catch(() => null)

  if (!show) notFound()

  const relatedShows = (await getRadioShows().catch(() => []))
    .filter((related) => related.slug !== show.slug)
    .slice(0, 3)

  return (
    <main className={styles.page}>
      <ShowProfile show={show} relatedShows={relatedShows} />
    </main>
  )
}
