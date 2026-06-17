import Image from 'next/image'
import styles from './AuthorAvatar.module.css'

export type AuthorAvatarProps = {
  src?: string
  alt?: string
  initials?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function AuthorAvatar({
  src,
  alt,
  initials,
  name,
  size = 'md',
  className,
}: AuthorAvatarProps) {
  const fallbackInitials =
    initials ||
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <div className={cx(styles.avatar, styles[size], className)} aria-label={`${name} avatar`}>
      {src ? (
        <Image src={src} alt={alt || `${name} profile image`} fill sizes="(max-width: 768px) 35vw, 220px" />
      ) : (
        <div className={styles.silhouette} aria-hidden="true">
          <span className={styles.head} />
          <span className={styles.body} />
          <strong>{fallbackInitials}</strong>
        </div>
      )}
    </div>
  )
}
