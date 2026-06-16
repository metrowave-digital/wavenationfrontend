import type { ReactNode } from 'react'
import { Container, type ContainerSize } from './Container'
import styles from './SectionWrapper.module.css'

export type SectionTone =
  | 'default'
  | 'surface'
  | 'gradient'
  | 'blue'
  | 'magenta'
  | 'green'
  | 'news'

export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export type SectionWrapperProps = {
  id?: string
  eyebrow?: string
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  children: ReactNode
  tone?: SectionTone
  spacing?: SectionSpacing
  align?: 'left' | 'center'
  containerSize?: ContainerSize
  className?: string
  headerClassName?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function SectionWrapper({
  id,
  eyebrow,
  title,
  subtitle,
  actions,
  aside,
  children,
  tone = 'default',
  spacing = 'lg',
  align = 'left',
  containerSize = 'xl',
  className,
  headerClassName,
}: SectionWrapperProps) {
  const hasHeader = Boolean(eyebrow || title || subtitle || actions)
  const hasAside = Boolean(aside)

  return (
    <section
      id={id}
      className={cx(styles.section, styles[tone], styles[spacing], className)}
    >
      <Container size={containerSize}>
        {hasHeader ? (
          <div
            className={cx(
              styles.header,
              styles[align],
              hasAside && styles.withAside,
              headerClassName,
            )}
          >
            <div className={styles.copy}>
              {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
              {title ? <h2 className={styles.title}>{title}</h2> : null}
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>

            {actions ? <div className={styles.actions}>{actions}</div> : null}
          </div>
        ) : null}

        {hasAside ? (
          <div className={styles.layout}>
            <div className={styles.main}>{children}</div>
            <aside className={styles.aside}>{aside}</aside>
          </div>
        ) : (
          children
        )}
      </Container>
    </section>
  )
}