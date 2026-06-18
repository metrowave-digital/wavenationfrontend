import Link from 'next/link'
import { ShowCard } from './ShowCard'
import { ShowRail } from './ShowRail'
import styles from './ShowsHub.module.css'
import type { ShowsHubProps } from './types'

export function ShowsHub({
  featuredShows,
  radioShows,
  podcasts,
  tvShows,
  talentSpotlight = [],
  scheduleHref = '/schedule',
  advertiseHref = '/advertise',
}: ShowsHubProps) {
  const leadShow = featuredShows[0] || radioShows[0] || podcasts[0] || tvShows[0]
  const secondaryFeatured = featuredShows.filter((show) => show.id !== leadShow?.id).slice(0, 2)

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>WaveNation Shows</p>
          <h1>Radio, podcasts, and TV made for the culture.</h1>
          <p>
            Browse WaveNation FM programming, original podcasts, and WaveNation One TV shows in one mobile-ready hub.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shows/radio">Radio Shows</Link>
            <Link href="/shows/podcasts">Podcasts</Link>
            <Link href="/shows/tv">TV Shows</Link>
            <Link href="/talent">Talent</Link>
          </div>
        </div>

        {leadShow ? (
          <div className={styles.leadCard}>
            <ShowCard show={leadShow} variant="feature" />
          </div>
        ) : null}
      </section>

      <nav className={styles.sectionNav} aria-label="Show sections">
        <Link href="#featured">Featured Shows</Link>
        <Link href="#radio-shows">Radio</Link>
        <Link href="#podcasts">Podcasts</Link>
        <Link href="#tv-shows">TV Shows</Link>
        <Link href="#talent-spotlight">Talent</Link>
      </nav>

      {secondaryFeatured.length ? (
        <section id="featured" className={styles.featuredGrid}>
          {secondaryFeatured.map((show) => <ShowCard key={`${show.type}-${show.id}`} show={show} />)}
        </section>
      ) : null}

      <div id="radio-shows">
        <ShowRail
          eyebrow="WaveNation FM"
          title="Radio shows"
          description="Live, syndicated, and specialty audio experiences built for companionship, discovery, and energy."
          href="/shows/radio"
          shows={radioShows.slice(0, 6)}
          type="radio"
        />
      </div>

      <div id="podcasts">
        <ShowRail
          eyebrow="Podcast Network"
          title="Podcasts"
          description="Conversations, interviews, storytelling, and culture-forward series ready for on-demand listening."
          href="/shows/podcasts"
          shows={podcasts.slice(0, 6)}
          type="podcast"
        />
      </div>

      <div id="tv-shows">
        <ShowRail
          eyebrow="WaveNation One"
          title="TV shows"
          description="Talk, music, documentaries, visual series, and video-first programming for the WaveNation screen experience."
          href="/shows/tv"
          shows={tvShows.slice(0, 6)}
          type="tv"
        />
      </div>

      {talentSpotlight.length ? (
        <section id="talent-spotlight" className={styles.talentSpotlight}>
          <div>
            <p className={styles.eyebrow}>Talent Spotlight</p>
            <h2>The voices behind the wave.</h2>
            <p>Meet the hosts, DJs, creators, and on-air personalities shaping WaveNation programming.</p>
          </div>
          <div className={styles.talentGrid}>
            {talentSpotlight.slice(0, 4).map((person) => (
              <Link href={person.href} className={styles.talentCard} key={person.id}>
                {person.imageUrl ? <img src={person.imageUrl} alt={person.imageAlt || person.name} loading="lazy" /> : <span>{person.name.slice(0, 2).toUpperCase()}</span>}
                <strong>{person.name}</strong>
                {person.role ? <em>{person.role}</em> : null}
              </Link>
            ))}
          </div>
          <Link href="/talent" className={styles.fullTalent}>View all talent</Link>
        </section>
      ) : null}

      <section className={styles.ctaGrid}>
        <div className={styles.ctaPanel}>
          <p className={styles.eyebrow}>Schedule</p>
          <h2>Know what is on next.</h2>
          <p>Want to know when your favorite show or host is on air? View the full programming schedule.</p>
          <Link href={scheduleHref}>View full schedule</Link>
        </div>
        <div className={styles.ctaPanel}>
          <p className={styles.eyebrow}>Sponsors</p>
          <h2>Put your brand inside the programming.</h2>
          <p>Sponsor radio shows, podcast segments, TV series, talent spotlights, and culture-first placements.</p>
          <Link href={advertiseHref}>Advertise with WaveNation</Link>
        </div>
      </section>
    </div>
  )
}
