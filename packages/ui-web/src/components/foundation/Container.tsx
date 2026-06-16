import type { ReactNode } from 'react'
import styles from './Container.module.css'

type ContainerElement = 'div' | 'main' | 'section' | 'article' | 'header' | 'footer'

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full'

export type ContainerProps = {
  as?: ContainerElement
  size?: ContainerSize
  padded?: boolean
  bleedMobile?: boolean
  className?: string
  children: ReactNode
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Container({
  as = 'div',
  size = 'xl',
  padded = true,
  bleedMobile = false,
  className,
  children,
}: ContainerProps) {
  const Component = as

  return (
    <Component
      className={cx(
        styles.container,
        styles[size],
        padded && styles.padded,
        bleedMobile && styles.bleedMobile,
        className,
      )}
    >
      {children}
    </Component>
  )
}