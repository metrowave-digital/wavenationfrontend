import Link from 'next/link'
import styles from './TalentProfile.module.css'
import type { TalentAssociatedItem, TalentProfileProps } from './types'

function formatRole(role?: string) {
  return role ? role.replace(/_/g, ' ') : 'WaveNation Talent'
}

function SocialLinks({ socials }: { socials?: Record<string, string | null | undefined> }) {
  const links = Object.entries(socials || {}).filter(([, url]) => Boolean(url))
  if (!links.length) return null

  return (
    <div className={styles.socials}>
      {links.map(([platform, url]) => (
        <a href={url || '#'} key={platform} target="_blank" rel="noreferrer">
          {platform}
        </a>
      ))}
    </div>
  )
}

function AssociatedList({ title, items = [] }: { title: string; items?: TalentAssociatedItem[] }) {
  if (!items.length) return null

  return (
    <section className={styles.panel}>
      <h2>{title}</h2>
      <div className={styles.associatedGrid}>
        {items.map((item, index) => {
          const content = (
            <>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" /> : <span>{(item.type || 'show').toUpperCase()}</span>}
              <strong>{item.title}</strong>
              {item.type ? <em>{item.type}</em> : null}
            </>
          )

          return item.href ? <Link href={item.href} className={styles.associated} key={item.id || `${item.title}-${index}`}>{content}</Link> : <div className={styles.associated} key={item.id || `${item.title}-${index}`}>{content}</div>
        })}
      </div>
    </section>
  )
}

export function TalentProfile({ talent }: TalentProfileProps) {
  const canBook = talent.bookingInfo?.isPublic && talent.bookingInfo.bookingEmail

  return (
    <article className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.portraitWrap}>
          {talent.imageUrl ? <img src={talent.imageUrl} alt={talent.imageAlt || talent.name} /> : <span>{talent.name.slice(0, 2).toUpperCase()}</span>}
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{formatRole(talent.role)}</p>
          <h1>{talent.name}</h1>
          {talent.shortBio ? <p>{talent.shortBio}</p> : null}
          <div className={styles.actions}>
            <Link href="#shows">View shows</Link>
            {canBook ? <a href={`mailto:${talent.bookingInfo?.bookingEmail}`}>Book talent</a> : null}
          </div>
          <SocialLinks socials={talent.socials} />
        </div>
      </section>

      <div className={styles.contentGrid}>
        <main className={styles.mainColumn}>
          <section className={styles.panel}>
            <h2>Biography</h2>
            <p>{talent.fullBio || talent.shortBio || 'Biography coming soon.'}</p>
          </section>

          <div id="shows">
            <AssociatedList title="Associated shows" items={talent.associatedShows} />
          </div>
          <AssociatedList title="Associated podcasts" items={talent.associatedPodcasts} />
          <AssociatedList title="Curated playlists" items={talent.curatedPlaylists} />
        </main>

        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <h2>Profile</h2>
            <dl className={styles.facts}>
              <div><dt>Role</dt><dd>{formatRole(talent.role)}</dd></div>
              <div><dt>Status</dt><dd>{talent.status || 'active'}</dd></div>
              {talent.isFeatured ? <div><dt>Feature</dt><dd>Talent spotlight</dd></div> : null}
              {talent.bookingInfo?.managerName ? <div><dt>Manager</dt><dd>{talent.bookingInfo.managerName}</dd></div> : null}
            </dl>
          </section>

          {canBook ? (
            <section className={styles.bookingPanel}>
              <p className={styles.eyebrow}>Booking</p>
              <h2>Bring this voice to your event, show, or campaign.</h2>
              <a href={`mailto:${talent.bookingInfo?.bookingEmail}`}>{talent.bookingInfo?.bookingEmail}</a>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  )
}
