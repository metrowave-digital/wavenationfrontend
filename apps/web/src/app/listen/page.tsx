import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: Promise<SearchParams>
}

export const metadata: Metadata = {
  title: {
    absolute: 'Listen Live | WaveNation FM',
  },
  robots: {
    index: false,
    follow: true,
  },
}

function buildQueryString(params: SearchParams) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        query.append(key, item)
      })

      return
    }

    query.set(key, value)
  })

  const queryString = query.toString()

  return queryString ? `?${queryString}` : ''
}

export default async function ListenRedirectPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const queryString = buildQueryString(resolvedSearchParams)

  redirect(`/listen-live${queryString}`)
}