import type { Metadata } from 'next'
import { TalentDirectory } from '@wavenation/ui-web'
import { filterTalentByRole, getTalent, getTalentRoleFilters } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Talent | WaveNation',
  description: 'Meet WaveNation hosts, DJs, creators, and on-air personalities.',
}

type PageProps = {
  searchParams?: Promise<{ role?: string }> | { role?: string }
}

export default async function TalentPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const activeRole = resolvedSearchParams.role
  const talent = await getTalent().catch(() => [])
  const filteredTalent = filterTalentByRole(talent, activeRole)

  return (
    <main className={styles.page}>
      <TalentDirectory
        title="Talent"
        description="Meet the hosts, DJs, creators, and personalities powering WaveNation radio, podcasts, TV, and culture programming."
        talent={filteredTalent}
        filters={getTalentRoleFilters(talent, activeRole)}
      />
    </main>
  )
}
