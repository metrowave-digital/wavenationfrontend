import type { Metadata } from 'next'
import { ProgrammingSchedulePage } from '@/components/ProgrammingSchedulePage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Full Schedule | WaveNation',
  description: 'Browse WaveNation radio and TV programming schedules.',
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}

export default async function FullSchedulePage({ searchParams }: PageProps) {
  const params = await searchParams
  return <ProgrammingSchedulePage searchParams={params} />
}
