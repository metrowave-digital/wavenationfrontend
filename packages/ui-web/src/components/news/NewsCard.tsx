import Image from 'next/image'
import Link from 'next/link'
import type { NewsArticle } from '../../../../../apps/web/src/lib/news/news-types'
import {
  formatNewsDate,
  getArticleHref,
  getBestImageUrl,
  getPrimaryCategory,
} from '../../../../../apps/web/src/lib/news/news-types'
import styles from './News.module.css'

type NewsCardProps = {
  article: NewsArticle
  variant?: 'standard' | 'compact' | 'feature'
  priority?: boolean
}

export function NewsCard({ article, variant = 'standard', priority = false }: NewsCardProps) {
  const category = getPrimaryCategory(article)
  const imageUrl = getBestImageUrl(article.hero?.image, variant === 'feature' ? 'hero' : 'card')
  const publishDate = article.publishDate || article.publishedAt || article.createdAt

  return (
    <article className={`${styles.card} ${styles[`card_${variant}`]}`}>
      <Link href={getArticleHref(article)} className={styles.cardMedia} aria-label={article.title}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.hero?.image?.alt || article.title}
            fill
            sizes={variant === 'feature' ? '(min-width: 980px) 60vw, 100vw' : '(min-width: 980px) 33vw, 100vw'}
            priority={priority}
            className={styles.cardImage}
          />
        ) : (
          <span className={styles.imageFallback}>WN</span>
        )}
      </Link>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {category ? (
            <Link
              href={`/news/${category.slug}`}
              className={styles.pill}
              style={{ '--accent': category.themeColor || '#00b3ff' } as React.CSSProperties}
            >
              {category.name}
            </Link>
          ) : null}

          {article.isBreaking ? <span className={styles.breaking}>Breaking</span> : null}

          {publishDate ? <time>{formatNewsDate(publishDate)}</time> : null}

          {article.readingTime ? <span>{article.readingTime} min read</span> : null}
        </div>

        <h3 className={styles.cardTitle}>
          <Link href={getArticleHref(article)}>{article.title}</Link>
        </h3>

        {article.excerpt ? <p className={styles.cardExcerpt}>{article.excerpt}</p> : null}

        {article.author?.slug ? (
          <Link href={`/news/author/${article.author.slug}`} className={styles.byline}>
            By {article.author.fullName || 'WaveNation Editorial'}
          </Link>
        ) : null}
      </div>
    </article>
  )
}