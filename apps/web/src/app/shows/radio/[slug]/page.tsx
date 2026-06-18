import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShowProfile } from '@wavenation/ui-web'
import { getRadioShowBySlug, getRadioShows } from '@/lib/wavenation-shows'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const show = await getRadioShowBySlug(slug).catch(() => null)

  if (!show) {
    return {
      title: 'Radio Show Not Found | WaveNation',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description =
    show.shortDescription ||
    show.description ||
    `Listen to ${show.title} on WaveNation FM.`

  return {
    title: `${show.title} | WaveNation Radio`,
    description,
    openGraph: {
      title: show.title,
      description,
      images: show.imageUrl ? [show.imageUrl] : undefined,
    },
  }
}

export default async function RadioShowDetailPage({ params }: PageProps) {
  const { slug } = await params
  const show = await getRadioShowBySlug(slug).catch(() => null)

  if (!show) {
    notFound()
  }

  const relatedShows = await getRadioShows()
    .then((shows) =>
      shows
        .filter((related) => related.slug !== show.slug)
        .slice(0, 3),
    )
    .catch(() => [])

  return (
    <main className={styles.page}>
      <ShowProfile show={show} relatedShows={relatedShows} />
    </main>
  )
}