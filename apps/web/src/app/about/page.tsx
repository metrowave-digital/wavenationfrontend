import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

const rawSiteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const siteBaseUrl = normalizeSiteBaseUrl(rawSiteBaseUrl)
const socialImagePath = '/images/wavenation-social-card.jpg'
const logoPath = '/images/wavenation-logo.png'
const legalEmail = 'legal@wavenation.online'

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'About WaveNation | Digital Radio, Culture News, TV, and Creator Media',
  description:
    'WaveNation is a digital radio network and cultural media platform amplifying music, creators, community stories, live TV, and on-demand entertainment.',
  applicationName: 'WaveNation',
  authors: [{ name: 'WaveNation Media' }],
  creator: 'WaveNation Media',
  publisher: 'WaveNation Media',
  category: 'Media and Entertainment',
  keywords: [
    'WaveNation',
    'WaveNation Media',
    'WaveNation FM',
    'WaveNation One',
    'digital radio network',
    'urban media platform',
    'Black culture media',
    'creator platform',
    'music news',
    'live TV streaming',
    'Southern Black creativity',
    'culture news',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About WaveNation',
    description:
      'A digital radio network and cultural media platform built for music, storytelling, creators, and community.',
    url: '/about',
    siteName: 'WaveNation',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: 'WaveNation — Amplify Your Vibe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About WaveNation',
    description:
      'WaveNation is a digital radio network and cultural media platform amplifying music, creators, community stories, live TV, and on-demand entertainment.',
    images: [socialImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

const pillars = [
  {
    title: 'WaveNation FM',
    text: 'A 24/7 digital radio stream built around R&B, Hip-Hop, Gospel, Southern Soul, Quiet Storm, and community-centered programming.',
    href: '/listen-live',
    label: 'Listen live',
  },
  {
    title: 'WaveNation One',
    text: 'A streaming video destination for live shows, music videos, interviews, creator spotlights, documentaries, and original culture-first programming.',
    href: '/watch-live',
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
] as const

const values = [
  'Authenticity',
  'Innovation',
  'Creativity',
  'Community',
  'Excellence',
  'Empowerment',
] as const

const companyInfo = [
  {
    label: 'Legal entity',
    value: 'MetroWave Media Group dba WaveNation Media',
  },
  {
    label: 'Primary domain',
    value: 'wavenation.online',
  },
  {
    label: 'Mailing address',
    value: '1027 McClardy Rd, Clarksville, TN 37042',
  },
  {
    label: 'Legal contact',
    value: legalEmail,
    href: `mailto:${legalEmail}`,
  },
] as const

const stats = [
  {
    value: '24/7',
    label: 'Radio and streaming energy',
  },
  {
    value: 'Web + TV + Mobile',
    label: 'Built for every screen',
  },
  {
    value: 'Culture First',
    label: 'Music, stories, creators, and community',
  },
] as const

function normalizeSiteBaseUrl(value: string) {
  const trimmedValue = value.trim().replace(/\/+$/, '')

  if (!trimmedValue) {
    return 'https://wavenation.online'
  }

  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    return trimmedValue
  }

  return `https://${trimmedValue.replace(/^\/+/, '')}`
}

function toAbsoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, `${siteBaseUrl}/`).toString()
  } catch {
    return `${siteBaseUrl}/`
  }
}

