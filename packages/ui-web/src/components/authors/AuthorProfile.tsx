import Link from 'next/link'
import type { AuthorArticleSummary, AuthorProfileData, AuthorsPagination } from './types'
import { AuthorAvatar } from './AuthorAvatar'
import { AuthorArticleCard } from './AuthorArticleCard'
import styles from './AuthorProfile.module.css'

export type AuthorProfileProps = {
  author: AuthorProfileData
  articles?: AuthorArticleSummary[]
  articlesPagination?: AuthorsPagination
  backHref?: string
}

function roleLabel(role?: string) {
  if (!role) return 'Contributor'
  return role.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

export function AuthorProfile({
  author,
  articles = [],
  articlesPagination,
  backHref = '/authors',
}: AuthorProfileProps) {
  const beats = author.beats ?? []
  const socials = author.socialLinks ?? []

  return (
    <div className={styles.shell}>
      <Link href={backHref} className={styles.backLink}>
        ← Back to authors
      </Link>

      <section className={styles.hero}>
        <div className={styles.avatarWrap}>
          <AuthorAvatar
            name={author.fullName}
            initials={author.initials}
            src={author.avatarUrl}
            alt={author.avatarAlt}
            size="xl"
          />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>WaveNation {roleLabel(author.role)}</p>
          <h1>{author.fullName}</h1>
          <p>{author.bioText}</p>

          <div className={styles.metaRow}>
            {author.email ? <a href={`mailto:${author.email}`}>{author.email}</a> : null}
            <span>Status: {author.status ?? 'active'}</span>
          </div>

          {socials.length ? (
            <div className={styles.socials} aria-label={`${author.fullName} social links`}>
              {socials.map((social) => (
                <a key={`${social.platform}-${social.url}`} href={social.url} target="_blank" rel="noreferrer">
                  {social.platform}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {beats.length ? (
        <section className={styles.beats} aria-labelledby="author-beats-heading">
          <div>
            <p className={styles.eyebrow}>Coverage beats</p>
            <h2 id="author-beats-heading">What {author.fullName.split(' ')[0]} covers</h2>
          </div>

          <div className={styles.beatGrid}>
            {beats.map((beat) => (
              <article
                key={beat.slug ?? beat.name}
                style={beat.themeColor ? { '--beat-color': beat.themeColor } as React.CSSProperties : undefined}
              >
                <span />
                <h3>{beat.name}</h3>
                {beat.description ? <p>{beat.description}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.articles} aria-labelledby="author-articles-heading">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Latest stories</p>
            <h2 id="author-articles-heading">Published by {author.fullName}</h2>
          </div>

          {articlesPagination ? (
            <span>{articlesPagination.totalDocs} published {articlesPagination.totalDocs === 1 ? 'story' : 'stories'}</span>
          ) : null}
        </div>

        {articles.length ? (
          <div className={styles.articleGrid}>
            {articles.map((article) => (
              <AuthorArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyArticles}>
            <h3>No published stories yet.</h3>
            <p>Stories assigned to this author will appear here once they are published in the CMS.</p>
          </div>
        )}
      </section>
    </div>
  )
}
