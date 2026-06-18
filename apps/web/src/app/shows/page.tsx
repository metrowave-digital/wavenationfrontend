import type { Metadata } from 'next'
import { ShowsHub } from '@wavenation/ui-web'
import { getShowsHubData } from '@/lib/wavenation-shows'
import { getFeaturedTalent } from '@/lib/wavenation-talent'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Shows | WaveNation',
  description: 'Browse WaveNation radio shows, podcasts, TV shows, and the talent behind the programming.',
  openGraph: {
    title: 'WaveNation Shows',
    description: 'Radio, podcasts, and TV made for the culture.',
  },
}

export default async function ShowsPage() {
  const [showsData, talentSpotlight] = await Promise.all([
    getShowsHubData(),
    getFeaturedTalent(4),
  ])

  return (
    <main className={styles.page}>
      <ShowsHub
        {...showsData}
        talentSpotlight={talentSpotlight}
        scheduleHref="/schedule"
        advertiseHref="/advertise"
      />
    </main>
  )
}
