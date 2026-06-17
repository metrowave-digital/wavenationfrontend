import Image from 'next/image'
import Link from 'next/link'
import type { AuthorArticleSummary } from './types'
import styles from './AuthorArticleCard.module.css'

export type AuthorArticleCardProps = {
  article: AuthorArticleSummary
}

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function AuthorArticleCard({ article }: AuthorArticleCardProps) {
  const date = formatDate(article.publishedAt)

  return (
    <article className={styles.card}>
      <Link href={article.href} className={styles.media} aria-label={article.title}>
        {article.imageUrl ? (
          <Image src={article.imageUrl} alt={article.imageAlt ?? article.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className={styles.fallback} aria-hidden="true">
            <span />
          </div>
        )}
        {article.badge ? <strong className={styles.badge}>{article.badge}</strong> : null}
      </Link>

      <div className={styles.content}>
        <div className={styles.meta}>
          {article.category ? (
            <span style={article.categoryColor ? { '--category-color': article.categoryColor } as React.CSSProperties : undefined}>
              {article.category}
            </span>
          ) : null}
          {date ? <span>{date}</span> : null}
          {article.readingTime ? <span>{article.readingTime} min read</span> : null}
        </div>

        <h3>
          <Link href={article.href}>{article.title}</Link>
        </h3>

        {article.excerpt ? <p>{article.excerpt}</p> : null}
      </div>
    </article>
  )
}