function JsonLd() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About WaveNation',
      url: toAbsoluteUrl('/about'),
      description:
        'WaveNation is a digital radio network and cultural media platform amplifying music, creators, community stories, live TV, and on-demand entertainment.',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(socialImagePath),
      },
      publisher: {
        '@type': 'Organization',
        name: 'WaveNation Media',
        url: siteBaseUrl,
        logo: {
          '@type': 'ImageObject',
          url: toAbsoluteUrl(logoPath),
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'WaveNation Media',
      alternateName: 'WaveNation',
      legalName: 'MetroWave Media Group dba WaveNation Media',
      url: siteBaseUrl,
      slogan: 'Amplify Your Vibe',
      description:
        'A digital radio network and cultural media platform built for music, storytelling, creators, community, live TV, and on-demand entertainment.',
      logo: toAbsoluteUrl(logoPath),
      email: legalEmail,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1027 McClardy Rd',
        addressLocality: 'Clarksville',
        addressRegion: 'TN',
        postalCode: '37042',
        addressCountry: 'US',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'Legal',
          email: legalEmail,
          availableLanguage: ['English'],
        },
      ],
      brand: [
        {
          '@type': 'Brand',
          name: 'WaveNation FM',
        },
        {
          '@type': 'Brand',
          name: 'WaveNation One',
        },
        {
          '@type': 'Brand',
          name: 'WaveNation News',
        },
        {
          '@type': 'Brand',
          name: 'WaveNation Creator Hub',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteBaseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'About',
          item: toAbsoluteUrl('/about'),
        },
      ],
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export default function AboutPage() {
  return (
    <main
      className={styles.page}
      data-analytics-page="about"
      data-analytics-page-title="About WaveNation"
    >
      <JsonLd />

      <section
        className={styles.hero}
        data-analytics-section="about_hero"
        aria-labelledby="about-page-title"
      >
        <div className={styles.orbOne} aria-hidden="true" />
        <div className={styles.orbTwo} aria-hidden="true" />

        <p className={styles.eyebrow}>About WaveNation</p>

        <h1 id="about-page-title">
          Where culture lives, creators thrive, and the vibe amplifies.
        </h1>

        <p className={styles.lede}>
          WaveNation is a digital radio network and cultural media platform built at the
          intersection of music, storytelling, live streaming, creator power, and community
          connection. We are rooted in Southern Black creativity while reaching listeners,
          viewers, and creators across every screen.
        </p>

        <div className={styles.actions}>
          <Link
            href="/listen-live"
            className={styles.primaryAction}
            data-analytics-event="about_hero_listen_live_click"
            data-analytics-label="Listen Live"
          >
            Listen Live
          </Link>

          <Link
            href="/watch-live"
            className={styles.secondaryAction}
            data-analytics-event="about_hero_watch_click"
            data-analytics-label="Watch WaveNation One"
          >
            Watch WaveNation One
          </Link>
        </div>
      </section>

      <section
        className={styles.missionGrid}
        aria-label="Mission and vision"
        data-analytics-section="about_mission_vision"
      >
        <article data-analytics-card="about_mission">
          <span>Mission</span>
          <h2>Amplify unheard voices.</h2>
          <p>
            Our mission is to create a living digital home for multicultural stories, where
            radio, television, on-demand streaming, journalism, and creator-led media move
            culture forward.
          </p>
        </article>

        <article data-analytics-card="about_vision">
          <span>Vision</span>
          <h2>Build the next great culture network.</h2>
          <p>
            Our vision is to become a respected urban media network blending technology,
            creativity, and community across audio, video, editorial, live events, and creator
            ecosystems.
          </p>
        </article>
      </section>

      <section
        className={styles.stats}
        aria-label="WaveNation highlights"
        data-analytics-section="about_stats"
      >
        {stats.map((item) => (
          <article key={item.value} data-analytics-card="about_stat">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section
        className={styles.sectionHeader}
        data-analytics-section="about_ecosystem_intro"
      >
        <p className={styles.eyebrow}>The Ecosystem</p>
        <h2>One brand. Multiple ways to tap in.</h2>
        <p>
          WaveNation is more than a stream. It is a connected platform for live audio, video,
          news, playlists, podcasts, creator stories, and cultural experiences.
        </p>
      </section>

      <section
        className={styles.pillarGrid}
        aria-label="WaveNation platforms"
        data-analytics-section="about_platforms"
      >
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className={styles.pillarCard}
            data-analytics-card="about_platform_pillar"
            data-analytics-label={pillar.title}
          >
            <div className={styles.cardSignal} aria-hidden="true" />

            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>

            <Link
              href={pillar.href}
              data-analytics-event="about_platform_pillar_click"
              data-analytics-label={pillar.title}
            >
              {pillar.label}
            </Link>
          </article>
        ))}
      </section>

      <section
        className={styles.valuesSection}
        data-analytics-section="about_values"
      >
        <div>
          <p className={styles.eyebrow}>Our Values</p>
          <h2>Built with rhythm, responsibility, and excellence.</h2>
          <p>
            WaveNation’s voice is bold, electric, informed, and community-rooted. We tell
            stories with respect, move with innovation, and build tools that give creators more
            room to own their voice.
          </p>
        </div>

        <ul aria-label="WaveNation values">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </section>

      <section
        className={styles.companyPanel}
        aria-label="Company information"
        data-analytics-section="about_company_information"
      >
        <div>
          <p className={styles.eyebrow}>Company Information</p>
          <h2>Operated by MetroWave Media Group.</h2>
          <p>
            WaveNation Media is the public-facing cultural media brand operated by MetroWave
            Media Group. For legal, rights, privacy, licensing, accessibility, or platform policy
            questions, use the official contact below.
          </p>
        </div>

        <dl>
          {companyInfo.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>
                {'href' in item && item.href ? (
                  <a
                    href={item.href}
                    data-analytics-event="about_company_contact_click"
                    data-analytics-label={item.label}
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className={styles.cta}
        data-analytics-section="about_final_cta"
      >
        <p className={styles.eyebrow}>Amplify Your Vibe</p>
        <h2>Step into the wave.</h2>
        <p>
          Listen to WaveNation FM, explore culture stories, watch live and on-demand video, and
          follow the creators shaping what comes next.
        </p>

        <div className={styles.actions}>
          <Link
            href="/news"
            className={styles.primaryAction}
            data-analytics-event="about_final_news_click"
            data-analytics-label="Explore News"
          >
            Explore News
          </Link>

          <Link
            href="/authors"
            className={styles.secondaryAction}
            data-analytics-event="about_final_authors_click"
            data-analytics-label="Meet Contributors"
          >
            Meet Contributors
          </Link>
        </div>
      </section>
    </main>
  )
}