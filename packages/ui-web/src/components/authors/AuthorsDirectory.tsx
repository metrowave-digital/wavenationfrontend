import Link from 'next/link'
import type { AuthorBeat, AuthorProfileData, AuthorsPagination } from './types'
import { AuthorCard } from './AuthorCard'
import styles from './AuthorsDirectory.module.css'

export type AuthorsDirectoryProps = {
  authors: AuthorProfileData[]
  beats?: AuthorBeat[]
  activeBeatSlug?: string
  pagination?: AuthorsPagination
  baseHref?: string
}

function buildHref(baseHref: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  const search = searchParams.toString()
  return `${baseHref}${search ? `?${search}` : ''}`
}

export function AuthorsDirectory({
  authors,
  beats = [],
  activeBeatSlug,
  pagination,
  baseHref = '/authors',
}: AuthorsDirectoryProps) {
  const currentPage = pagination?.page ?? 1

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>WaveNation voices</p>
          <h1>Authors & Contributors</h1>
          <p>
            Meet the editors, staff writers, and contributors shaping WaveNation’s coverage across
            music, film, sports, culture, business, technology, lifestyle, and community stories.
          </p>
        </div>
      </section>

      {beats.length ? (
        <nav className={styles.filters} aria-label="Filter authors by beat">
          <Link href={baseHref} className={!activeBeatSlug ? styles.activeFilter : undefined}>
            All
          </Link>
          {beats.map((beat) => (
            <Link
              key={beat.slug ?? beat.name}
              href={buildHref(baseHref, { beat: beat.slug, page: 1 })}
              className={activeBeatSlug === beat.slug ? styles.activeFilter : undefined}
              style={beat.themeColor ? { '--beat-color': beat.themeColor } as React.CSSProperties : undefined}
            >
              {beat.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {authors.length ? (
        <section className={styles.grid} aria-label="Active WaveNation authors">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </section>
      ) : (
        <section className={styles.empty}>
          <p className={styles.eyebrow}>No authors found</p>
          <h2>No active voices match this filter yet.</h2>
          <p>Clear the beat filter or add active authors in Payload CMS.</p>
          <Link href={baseHref}>View all authors</Link>
        </section>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav className={styles.pagination} aria-label="Authors pagination">
          <Link
            href={buildHref(baseHref, {
              beat: activeBeatSlug,
              page: pagination.hasPrevPage ? currentPage - 1 : 1,
            })}
            aria-disabled={!pagination.hasPrevPage}
            className={!pagination.hasPrevPage ? styles.disabled : undefined}
          >
            Previous
          </Link>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Link
            href={buildHref(baseHref, {
              beat: activeBeatSlug,
              page: pagination.hasNextPage ? currentPage + 1 : currentPage,
            })}
            aria-disabled={!pagination.hasNextPage}
            className={!pagination.hasNextPage ? styles.disabled : undefined}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </div>
  )
}
