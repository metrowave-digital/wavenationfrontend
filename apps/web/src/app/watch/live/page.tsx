import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Watch Live | WaveNation',
  description: 'Redirecting to the WaveNation Watch Live page.',
  alternates: {
    canonical: '/watch-live',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function WatchLiveRedirectPage() {
  redirect('/watch-live')
}