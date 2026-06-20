import Link from 'next/link'
import { MusicArtwork } from './MusicArtwork'
import { PlaylistTrackList } from './PlaylistTrackList'
import styles from './PlaylistProfile.module.css'
import type { PlaylistSummary } from './types'

type PlaylistProfileProps = {
  playlist: PlaylistSummary
  backHref?: string
}

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

export function PlaylistProfile({ playlist, backHref = '/playlists' }: PlaylistProfileProps) {
  const publishedLabel = formatDate(playlist.publishedAt)
  const hasPlatforms = (playlist.platformLinks?.length ?? 0) > 0

  return (
    <article className={styles.profile}>
      <div className={styles.hero}>
        <div className={styles.copy}>
          <Link href={backHref} className={styles.backLink}>← All Playlists</Link>
          <p className={styles.eyebrow}>{playlist.playlistTypeLabel || 'WaveNation Playlist'}</p>
          <h1>{playlist.title}</h1>
          {playlist.shortDescription || playlist.description ? (
            <p className={styles.description}>{playlist.shortDescription || playlist.description}</p>
          ) : null}

          <div className={styles.metaGrid}>
            {playlist.curatorName ? (
              <div>
                <span>Curated By</span>
                <strong>{playlist.curatorName}</strong>
                {playlist.curatorRole ? <small>{playlist.curatorRole}</small> : null}
              </div>
            ) : null}
            {playlist.updateCadenceLabel ? (
              <div>
                <span>Updated</span>
                <strong>{playlist.updateCadenceLabel}</strong>
              </div>
            ) : null}
            {publishedLabel ? (
              <div>
                <span>Published</span>
                <strong>{publishedLabel}</strong>
              </div>
            ) : null}
            {playlist.tracks?.length ? (
              <div>
                <span>Tracks</span>
                <strong>{playlist.tracks.length}</strong>
              </div>
            ) : null}
          </div>

          {playlist.isSponsored ? (
            <div className={styles.sponsorNotice}>
              <strong>{playlist.sponsorName ? `Sponsored by ${playlist.sponsorName}` : 'Sponsored Playlist'}</strong>
              {playlist.sponsorDisclosure ? <p>{playlist.sponsorDisclosure}</p> : null}
              {playlist.sponsorUrl ? <a href={playlist.sponsorUrl} target="_blank" rel="noreferrer">Visit sponsor</a> : null}
            </div>
          ) : null}
        </div>

        <div className={styles.visualStack}>
          <MusicArtwork image={playlist.coverArt || playlist.heroImage} title={playlist.title} accent={playlist.accentColor} />
          {hasPlatforms ? (
            <div className={styles.platforms} aria-label="Playlist platform links">
              {playlist.platformLinks?.map((link) => (
                <a key={`${link.key}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {playlist.description && playlist.description !== playlist.shortDescription ? (
        <section className={styles.section}>
          <p>{playlist.description}</p>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>Tracklist</p>
          <h2>Inside the playlist</h2>
        </div>
        <PlaylistTrackList tracks={playlist.tracks ?? []} />
      </section>
    </article>
  )
}
