import Image from 'next/image'
import Link from 'next/link'
import type { NewsArticle } from '../../../../../apps/web/src/lib/news/news-types'
import {
  formatNewsDate,
  getBestImageUrl,
  getPrimaryCategory,
  getPrimarySubcategory,
} from '../../../../../apps/web/src/lib/news/news-types'
import { ArticleRenderer } from './ArticleRenderer'
import { NewsCard } from './NewsCard'
import styles from './News.module.css'

type ArticleShellProps = {
  article: NewsArticle
  relatedArticles?: NewsArticle[]
}

export function ArticleShell({ article, relatedArticles = [] }: ArticleShellProps) {
  const category = getPrimaryCategory(article)
  const subcategory = getPrimarySubcategory(article)
  const imageUrl = getBestImageUrl(article.hero?.image, 'hero')
  const publishDate = article.publishDate || article.publishedAt || article.createdAt

  return (
    <article className={styles.articleShell}>
      <header className={styles.articleHeader} style={{ '--accent': category?.themeColor || '#00b3ff' } as React.CSSProperties}>
        <div className={styles.articleMeta}>
          {category ? <Link href={`/news/${category.slug}`}>{category.name}</Link> : null}
          {subcategory && category ? <Link href={`/news/${category.slug}/${subcategory.slug}`}>{subcategory.name}</Link> : null}
          {publishDate ? <time>{formatNewsDate(publishDate)}</time> : null}
          {article.readingTime ? <span>{article.readingTime} min read</span> : null}
        </div>

        <h1>{article.title}</h1>

        {article.subtitle ? <p className={styles.articleSubtitle}>{article.subtitle}</p> : null}

        {article.author?.slug ? (
          <Link href={`/news/author/${article.author.slug}`} className={styles.articleAuthor}>
            By {article.author.fullName || 'WaveNation Editorial'}
          </Link>
        ) : null}
      </header>

      {imageUrl ? (
        <figure className={styles.articleHeroImage}>
          <Image src={imageUrl} alt={article.hero?.image?.alt || article.title} width={1400} height={788} priority />
          {article.hero?.caption || article.hero?.credit ? (
            <figcaption>
              {article.hero.caption ? <span>{article.hero.caption}</span> : null}
              {article.hero.credit ? <small>{article.hero.credit}</small> : null}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <main className={styles.articleBody}>
        <ArticleRenderer blocks={article.contentBlocks} />

        <footer className={styles.articleFooter}>
          {article.topics?.length ? (
            <div>
              <h2>Topics</h2>
              <div className={styles.taxonomyList}>
                {article.topics.map((topic) => (
                  <Link key={topic.id} href={`/news/topic/${topic.slug}`}>
                    {topic.shortLabel || topic.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {article.tags?.length ? (
            <div>
              <h2>Tags</h2>
              <div className={styles.taxonomyList}>
                {article.tags.map((tag) => (
                  <Link key={tag.id} href={`/news/tag/${tag.slug}`}>
                    #{tag.label.trim()}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </footer>
      </main>

      {relatedArticles.length ? (
        <aside className={styles.relatedSection}>
          <p className={styles.eyebrow}>Keep Reading</p>
          <h2>More from the wave</h2>
          <div className={styles.grid}>
            {relatedArticles.map((related) => (
              <NewsCard key={related.id} article={related} />
            ))}
          </div>
        </aside>
      ) : null}
    </article>
  )
}