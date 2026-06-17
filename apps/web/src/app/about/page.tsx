import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'About WaveNation',
  description:
    'WaveNation is a digital radio network and cultural media platform amplifying music, creators, community stories, live TV, and on-demand entertainment.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About WaveNation',
    description:
      'A digital radio network and cultural media platform built for music, storytelling, creators, and community.',
    type: 'website',
  },
}

const pillars = [
  {
    title: 'WaveNation FM',
    text: 'A 24/7 digital radio stream built around R&B, Hip-Hop, Gospel, Southern Soul, Quiet Storm, interviews, themed blocks, and community-centered programming.',
    href: '/listen',
    label: 'Listen live',
  },
  {
    title: 'WaveNation One',
    text: 'A streaming video destination for live shows, music videos, interviews, creator spotlights, documentaries, and original culture-first programming.',
    href: '/watch',
    label: 'Watch now',
  },
  {
    title: 'WaveNation News',
    text: 'Editorial coverage for music, entertainment, culture, business, sports, lifestyle, faith, and community stories with clarity and cultural authority.',
    href: '/news',
    label: 'Read stories',
  },
  {
    title: 'Creator Hub',
    text: 'A future-focused space for artists, podcasters, filmmakers, DJs, influencers, and community voices to publish, grow, and build audience power.',
    href: '/creator-hub',
    label: 'For creators',
  },
]

const values = ['Authenticity', 'Innovation', 'Creativity', 'Community', 'Excellence', 'Empowerment']

const companyInfo = [
  { label: 'Legal entity', value: 'MetroWave Media Group dba WaveNation Media' },
  { label: 'Primary domain', value: 'wavenation.online' },
  { label: 'Mailing address', value: '1027 McClardy Rd, Clarksville, TN 37042' },
  { label: 'Legal contact', value: 'legal@wavenation.online' },
]

const stats = [
  { value: '24/7', label: 'Radio and streaming energy' },
  { value: 'Web + TV + Mobile', label: 'Built for every screen' },
  { value: 'Culture First', label: 'Music, stories, creators, and community' },
]

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.orbOne} aria-hidden="true" />
        <div className={styles.orbTwo} aria-hidden="true" />

        <p className={styles.eyebrow}>About WaveNation</p>
        <h1>Where culture lives, creators thrive, and the vibe amplifies.</h1>
        <p className={styles.lede}>
          WaveNation is a digital radio network and cultural media platform built at the intersection of music, storytelling, live streaming, creator power, and community connection. We are rooted in Southern Black creativity while reaching listeners, viewers, and creators across every screen.
        </p>
        <div className={styles.actions}>
          <Link href="/listen" className={styles.primaryAction}>
            Listen Live
          </Link>
          <Link href="/watch" className={styles.secondaryAction}>
            Watch WaveNation
          </Link>
        </div>
      </section>

      <section className={styles.missionGrid} aria-label="Mission and vision">
        <article>
          <span>Mission</span>
          <h2>Amplify unheard voices.</h2>
          <p>
            Our mission is to create a living digital home for multicultural stories, where radio, television, on-demand streaming, journalism, and creator-led media move culture forward.
          </p>
        </article>
        <article>
          <span>Vision</span>
          <h2>Build the next great culture network.</h2>
          <p>
            Our vision is to become a respected urban media network blending technology, creativity, and community across audio, video, editorial, live events, and creator ecosystems.
          </p>
        </article>
      </section>

      <section className={styles.stats} aria-label="WaveNation highlights">
        {stats.map((item) => (
          <article key={item.value}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>The Ecosystem</p>
        <h2>One brand. Multiple ways to tap in.</h2>
        <p>
          WaveNation is more than a stream. It is a connected platform for live audio, video, news, playlists, podcasts, creator stories, and cultural experiences.
        </p>
      </section>

      <section className={styles.pillarGrid} aria-label="WaveNation platforms">
        {pillars.map((pillar) => (
          <article key={pillar.title} className={styles.pillarCard}>
            <div className={styles.cardSignal} aria-hidden="true" />
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
            <Link href={pillar.href}>{pillar.label}</Link>
          </article>
        ))}
      </section>

      <section className={styles.valuesSection}>
        <div>
          <p className={styles.eyebrow}>Our Values</p>
          <h2>Built with rhythm, responsibility, and excellence.</h2>
          <p>
            WaveNation’s voice is bold, electric, informed, and community-rooted. We tell stories with respect, move with innovation, and build tools that give creators more room to own their voice.
          </p>
        </div>
        <ul>
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </section>

      <section className={styles.companyPanel} aria-label="Company information">
        <div>
          <p className={styles.eyebrow}>Company Information</p>
          <h2>Operated by MetroWave Media Group.</h2>
          <p>
            WaveNation Media is the public-facing cultural media brand operated by MetroWave Media Group. For legal, rights, privacy, licensing, accessibility, or platform policy questions, use the official contact below.
          </p>
        </div>
        <dl>
          {companyInfo.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.cta}>
        <p className={styles.eyebrow}>Amplify Your Vibe</p>
        <h2>Step into the wave.</h2>
        <p>
          Listen to WaveNation FM, explore culture stories, watch live and on-demand video, and follow the creators shaping what comes next.
        </p>
        <div className={styles.actions}>
          <Link href="/news" className={styles.primaryAction}>
            Explore News
          </Link>
          <Link href="/authors" className={styles.secondaryAction}>
            Meet Contributors
          </Link>
        </div>
      </section>
    </main>
  )
}
