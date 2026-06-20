import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChartProfile } from '@wavenation/ui-web'
import { getChartBySlug } from '@/lib/wavenation-music'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const chart = await getChartBySlug(slug)

  if (!chart) {
    return {
      title: 'Chart Not Found | WaveNation',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: chart.seoTitle || `${chart.title} | WaveNation Charts`,
    description: chart.seoDescription || chart.publicDescription || `View ${chart.title} on WaveNation.`,
    openGraph: {
      title: chart.title,
      description: chart.publicDescription || undefined,
      images: chart.socialCard?.url ? [chart.socialCard.url] : chart.coverArt?.url ? [chart.coverArt.url] : undefined,
    },
  }
}

export default async function ChartDetailPage({ params }: PageProps) {
  const { slug } = await params
  const chart = await getChartBySlug(slug)

  if (!chart) notFound()

  return (
    <main className={styles.page}>
      <ChartProfile chart={chart} />
    </main>
  )
}
