import type { Metadata } from 'next'
import { ProgrammingSchedulePage } from '@/components/ProgrammingSchedulePage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Schedule | WaveNation',
  description: 'Browse WaveNation radio and TV programming schedules.',
}

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}

  return <ProgrammingSchedulePage searchParams={params} />
}