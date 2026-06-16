import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import styles from './Cards.module.css'

export type CardAccent = 'blue' | 'magenta' | 'green' | 'teal' | 'news'

type AccentStyle = CSSProperties & {
  '--card-accent'?: string
}

export type ContentCardProps = {
  eyebrow?: string
  title: string
  excerpt?: string
  href?: string
  imageUrl?: string
  imageAlt?: string
  meta?: string
  badge?: string
  accent?: CardAccent
  className?: string
}

export type FeatureCardProps = ContentCardProps & {
  kicker?: string
  orientation?: 'vertical' | 'horizontal'
}

export type StatCardProps = {
  label: string
  value: string
  detail?: string
  accent?: CardAccent
  className?: string
}

export type BasicCardProps = {
  children: ReactNode
  href?: string
  accent?: CardAccent
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function getAccentStyle(accent: CardAccent = 'blue'): AccentStyle {
  const map: Record<CardAccent, string> = {
    blue: '#00b3ff',
    magenta: '#e92c63',
    green: '#39ff14',
    teal: '#00f3c9',
    news: '#ffffff',
  }

  return { '--card-accent': map[accent] }
}

function CardShell({ children, href, accent = 'blue', className }: BasicCardProps) {
  const shellClassName = cx(styles.card, className)

  if (href) {
    return (
      <Link href={href} className={shellClassName} style={getAccentStyle(accent)}>
        {children}
      </Link>
    )
  }

  return (
    <article className={shellClassName} style={getAccentStyle(accent)}>
      {children}
    </article>
  )
}

export function ContentCard({
  eyebrow,
  title,
  excerpt,
  href,
  imageUrl,
  imageAlt,
  meta,
  badge,
  accent = 'blue',
  className,
}: ContentCardProps) {
  return (
    <CardShell href={href} accent={accent} className={cx(styles.contentCard, className)}>
      {imageUrl ? (
        <div className={styles.imageWrap}>
          <img src={imageUrl} alt={imageAlt || ''} className={styles.image} />
          {badge ? <span className={styles.badge}>{badge}</span> : null}
        </div>
      ) : null}

      <div className={styles.body}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h3 className={styles.title}>{title}</h3>
        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
        {meta ? <p className={styles.meta}>{meta}</p> : null}
      </div>
    </CardShell>
  )
}

export function FeatureCard({
  eyebrow,
  kicker,
  title,
  excerpt,
  href,
  imageUrl,
  imageAlt,
  meta,
  badge,
  accent = 'magenta',
  orientation = 'vertical',
  className,
}: FeatureCardProps) {
  return (
    <CardShell
      href={href}
      accent={accent}
      className={cx(styles.featureCard, styles[orientation], className)}
    >
      <div className={styles.featureMedia}>
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt || ''} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>WN</div>
        )}

        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </div>

      <div className={styles.featureBody}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h3 className={styles.featureTitle}>{title}</h3>
        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
        {meta ? <p className={styles.meta}>{meta}</p> : null}
      </div>
    </CardShell>
  )
}

export function StatCard({ label, value, detail, accent = 'green', className }: StatCardProps) {
  return (
    <article className={cx(styles.statCard, className)} style={getAccentStyle(accent)}>
      <p className={styles.statLabel}>{label}</p>
      <strong className={styles.statValue}>{value}</strong>
      {detail ? <p className={styles.statDetail}>{detail}</p> : null}
    </article>
  )
}