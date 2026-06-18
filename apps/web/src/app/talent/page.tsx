import type { Metadata } from 'next'
import { TalentDirectory } from '@wavenation/ui-web'
import { getTalent, getTalentRoleFilters } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Talent | WaveNation',
  description: 'Meet WaveNation hosts, DJs, creators, and on-air personalities.',
}

type PageProps = {
  searchParams?: Promise<{
    role?: string | string[]
  }>
}

type TalentRoleLike = {
  role?: string | null
  roleLabel?: string | null
  roles?: string[] | null
  type?: string | null
  formatLabel?: string | null
}

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase()
}

function filterTalentByActiveRole<TalentItem extends TalentRoleLike>(
  talent: TalentItem[],
  activeRole?: string,
) {
  const normalizedRole = normalizeValue(activeRole)

  if (!normalizedRole || normalizedRole === 'all') {
    return talent
  }

  return talent.filter((person) => {
    const possibleRoles = [
      person.role,
      person.roleLabel,
      person.type,
      person.formatLabel,
      ...(person.roles || []),
    ]

    return possibleRoles.some(
      (role) => normalizeValue(role) === normalizedRole,
    )
  })
}

export default async function TalentPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const rawRole = resolvedSearchParams.role
  const activeRole = Array.isArray(rawRole) ? rawRole[0] : rawRole

  const talent = await getTalent().catch(() => [])
  const filteredTalent = filterTalentByActiveRole(talent, activeRole)

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