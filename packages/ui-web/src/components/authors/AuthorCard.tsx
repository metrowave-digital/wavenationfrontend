import Link from 'next/link'
import type { AuthorProfileData } from './types'
import { AuthorAvatar } from './AuthorAvatar'
import styles from './AuthorCard.module.css'

export type AuthorCardProps = {
  author: AuthorProfileData
}

function roleLabel(role?: string) {
  if (!role) return 'Contributor'
  return role.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

export function AuthorCard({ author }: AuthorCardProps) {
  const href = author.href ?? `/authors/${author.slug}`
  const beats = author.beats ?? []
  const socials = author.socialLinks ?? []

  return (
    <article className={styles.card}>
      <div className={styles.glow} aria-hidden="true" />

      <Link href={href} className={styles.avatarLink} aria-label={`View ${author.fullName} profile`}>
        <AuthorAvatar
          name={author.fullName}
          initials={author.initials}
          src={author.avatarUrl}
          alt={author.avatarAlt}
          size="lg"
        />
      </Link>

      <div className={styles.content}>
        <div className={styles.metaRow}>
          <span>{roleLabel(author.role)}</span>
        </div>

        <h2>
          <Link href={href}>{author.fullName}</Link>
        </h2>

        <p>{author.bioText}</p>

        {beats.length ? (
          <div className={styles.beats} aria-label={`${author.fullName} coverage beats`}>
            {beats.slice(0, 5).map((beat) => (
              <span
                key={beat.slug ?? beat.name}
                style={beat.themeColor ? { '--beat-color': beat.themeColor } as React.CSSProperties : undefined}
              >
                {beat.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className={styles.footer}>
          <Link href={href} className={styles.profileLink}>
            View profile
          </Link>

          {socials.length ? (
            <div className={styles.socials} aria-label={`${author.fullName} social links`}>
              {socials.slice(0, 3).map((social) => (
                <a key={`${social.platform}-${social.url}`} href={social.url} target="_blank" rel="noreferrer">
                  {social.platform}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
