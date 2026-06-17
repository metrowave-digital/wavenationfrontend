import type { Metadata } from 'next'
import { AuthorsDirectory } from '@wavenation/ui-web'
import { getActiveAuthors, getAuthorBeats } from '@/lib/wavenation-authors'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Authors & Contributors',
  description:
    'Meet the active WaveNation authors, staff writers, editors, and contributors amplifying music, culture, sports, film, lifestyle, business, and technology stories.',
  alternates: {
    canonical: '/authors',
  },
  openGraph: {
    title: 'Authors & Contributors | WaveNation',
    description:
      'Meet the active WaveNation authors, staff writers, editors, and contributors behind the culture desk.',
    type: 'website',
    url: '/authors',
  },
}

type AuthorsPageSearchParams = {
  page?: string | string[]
  beat?: string | string[]
}

type AuthorsPageProps = {
  searchParams?: Promise<AuthorsPageSearchParams>
}

function readFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function safePage(value?: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.floor(parsed)
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const resolvedSearchParams = await searchParams
  const page = safePage(readFirst(resolvedSearchParams?.page))
  const activeBeatSlug = readFirst(resolvedSearchParams?.beat)

  const [authorsResponse, beats] = await Promise.all([
    getActiveAuthors({
      page,
      limit: 24,
      beatSlug: activeBeatSlug,
    }),
    getAuthorBeats(),
  ])

  return (
    <main className={styles.page}>
      <AuthorsDirectory
        authors={authorsResponse.authors}
        beats={beats}
        activeBeatSlug={activeBeatSlug}
        pagination={authorsResponse}
        baseHref="/authors"
      />
    </main>
  )
}
