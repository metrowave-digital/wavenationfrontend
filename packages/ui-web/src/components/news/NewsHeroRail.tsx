import Link from 'next/link'
import type { NewsArticle } from '../../../../../apps/web/src/lib/news/news-types'
import { getArticleHref } from '../../../../../apps/web/src/lib/news/news-types'
import { NewsCard } from './NewsCard'
import styles from './News.module.css'

type NewsHeroRailProps = {
  articles: NewsArticle[]
}

export function NewsHeroRail({ articles }: NewsHeroRailProps) {
  const sliderArticles = articles.slice(0, 5)
  const sideArticles = articles.slice(1, 3)

  if (!articles.length) {
    return (
      <section className={styles.heroEmpty}>
        <p className={styles.eyebrow}>WaveNation News</p>
        <h1>Culture moves here.</h1>
        <p>Publish your first story in the CMS and it will appear here automatically.</p>
        <div className={styles.emptyActions}>
          <Link href="/listen">Listen Live</Link>
          <Link href="/watch">Watch</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.heroGrid} aria-label="Featured WaveNation stories">
      <div className={styles.heroSlider}>
        {sliderArticles.map((article, index) => (
          <div key={article.id} className={styles.heroSlide}>
            <NewsCard article={article} variant="feature" priority={index === 0} />
          </div>
        ))}
      </div>

      <aside className={styles.heroStack} aria-label="Top stories">
        <div className={styles.stackHeader}>
          <span>Top Stories</span>
          <Link href="/news/search">Search all</Link>
        </div>

        {sideArticles.map((article) => (
          <NewsCard key={article.id} article={article} variant="compact" />
        ))}
      </aside>
    </section>
  )
}