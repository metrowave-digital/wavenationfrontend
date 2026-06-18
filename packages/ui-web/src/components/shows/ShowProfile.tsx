import Link from 'next/link'
import { ShowArtwork } from './ShowArtwork'
import { ShowCard } from './ShowCard'
import styles from './ShowProfile.module.css'
import type { ShowProfileProps, ShowSeason, ShowSeasonEpisode, UnifiedShow } from './types'

function joinList(items?: string[]) {
  return items?.filter(Boolean).join(' / ')
}

function uniqueEpisodes(show: UnifiedShow): ShowSeasonEpisode[] {
  const fromShow = show.episodes || []
  const fromSeasons = (show.seasons || []).flatMap((season) => season.episodes || [])
  const all = [...fromShow, ...fromSeasons]
  const seen = new Set<string>()
  return all.filter((episode) => {
    const key = String(episode.id || episode.slug || episode.title)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function PeopleList({ label, people }: { label: string; people?: UnifiedShow['hosts'] }) {
  if (!people?.length) return null

  return (
    <section className={styles.panel}>
      <h2>{label}</h2>
      <div className={styles.peopleGrid}>
        {people.map((person) => {
          const content = (
            <>
              {person.imageUrl ? <img src={person.imageUrl} alt={person.imageAlt || person.name} loading="lazy" /> : <span>{person.name.slice(0, 2).toUpperCase()}</span>}
              <strong>{person.name}</strong>
              {person.role ? <em>{person.role}</em> : null}
            </>
          )

          return person.href ? (
            <Link href={person.href} className={styles.person} key={person.id || person.name}>{content}</Link>
          ) : (
            <div className={styles.person} key={person.id || person.name}>{content}</div>
          )
        })}
      </div>
    </section>
  )
}

function Sponsors({ show }: { show: UnifiedShow }) {
  if (!show.sponsors?.length) return null

  return (
    <section className={styles.panel}>
      <p className={styles.disclosure}>Sponsored placement</p>
      <h2>Show sponsors</h2>
      <div className={styles.sponsorGrid}>
        {show.sponsors.map((sponsor) => {
          const content = (
            <>
              {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt={sponsor.name} loading="lazy" /> : null}
              <strong>{sponsor.name}</strong>
              {sponsor.label ? <span>{sponsor.label}</span> : null}
            </>
          )
          return sponsor.url ? <a key={sponsor.id || sponsor.name} href={sponsor.url} className={styles.sponsor}>{content}</a> : <div key={sponsor.id || sponsor.name} className={styles.sponsor}>{content}</div>
        })}
      </div>
    </section>
  )
}

function EpisodeList({ episodes }: { episodes: ShowSeasonEpisode[] }) {
  if (!episodes.length) {
    return (
      <div className={styles.emptyEpisodes}>
        <h3>Episodes coming soon</h3>
        <p>This show is ready for episode data. Publish episodes in the CMS and they will display here.</p>
      </div>
    )
  }

  return (
    <div className={styles.episodeList}>
      {episodes.map((episode, index) => (
        <article className={styles.episode} key={episode.id || episode.slug || `${episode.title}-${index}`}>
          <div>
            <span>Episode {episode.episodeNumber || index + 1}</span>
            <h3>{episode.title}</h3>
            {episode.description ? <p>{episode.description}</p> : null}
          </div>
          {(episode.audioUrl || episode.videoUrl || episode.mediaUrl) ? (
            <a href={episode.audioUrl || episode.videoUrl || episode.mediaUrl}>Play</a>
          ) : null}
        </article>
      ))}
    </div>
  )
}

function SeasonList({ seasons = [] }: { seasons?: ShowSeason[] }) {
  if (!seasons.length) {
    return (
      <section id="seasons" className={styles.panel}>
        <h2>Seasons</h2>
        <div className={styles.emptyEpisodes}>
          <h3>No seasons published yet</h3>
          <p>Season and episode cards will appear here when they are added to the CMS.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="seasons" className={styles.panel}>
      <h2>Seasons</h2>
      <div className={styles.seasons}>
        {seasons.map((season, index) => (
          <article className={styles.season} key={season.id || `${season.title}-${index}`}>
            <div className={styles.seasonHeader}>
              <span>Season {season.seasonNumber || index + 1}</span>
              <h3>{season.title}</h3>
              {season.description ? <p>{season.description}</p> : null}
            </div>
            <EpisodeList episodes={season.episodes || []} />
          </article>
        ))}
      </div>
    </section>
  )
}

export function ShowProfile({ show, relatedShows = [] }: ShowProfileProps) {
  const people = show.hosts?.length ? show.hosts : show.talent
  const episodes = uniqueEpisodes(show)

  return (
    <article className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.metaRow}>
            <span className={styles.typeBadge}>{show.type}</span>
            {show.statusLabel ? <span>{show.statusLabel}</span> : null}
            {show.formatLabel ? <span>{show.formatLabel}</span> : null}
          </div>
          <h1>{show.title}</h1>
          {show.description ? <p>{show.description}</p> : null}

          <div className={styles.actions}>
            <Link href={show.primaryActionHref}>{show.primaryActionLabel}</Link>
            {show.secondaryActionHref && show.secondaryActionLabel ? <Link href={show.secondaryActionHref}>{show.secondaryActionLabel}</Link> : null}
          </div>
        </div>

        <ShowArtwork
          title={show.title}
          type={show.type}
          imageUrl={show.heroImageUrl || show.imageUrl}
          imageAlt={show.heroImageAlt || show.imageAlt}
          size="hero"
        />
      </section>

      <section className={styles.infoGrid}>
        {show.scheduleLabel ? <div><span>Schedule</span><strong>{show.scheduleLabel}</strong></div> : null}
        {people?.length ? <div><span>{show.type === 'tv' ? 'Talent' : 'Hosted by'}</span><strong>{people.map((p) => p.name).join(', ')}</strong></div> : null}
        {joinList(show.genres) || joinList(show.categories) ? <div><span>Categories</span><strong>{joinList(show.genres) || joinList(show.categories)}</strong></div> : null}
        {show.network ? <div><span>Network</span><strong>{show.network}</strong></div> : null}
        {show.isExplicit ? <div><span>Advisory</span><strong>Explicit</strong></div> : null}
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <PeopleList label={show.type === 'tv' ? 'Talent' : 'Hosts'} people={people} />

          {show.type === 'podcast' ? (
            <section id="episodes" className={styles.panel}>
              <h2>Episodes</h2>
              <EpisodeList episodes={episodes} />
            </section>
          ) : null}

          {show.type === 'tv' ? <SeasonList seasons={show.seasons} /> : null}

          {show.type === 'radio' ? (
            <section className={styles.panel}>
              <h2>About the show</h2>
              <p>{show.description || 'More show details are coming soon.'}</p>
            </section>
          ) : null}
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <h2>Quick links</h2>
            <div className={styles.quickLinks}>
              <Link href={show.primaryActionHref}>{show.primaryActionLabel}</Link>
              <Link href="/schedule">View full schedule</Link>
              <Link href="/advertise">Sponsor this show</Link>
            </div>
          </section>

          {show.distribution ? (
            <section className={styles.panel}>
              <h2>Distribution</h2>
              <div className={styles.distribution}>
                {Object.entries(show.distribution).map(([key, value]) => value ? <span key={key}>{key.replace(/([A-Z])/g, ' $1')}</span> : null)}
              </div>
            </section>
          ) : null}

          <Sponsors show={show} />
        </aside>
      </div>

      {relatedShows.length ? (
        <section className={styles.related}>
          <div className={styles.relatedHeader}>
            <p className={styles.eyebrow}>Keep watching and listening</p>
            <h2>Related programming</h2>
          </div>
          <div className={styles.relatedGrid}>
            {relatedShows.slice(0, 3).map((related) => <ShowCard key={`${related.type}-${related.id}`} show={related} />)}
          </div>
        </section>
      ) : null}
    </article>
  )
}
