'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './HomepageNewsSlider.module.css'

type Accent = 'news' | 'blue' | 'magenta' | 'green' | 'teal'

type SliderStory = {
  id: string
  title: string
  description: string
  href: string
  eyebrow: string
  imageUrl?: string
  imageAlt?: string
  meta?: string
  badge?: string
  accent?: Accent
}

type HomepageNewsSliderProps = {
  stories: SliderStory[]
  intervalMs?: number
}

const fallbackStories: SliderStory[] = [
  {
    id: 'slider-fallback-1',
    eyebrow: 'WaveNation News',
    badge: 'Latest',
    title: 'Culture moves here: WaveNation amplifies the stories shaping what is next.',
    description:
      'Follow the latest stories in music, entertainment, Southern culture, community, lifestyle, faith, and creator-led media.',
    href: '/news',
    meta: 'Latest coverage',
    accent: 'news',
  },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function accentClass(accent: Accent = 'news') {
  switch (accent) {
    case 'magenta':
      return styles.accentMagenta
    case 'green':
      return styles.accentGreen
    case 'teal':
      return styles.accentTeal
    case 'blue':
      return styles.accentBlue
    case 'news':
    default:
      return styles.accentNews
  }
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)

    update()
    query.addEventListener('change', update)

    return () => query.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

export function HomepageNewsSlider({ stories, intervalMs = 6500 }: HomepageNewsSliderProps) {
  const safeStories = useMemo(() => (stories.length > 0 ? stories.slice(0, 5) : fallbackStories), [stories])
  const [activeIndex, setActiveIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || safeStories.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeStories.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, reducedMotion, safeStories.length])

  const activeStory = safeStories[activeIndex] || safeStories[0]

  return (
    <section className={cx(styles.slider, accentClass(activeStory.accent))} aria-label="Latest WaveNation news slider">
      <div className={styles.mediaStack} aria-hidden="true">
        {safeStories.map((story, index) => (
          <div
            key={story.id}
            className={cx(styles.mediaSlide, index === activeIndex && styles.isActive)}
          >
            {story.imageUrl ? (
              <img src={story.imageUrl} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
            ) : (
              <div className={styles.fallbackImage}>
                <span>WN</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.overlay} />

      <Link href={activeStory.href} className={styles.content} aria-live="polite">
        <div className={styles.topline}>
          <span>{activeStory.badge || 'Latest'}</span>
          <span>{activeStory.meta || 'WaveNation Editorial'}</span>
        </div>
        <p className={styles.eyebrow}>{activeStory.eyebrow}</p>
        <h2>{activeStory.title}</h2>
        <p>{activeStory.description}</p>
        <strong>Read the story</strong>
      </Link>
    </section>
  )
}
