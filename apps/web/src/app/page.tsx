import type { Metadata } from 'next'
import Link from 'next/link'
import { HomepageNewsletterCTA } from './components/HomepageNewsletterCTA'
import {
  formatDate,
  getHomepageData,
  type HomepageAccent,
  type HomepageArticle,
  type HomepageCategorySection,
  type HomepageEvent,
} from '@/lib/wavenation-homepage'
import styles from './page.module.css'

export const revalidate = 300

const rawSiteBaseUrl =
  process.env.NEXT_PUBLIC_WAVENATION_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wavenation.online'

const siteBaseUrl = normalizeSiteBaseUrl(rawSiteBaseUrl)
const siteName = 'WaveNation'
const pageTitle = 'WaveNation Media | Music, Film & TV, Culture, Sports, Business & Tech'
const pageDescription =
  'WaveNation is a news-first cultural media platform covering music, artist spotlights, Film & TV, culture, sports, business, technology, events, and live streaming.'
const socialImagePath = '/images/wavenation-social-card.jpg'

const featuredCategoryLinks = [
  { label: 'Music', href: '/news/music' },
  { label: 'Artist Spotlights', href: '/news/music/artist-spotlights' },
  { label: 'Film & TV', href: '/news/film-tv' },
  { label: 'Culture', href: '/news/culture' },
  { label: 'Sports', href: '/news/sports' },
  { label: 'Business & Tech', href: '/news/business-tech' },
] as const

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: pageTitle,
  description: pageDescription,
  applicationName: 'WaveNation',
  authors: [{ name: 'WaveNation Media' }],
  creator: 'WaveNation Media',
  publisher: 'WaveNation Media',
  category: 'News and Entertainment',
  keywords: [
    'WaveNation News',
    'music news',
    'artist spotlights',
    'Film and TV news',
    'Black culture news',
    'sports culture',
    'business technology',
    'WaveNation events',
    'WaveNation FM',
    'WaveNation One',
    'urban culture news',
    'Southern Black culture',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'WaveNation News | Amplify Your Vibe',
    description:
      'Latest WaveNation coverage across music, Film & TV, culture, sports, business, technology, events, and live streaming.',
    url: '/',
    siteName,
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
    title: 'WaveNation News | Amplify Your Vibe',
    description:
      'Music, Film & TV, culture, sports, business, tech, events, and live streaming from WaveNation.',
    images: [socialImagePath],
    creator: '@wavenation',
    site: '@wavenation',
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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function accentClass(accent: HomepageAccent | undefined) {
  if (accent === 'blue') return styles.accentBlue
  if (accent === 'magenta') return styles.accentMagenta
  if (accent === 'green') return styles.accentGreen
  if (accent === 'teal') return styles.accentTeal
  return styles.accentNews
}

function ArticleImage({
  article,
  priority = false,
}: {
  article: HomepageArticle
  priority?: boolean
}) {
  if (!article.imageUrl) {
    return (
      <div className={styles.imageFallback} aria-hidden="true">
        <span>WN</span>
      </div>
    )
  }

  return (
    <img
      src={article.imageUrl}
      alt={article.imageAlt || article.title}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

function StoryMeta({ article }: { article: HomepageArticle }) {
  const publishDate = article.publishDate || ''
  const date = publishDate ? formatDate(publishDate) : ''

  if (!date && !article.readingTime && !article.authorName) {
    return null
  }

  return (
    <p className={styles.storyMeta}>
      {date ? <time dateTime={publishDate}>{date}</time> : null}
      {date && article.readingTime ? <span aria-hidden="true">•</span> : null}
      {article.readingTime ? <span>{article.readingTime} min read</span> : null}
      {article.authorName ? (
        <>
          {date || article.readingTime ? <span aria-hidden="true">•</span> : null}
          <span>{article.authorName}</span>
        </>
      ) : null}
    </p>
  )
}

function LeadStory({ article }: { article: HomepageArticle }) {
  return (
    <article
      className={cx(styles.leadStory, accentClass(article.accent))}
      data-analytics-card="homepage_lead_story"
      data-analytics-content-id={String(article.id)}
      data-analytics-content-title={article.title}
      data-analytics-content-category={article.categoryName}
    >
      <Link
        href={article.href}
        className={styles.fullCardLink}
        aria-label={`Read ${article.title}`}
        data-analytics-event="homepage_lead_story_click"
        data-analytics-label={article.title}
      >
        <span className={styles.srOnly}>Read story</span>
      </Link>

      <div className={styles.leadMedia}>
        <ArticleImage article={article} priority />
      </div>

      <div className={styles.leadCopy}>
        <div className={styles.badgeRow}>
          <span>{article.isBreaking ? 'Breaking' : article.categoryName}</span>
          {article.isFeatured ? <span>Featured</span> : null}
        </div>

        <h2>{article.title}</h2>

        {article.subtitle || article.excerpt ? <p>{article.subtitle || article.excerpt}</p> : null}

        <StoryMeta article={article} />
      </div>
    </article>
  )
}

function TopStoryCard({ article }: { article: HomepageArticle }) {
  return (
    <article
      className={cx(styles.topStory, accentClass(article.accent))}
      data-analytics-card="homepage_top_story"
      data-analytics-content-id={String(article.id)}
      data-analytics-content-title={article.title}
      data-analytics-content-category={article.categoryName}
    >
      <Link
        href={article.href}
        className={styles.fullCardLink}
        aria-label={`Read ${article.title}`}
        data-analytics-event="homepage_top_story_click"
        data-analytics-label={article.title}
      >
        <span className={styles.srOnly}>Read story</span>
      </Link>

      <div className={styles.topStoryImage}>
        <ArticleImage article={article} />
      </div>

      <div className={styles.topStoryCopy}>
        <p className={styles.cardEyebrow}>{article.categoryName}</p>
        <h3>{article.title}</h3>
        <StoryMeta article={article} />
      </div>
    </article>
  )
}

function LatestNewsList({ articles }: { articles: HomepageArticle[] }) {
  if (articles.length === 0) return null

  return (
    <section
      className={styles.latestPanel}
      aria-labelledby="latest-news-heading"
      data-analytics-section="homepage_latest_news"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Latest Updates</p>
          <h2 id="latest-news-heading">Latest News</h2>
        </div>

        <Link
          href="/news"
          data-analytics-event="homepage_latest_news_view_all_click"
          data-analytics-label="View all latest news"
        >
          View all
        </Link>
      </div>

      <div className={styles.latestList}>
        {articles.map((article) => (
          <article
            key={article.id}
            className={styles.latestItem}
            data-analytics-card="homepage_latest_news_item"
            data-analytics-content-id={String(article.id)}
            data-analytics-content-title={article.title}
            data-analytics-content-category={article.categoryName}
          >
            <Link
              href={article.href}
              className={styles.latestImage}
              aria-label={`Read ${article.title}`}
              data-analytics-event="homepage_latest_news_image_click"
              data-analytics-label={article.title}
            >
              <ArticleImage article={article} />
            </Link>

            <div>
              <p className={styles.cardEyebrow}>{article.categoryName}</p>
              <h3>
                <Link
                  href={article.href}
                  data-analytics-event="homepage_latest_news_headline_click"
                  data-analytics-label={article.title}
                >
                  {article.title}
                </Link>
              </h3>
              <StoryMeta article={article} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CategorySection({ section }: { section: HomepageCategorySection }) {
  const [feature, ...items] = section.articles

  return (
    <section
      className={styles.categorySection}
      aria-labelledby={`section-${section.slug}`}
      data-analytics-section={`homepage_category_${section.slug}`}
    >
      <div className={styles.sectionHeaderCompact}>
        <div>
          <p className={styles.sectionEyebrow}>WaveNation Desk</p>
          <h2 id={`section-${section.slug}`}>{section.title}</h2>
        </div>

        <Link
          href={section.href}
          data-analytics-event="homepage_category_more_click"
          data-analytics-label={section.title}
        >
          More
        </Link>
      </div>

      {feature ? (
        <div className={styles.categoryGrid}>
          <article
            className={cx(styles.categoryFeature, accentClass(section.accent))}
            data-analytics-card="homepage_category_feature"
            data-analytics-content-id={String(feature.id)}
            data-analytics-content-title={feature.title}
            data-analytics-content-category={feature.categoryName}
          >
            <Link
              href={feature.href}
              className={styles.fullCardLink}
              aria-label={`Read ${feature.title}`}
              data-analytics-event="homepage_category_feature_click"
              data-analytics-label={feature.title}
            >
              <span className={styles.srOnly}>Read story</span>
            </Link>

            <div className={styles.categoryFeatureImage}>
              <ArticleImage article={feature} />
            </div>

            <div className={styles.categoryFeatureCopy}>
              <p className={styles.cardEyebrow}>{feature.categoryName}</p>
              <h3>{feature.title}</h3>
              <StoryMeta article={feature} />
            </div>
          </article>

          <div className={styles.categoryList}>
            {items.slice(0, 4).map((article) => (
              <article
                key={article.id}
                className={styles.categoryListItem}
                data-analytics-card="homepage_category_list_item"
                data-analytics-content-id={String(article.id)}
                data-analytics-content-title={article.title}
                data-analytics-content-category={article.categoryName}
              >
                <h3>
                  <Link
                    href={article.href}
                    data-analytics-event="homepage_category_headline_click"
                    data-analytics-label={article.title}
                  >
                    {article.title}
                  </Link>
                </h3>
                <StoryMeta article={article} />
              </article>
            ))}
          </div>
        </div>
      ) : (
        <EmptyPanel label={`${section.title} stories will appear here when published.`} />
      )}
    </section>
  )
}

function EventCard({ event }: { event: HomepageEvent }) {
  const watchHref = event.watchHref || event.href

  return (
    <article
      className={cx(styles.eventCard, accentClass(event.accent))}
      data-analytics-card="homepage_event"
      data-analytics-content-id={String(event.id)}
      data-analytics-content-title={event.title}
    >
      <div className={styles.eventImage}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.imageAlt || event.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span aria-hidden="true">WN</span>
        )}
      </div>

      <div className={styles.eventCopy}>
        <div className={styles.badgeRow}>
          {event.dateLabel ? <span>{event.dateLabel}</span> : null}
          {event.statusLabel ? <span>{event.statusLabel}</span> : null}
        </div>

        <h3>{event.title}</h3>

        {event.eventType ? <p>{event.eventType}</p> : null}

        <div className={styles.eventActions}>
          <Link
            href={event.href}
            data-analytics-event="homepage_event_details_click"
            data-analytics-label={event.title}
          >
            Details
          </Link>

          <Link
            href={watchHref}
            data-analytics-event="homepage_event_watch_click"
            data-analytics-label={event.title}
          >
            Watch
          </Link>
        </div>
      </div>
    </article>
  )
}

function TrendingRail({ articles }: { articles: HomepageArticle[] }) {
  return (
    <aside className={styles.sideRail} aria-label="Homepage rail">
      <section className={styles.railPanel} data-analytics-section="homepage_trending_rail">
        <div className={styles.panelHeaderSmall}>
          <p className={styles.sectionEyebrow}>Now Trending</p>
          <h2>Headlines</h2>
        </div>

        <ol className={styles.trendingList}>
          {articles.length > 0 ? (
            articles.map((article) => (
              <li
                key={article.id}
                data-analytics-card="homepage_trending_item"
                data-analytics-content-id={String(article.id)}
                data-analytics-content-title={article.title}
                data-analytics-content-category={article.categoryName}
              >
                <span>{article.categoryName}</span>
                <Link
                  href={article.href}
                  data-analytics-event="homepage_trending_click"
                  data-analytics-label={article.title}
                >
                  {article.title}
                </Link>
              </li>
            ))
          ) : (
            <li>
              <span>WaveNation</span>
              <Link href="/news">Latest stories will appear here.</Link>
            </li>
          )}
        </ol>
      </section>

      <section className={styles.listenPanel} data-analytics-section="homepage_listen_watch_rail">
        <p className={styles.sectionEyebrow}>Live</p>
        <h2>Listen + Watch</h2>

        <div className={styles.listenActions}>
          <Link
            href="/listen-live"
            data-analytics-event="homepage_rail_listen_live_click"
            data-analytics-label="Listen Live"
          >
            Listen Live
          </Link>

          <Link
            href="/watch-live"
            data-analytics-event="homepage_rail_watch_live_click"
            data-analytics-label="Watch Live"
          >
            Watch Live
          </Link>

          <Link
            href="/schedule"
            data-analytics-event="homepage_rail_schedule_click"
            data-analytics-label="Schedule"
          >
            Schedule
          </Link>
        </div>
      </section>
    </aside>
  )
}

function EmptyPanel({ label }: { label: string }) {
  return <p className={styles.emptyPanel}>{label}</p>
}

function HomePageJsonLd({
  articles,
  leadArticle,
}: {
  articles: HomepageArticle[]
  leadArticle?: HomepageArticle | null
}) {
  const itemList = articles.slice(0, 10).map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: toAbsoluteUrl(article.href),
    name: article.title,
    item: {
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.subtitle || article.excerpt || pageDescription,
      url: toAbsoluteUrl(article.href),
      image: article.imageUrl ? [toAbsoluteUrl(article.imageUrl)] : [toAbsoluteUrl(socialImagePath)],
      datePublished: article.publishDate || undefined,
      author: article.authorName
        ? {
            '@type': 'Person',
            name: article.authorName,
          }
        : {
            '@type': 'Organization',
            name: 'WaveNation Editorial',
          },
      publisher: {
        '@type': 'Organization',
        name: 'WaveNation Media',
        logo: {
          '@type': 'ImageObject',
          url: toAbsoluteUrl('/images/wavenation-logo.png'),
        },
      },
    },
  }))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteBaseUrl,
      description: pageDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteBaseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: 'WaveNation Media',
      url: siteBaseUrl,
      slogan: 'Amplify Your Vibe',
      logo: toAbsoluteUrl('/images/wavenation-logo.png'),
      sameAs: [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle,
      description: pageDescription,
      url: siteBaseUrl,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: leadArticle?.imageUrl ? toAbsoluteUrl(leadArticle.imageUrl) : toAbsoluteUrl(socialImagePath),
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: itemList,
      },
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function HomePage() {
  const data = await getHomepageData()
  const heroFallback = data.leadArticle || data.latestArticles[0] || null

  return (
    <main
      className={styles.page}
      data-analytics-page="homepage"
      data-analytics-page-title="WaveNation Homepage"
    >
      <HomePageJsonLd articles={data.latestArticles} leadArticle={heroFallback} />

      <section
        className={styles.hero}
        aria-labelledby="homepage-hero-title"
        data-analytics-section="homepage_hero"
      >
        <div className={styles.container}>
          <div className={styles.heroIntro}>
            <div>
              <p className={styles.eyebrow}>Amplify Your Vibe</p>
              <h1 id="homepage-hero-title">News, culture, and the next wave.</h1>
            </div>
          </div>

          {heroFallback ? (
            <div className={styles.heroGrid}>
              <LeadStory article={heroFallback} />

              <div className={styles.topStoryStack}>
                {data.topStories.length > 0 ? (
                  data.topStories.map((article) => (
                    <TopStoryCard key={article.id} article={article} />
                  ))
                ) : (
                  <EmptyPanel label="More top stories will appear as new articles are published." />
                )}
              </div>
            </div>
          ) : (
            <EmptyPanel label="Published homepage stories will appear here after the CMS has articles." />
          )}

          <LatestNewsList articles={data.latestList} />
        </div>
      </section>

      <section className={styles.newsletterWrap} data-analytics-section="homepage_newsletter_cta">
        <div className={styles.container}>
          <HomepageNewsletterCTA />
        </div>
      </section>

      <section className={styles.categoryNav} aria-label="Featured categories">
        <div className={styles.container}>
          {featuredCategoryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-analytics-event="homepage_category_nav_click"
              data-analytics-label={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.contentArea} data-analytics-section="homepage_content_area">
        <div className={cx(styles.container, styles.contentGrid)}>
          <div className={styles.mainStream}>
            {data.categorySections.map((section) => (
              <CategorySection key={section.slug} section={section} />
            ))}
          </div>

          <TrendingRail articles={data.trendingArticles} />
        </div>
      </section>

      <section
        className={styles.eventsSection}
        aria-labelledby="events-heading"
        data-analytics-section="homepage_events"
      >
        <div className={styles.container}>
          <div className={styles.sectionHeaderCompact}>
            <div>
              <p className={styles.sectionEyebrow}>Events + Live Streams</p>
              <h2 id="events-heading">What’s happening on the wave.</h2>
            </div>

            <div className={styles.headerActions}>
              <Link
                href="/events"
                data-analytics-event="homepage_all_events_click"
                data-analytics-label="All Events"
              >
                All Events
              </Link>

              <Link
                href="/watch/events"
                data-analytics-event="homepage_watch_events_click"
                data-analytics-label="Watch Events"
              >
                Watch Events
              </Link>
            </div>
          </div>

          {data.events.length > 0 ? (
            <div className={styles.eventsGrid}>
              {data.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyPanel label="Events and watch events will appear here when they are published in the CMS." />
          )}
        </div>
      </section>

      <section
        className={styles.finalCtas}
        aria-label="WaveNation calls to action"
        data-analytics-section="homepage_final_ctas"
      >
        <div className={styles.container}>
          <Link
            href="/creator-hub"
            className={styles.finalCard}
            data-analytics-event="homepage_final_cta_click"
            data-analytics-label="Creator Hub"
          >
            <span>Creator Hub</span>
            <strong>Build with WaveNation.</strong>
          </Link>

          <Link
            href="/advertise"
            className={styles.finalCard}
            data-analytics-event="homepage_final_cta_click"
            data-analytics-label="Advertise"
          >
            <span>Advertise</span>
            <strong>Reach culture-first audiences.</strong>
          </Link>

          <Link
            href="/contact"
            className={styles.finalCard}
            data-analytics-event="homepage_final_cta_click"
            data-analytics-label="Contact"
          >
            <span>Contact</span>
            <strong>Send news tips, ideas, and requests.</strong>
          </Link>
        </div>
      </section>
    </main>
  )
}