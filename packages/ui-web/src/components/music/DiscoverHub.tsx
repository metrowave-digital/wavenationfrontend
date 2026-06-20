import type { CSSProperties } from 'react'
import Link from 'next/link'
import { MusicCard } from './MusicCard'
import { MusicArtwork } from './MusicArtwork'
import styles from './DiscoverHub.module.css'
import type { ChartSummary, MoodSummary, PlaylistSummary } from './types'

type DiscoverHubProps = {
  featuredPlaylists: PlaylistSummary[]
  currentCharts: ChartSummary[]
  moods: MoodSummary[]
}

export function DiscoverHub({ featuredPlaylists, currentCharts, moods }: DiscoverHubProps) {
  return (
    <div className={styles.hub}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Discover WaveNation</p>
          <h1>Find the sound, mood, and chart moving the culture.</h1>
          <p className={styles.copy}>
            Explore curated playlists, active mood hubs, and the official WaveNation charts across gospel, hip-hop, R&B, Southern Soul, BPM, and the Hitlist.
          </p>
          <div className={styles.actions}>
            <Link href="/playlists">Browse Playlists</Link>
            <Link href="/charts">View Charts</Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>Featured Playlists</p>
          <h2>Curated for the wave</h2>
          <Link href="/playlists">View all</Link>
        </div>
        {featuredPlaylists.length > 0 ? (
          <div className={styles.grid}>
            {featuredPlaylists.slice(0, 6).map((playlist) => (
              <MusicCard
                key={playlist.slug}
                href={`/playlists/${playlist.slug}`}
                title={playlist.title}
                eyebrow={playlist.playlistTypeLabel}
                description={playlist.shortDescription || playlist.description}
                image={playlist.coverArt || playlist.heroImage}
                meta={playlist.curatorName ? `Curated by ${playlist.curatorName}` : playlist.updateCadenceLabel}
                badge={playlist.isSponsored ? 'Sponsored' : playlist.isFeatured ? 'Featured' : undefined}
                accent={playlist.accentColor}
                tags={[...(playlist.moods?.map((mood) => mood.name) ?? []), ...(playlist.genres?.map((genre) => genre.name) ?? [])]}
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Featured playlists will appear here after you publish them in the CMS.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>Moods</p>
          <h2>Choose your vibe</h2>
          <Link href="/playlists">Browse playlists</Link>
        </div>
        {moods.length > 0 ? (
          <div className={styles.moodGrid}>
            {moods.map((mood) => (
              <Link key={mood.slug || mood.name} href={`/playlists?mood=${mood.slug ?? ''}`} className={styles.moodCard} style={mood.themeColor ? ({ '--mood-color': mood.themeColor } as CSSProperties) : undefined}>
                <MusicArtwork image={mood.icon} title={mood.name} shape="circle" />
                <span>{mood.name}</span>
                {mood.description ? <p>{mood.description}</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Active moods will appear here after you publish them in the CMS.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>Current Charts</p>
          <h2>What’s moving now</h2>
          <Link href="/charts">View charts</Link>
        </div>
        {currentCharts.length > 0 ? (
          <div className={styles.grid}>
            {currentCharts.slice(0, 6).map((chart) => (
              <MusicCard
                key={chart.slug}
                href={`/charts/${chart.slug}`}
                title={chart.title}
                eyebrow={chart.chartTypeLabel}
                description={chart.publicDescription}
                image={chart.coverArt || chart.heroImage || chart.socialCard}
                meta={chart.weekLabel || (chart.chartSize ? `Top ${chart.chartSize}` : undefined)}
                badge={chart.isCurrent ? 'Current' : undefined}
                accent={chart.accentColor}
                variant="feature"
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Current charts will appear here after you publish them in the CMS.</p>
        )}
      </section>
    </div>
  )
}
