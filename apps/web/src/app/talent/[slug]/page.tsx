import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TalentProfile } from '@wavenation/ui-web'
import { getTalentBySlug } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const talent = await getTalentBySlug(slug).catch(() => null)

  if (!talent) {
    return {
      title: 'Talent Not Found | WaveNation',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${talent.name} | WaveNation Talent`,
    description: talent.shortBio || talent.fullBio || `Meet ${talent.name} from WaveNation.`,
    openGraph: {
      title: talent.name,
      description: talent.shortBio || talent.fullBio,
      images: talent.imageUrl ? [talent.imageUrl] : undefined,
    },
  }
}

export default async function TalentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const talent = await getTalentBySlug(slug).catch(() => null)

  if (!talent) notFound()

  return (
    <main className={styles.page}>
      <TalentProfile talent={talent} />
    </main>
  )
}
