import { Fragment, createElement, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './News.module.css'

type UnknownRecord = Record<string, unknown>

export type ArticleContentBlock = UnknownRecord & {
  id?: string | number
  blockType?: string
  blockName?: string
  __typename?: string
}

type ArticleRendererProps = {
  blocks?: ArticleContentBlock[] | null
}

type LexicalNode = UnknownRecord & {
  type?: string
  tag?: string
  text?: string
  format?: number
  listType?: string
  children?: LexicalNode[]
  fields?: UnknownRecord
}

const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return String(value)
  return fallback
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value
  return fallback
}

function asArray(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function getRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null
}

function getField(record: UnknownRecord | null | undefined, key: string) {
  return record?.[key]
}

function getStringField(record: UnknownRecord | null | undefined, key: string, fallback = '') {
  return asString(getField(record, key), fallback)
}

function getBooleanField(record: UnknownRecord | null | undefined, key: string, fallback = false) {
  return asBoolean(getField(record, key), fallback)
}

function getRecordField(record: UnknownRecord | null | undefined, key: string) {
  return getRecord(getField(record, key))
}

function normalizeBlockType(block: ArticleContentBlock) {
  return String(block.blockType || block.__typename || '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function getBestImageUrl(media: unknown, preferredSize: 'hero' | 'card' | 'thumbnail' = 'hero') {
  if (typeof media === 'string') return media

  const mediaRecord = getRecord(media)
  if (!mediaRecord) return ''

  const sizes = getRecordField(mediaRecord, 'sizes')
  const preferred = getRecordField(sizes, preferredSize)
  const card = getRecordField(sizes, 'card')
  const hero = getRecordField(sizes, 'hero')
  const thumbnail = getRecordField(sizes, 'thumbnail')

  return (
    getStringField(preferred, 'url') ||
    getStringField(hero, 'url') ||
    getStringField(card, 'url') ||
    getStringField(thumbnail, 'url') ||
    getStringField(mediaRecord, 'url') ||
    getStringField(mediaRecord, 'thumbnailURL') ||
    ''
  )
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

function SmartLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  if (!href) return null

  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    )
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  )
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }

    if (parsed.hostname.includes('youtube.com')) {
      const watchId = parsed.searchParams.get('v')

      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`
      }

      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/)
      if (shortsMatch?.[1]) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`
      }

      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/)
      if (embedMatch?.[1]) {
        return url
      }
    }

    return url
  } catch {
    return url
  }
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)

    if (!parsed.hostname.includes('vimeo.com')) return url

    const id = parsed.pathname.split('/').filter(Boolean).pop()
    return id ? `https://player.vimeo.com/video/${id}` : url
  } catch {
    return url
  }
}

function normalizeEmbedUrl(url: string, provider?: string) {
  if (!url) return ''

  const safeProvider = provider?.toLowerCase() || ''

  if (safeProvider === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    return getYouTubeEmbedUrl(url)
  }

  if (safeProvider === 'vimeo' || url.includes('vimeo.com')) {
    return getVimeoEmbedUrl(url)
  }

  return url
}

function shouldUseVideoElement(url: string) {
  const lower = url.toLowerCase()

  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.m3u8') ||
    lower.includes('.mp4?') ||
    lower.includes('.webm?') ||
    lower.includes('.m3u8?')
  )
}

function renderTextNode(node: LexicalNode, key: string) {
  let content: ReactNode = node.text || ''
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & 16) content = <code>{content}</code>
  if (format & 8) content = <u>{content}</u>
  if (format & 4) content = <s>{content}</s>
  if (format & 2) content = <em>{content}</em>
  if (format & 1) content = <strong>{content}</strong>

  return <span key={key}>{content}</span>
}

function renderLexicalNode(node: LexicalNode | null | undefined, key: string): ReactNode {
  if (!node) return null

  if (node.type === 'text') {
    return renderTextNode(node, key)
  }

  const children = Array.isArray(node.children)
    ? node.children.map((child, index) => renderLexicalNode(child, `${key}-${index}`))
    : null

  switch (node.type) {
    case 'heading': {
      const rawTag = asString(node.tag, 'h2')
      const tag = headingTags.includes(rawTag as (typeof headingTags)[number]) ? rawTag : 'h2'

      return createElement(tag, { key }, children)
    }

    case 'paragraph':
      return <p key={key}>{children}</p>

    case 'quote':
      return <blockquote key={key}>{children}</blockquote>

    case 'list':
      return node.listType === 'number' ? <ol key={key}>{children}</ol> : <ul key={key}>{children}</ul>

    case 'listitem':
      return <li key={key}>{children}</li>

    case 'linebreak':
      return <br key={key} />

    case 'link': {
      const fields = getRecord(node.fields)
      const href = getStringField(fields, 'url') || '#'
      const newTab = getBooleanField(fields, 'newTab')

      return (
        <a key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined}>
          {children}
        </a>
      )
    }

    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

function RichTextBlock({ block }: { block: ArticleContentBlock }) {
  const content = getRecord(block.content)
  const root = getRecordField(content, 'root')
  const children = Array.isArray(root?.children) ? (root.children as LexicalNode[]) : []
  const dropCap = getBooleanField(block, 'dropCap')

  if (!children.length) return null

  return (
    <section className={`${styles.articleRichText} ${dropCap ? styles.dropCap : ''}`}>
      {block.blockName ? <h2>{String(block.blockName)}</h2> : null}
      {children.map((node, index) => renderLexicalNode(node, `node-${index}`))}
    </section>
  )
}

function ImageBlock({ block }: { block: ArticleContentBlock }) {
  const image = getRecord(block.image)
  const imageUrl = getBestImageUrl(image, 'hero')
  const caption = getStringField(block, 'caption')
  const credit = getStringField(block, 'credit')
  const layout = getStringField(block, 'layout', 'standard')

  if (!imageUrl) return null

  return (
    <figure className={`${styles.articleImageBlock} ${styles[`imageLayout_${layout}`] || ''}`}>
      <Image
        src={imageUrl}
        alt={getStringField(image, 'alt') || caption || 'WaveNation article image'}
        width={1200}
        height={675}
      />

      {caption || credit ? (
        <figcaption>
          {caption ? <span>{caption}</span> : null}
          {credit ? <small>{credit}</small> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}

function GalleryBlock({ block }: { block: ArticleContentBlock }) {
  const images = asArray(block.images)
  const layout = getStringField(block, 'layout', 'grid')

  if (!images.length) return null

  return (
    <section className={styles.galleryBlock} data-layout={layout}>
      {block.title ? <h2>{String(block.title)}</h2> : null}

      <div className={styles.galleryGrid}>
        {images.map((item, index) => {
          const image = getRecordField(item, 'image')
          const imageUrl = getBestImageUrl(image, 'card')
          const caption = getStringField(item, 'caption')

          if (!imageUrl) return null

          return (
            <figure key={`${imageUrl}-${index}`}>
              <Image
                src={imageUrl}
                alt={getStringField(image, 'alt') || caption || 'WaveNation gallery image'}
                width={800}
                height={451}
              />
              {caption ? <figcaption>{caption}</figcaption> : null}
            </figure>
          )
        })}
      </div>
    </section>
  )
}

function QuoteBlock({ block }: { block: ArticleContentBlock }) {
  const quote = getStringField(block, 'quote')
  const attribution = getStringField(block, 'attribution') || getStringField(block, 'source')
  const style = getStringField(block, 'style', 'standard')

  if (!quote) return null

  return (
    <blockquote className={`${styles.articleQuote} ${styles[`quote_${style}`] || ''}`}>
      <p>{quote}</p>
      {attribution ? <cite>{attribution}</cite> : null}
    </blockquote>
  )
}

function EmbedBlock({ block }: { block: ArticleContentBlock }) {
  const provider = getStringField(block, 'provider')
  const rawUrl = getStringField(block, 'embedUrl') || getStringField(block, 'url')
  const embedUrl = normalizeEmbedUrl(rawUrl, provider)
  const title = getStringField(block, 'title') || `${provider || 'Embedded'} WaveNation content`
  const caption = getStringField(block, 'caption')

  if (!embedUrl) return null

  return (
    <section className={styles.embedBlock}>
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      {caption ? <p>{caption}</p> : null}
    </section>
  )
}

function VideoBlock({ block }: { block: ArticleContentBlock }) {
  const provider = getStringField(block, 'provider')
  const sourceType = getStringField(block, 'sourceType', 'external')
  const file = getRecord(block.file)
  const vodItem = getRecord(block.vodItem)
  const streaming = getRecordField(vodItem, 'streaming')

  const rawUrl =
    getStringField(block, 'url') ||
    getStringField(file, 'url') ||
    getStringField(streaming, 'hlsUrl') ||
    getStringField(vodItem, 'hlsUrl') ||
    getStringField(vodItem, 'videoUrl') ||
    getStringField(vodItem, 'url')

  const caption = getStringField(block, 'caption')
  const title = getStringField(block, 'title') || getStringField(vodItem, 'title')
  const poster = getRecord(block.poster) || getRecord(vodItem?.poster) || getRecord(vodItem?.posterArt)
  const posterUrl = getBestImageUrl(poster, 'hero')
  const autoplay = getBooleanField(block, 'autoplay')
  const loop = getBooleanField(block, 'loop')

  if (!rawUrl) return null

  const embedUrl = normalizeEmbedUrl(rawUrl, provider)
  const useVideo = sourceType === 'internal-vod' || provider === 'upload' || shouldUseVideoElement(rawUrl)

  return (
    <section className={styles.videoBlock}>
      {title ? <h2>{title}</h2> : null}

      {useVideo ? (
        <video
          controls
          preload="metadata"
          poster={posterUrl || undefined}
          autoPlay={autoplay}
          muted={autoplay}
          loop={loop}
          playsInline
        >
          <source src={rawUrl} />
        </video>
      ) : (
        <iframe
          src={embedUrl}
          title={title || 'WaveNation video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      {caption ? <p>{caption}</p> : null}
    </section>
  )
}

function AudioBlock({ block }: { block: ArticleContentBlock }) {
  const sourceType = getStringField(block, 'sourceType', 'track')
  const track = getRecord(block.track)
  const episode = getRecord(block.episode)
  const manualAudio = getRecord(block.manualAudio)
  const manualFile = getRecordField(manualAudio, 'audioFile')

  const title =
    getStringField(manualAudio, 'title') ||
    getStringField(track, 'title') ||
    getStringField(episode, 'title') ||
    'WaveNation audio'

  const subtitle =
    getStringField(manualAudio, 'showName') ||
    getStringField(track, 'artistName') ||
    getStringField(track, 'artist') ||
    getStringField(episode, 'showName') ||
    getStringField(episode, 'podcastTitle') ||
    sourceType

  const src =
    getStringField(manualFile, 'url') ||
    getStringField(getRecordField(track, 'audioFile'), 'url') ||
    getStringField(getRecordField(track, 'file'), 'url') ||
    getStringField(getRecordField(track, 'audio'), 'url') ||
    getStringField(getRecordField(episode, 'audioFile'), 'url') ||
    getStringField(getRecordField(episode, 'file'), 'url') ||
    getStringField(episode, 'enclosureUrl') ||
    getStringField(episode, 'audioUrl')

  if (!src) return null

  return (
    <section className={styles.audioBlock}>
      <div>
        <span>Audio</span>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      <audio controls preload="metadata" src={src} />
    </section>
  )
}

function ArtistSpotlightBlock({ block }: { block: ArticleContentBlock }) {
  const linkedTalent = getRecord(block.linkedTalent)
  const manualImage = getRecord(block.image)
  const image = getRecord(linkedTalent?.image) || getRecord(linkedTalent?.avatar) || manualImage
  const imageUrl = getBestImageUrl(image, 'card')

  const name =
    getStringField(linkedTalent, 'stageName') ||
    getStringField(linkedTalent, 'fullName') ||
    getStringField(linkedTalent, 'name') ||
    getStringField(block, 'artistName') ||
    'Artist Spotlight'

  const description =
    getStringField(linkedTalent, 'shortBio') ||
    getStringField(linkedTalent, 'bioText') ||
    getStringField(block, 'description')

  const links = asArray(block.links)

  return (
    <section className={styles.artistSpotlightBlock}>
      {imageUrl ? (
        <div className={styles.artistSpotlightMedia}>
          <Image
            src={imageUrl}
            alt={getStringField(image, 'alt') || name}
            width={640}
            height={640}
          />
        </div>
      ) : null}

      <div>
        <p className={styles.eyebrow}>Artist Spotlight</p>
        <h2>{name}</h2>
        {description ? <p>{description}</p> : null}

        {links.length ? (
          <div className={styles.artistSpotlightLinks}>
            {links.map((item, index) => {
              const href = getStringField(item, 'url')
              const label = getStringField(item, 'label', 'Visit')

              if (!href) return null

              return (
                <SmartLink key={`${href}-${index}`} href={href}>
                  {label}
                </SmartLink>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function RelatedArticlesBlock({ block }: { block: ArticleContentBlock }) {
  const articles = asArray(block.articles)
  const title = getStringField(block, 'title', 'Read More')
  const layout = getStringField(block, 'layout', 'list')

  if (!articles.length) return null

  return (
    <aside className={styles.relatedArticlesBlock} data-layout={layout}>
      <h2>{title}</h2>

      <div className={styles.relatedArticlesGrid}>
        {articles.map((article, index) => {
          const slug = getStringField(article, 'slug')
          const href = slug ? `/news/${slug}` : '#'
          const articleTitle = getStringField(article, 'title', 'Related story')
          const image = getRecord(article.heroImage) || getRecord(article.image)
          const imageUrl = getBestImageUrl(image, 'card')

          return (
            <SmartLink key={getStringField(article, 'id', `${slug}-${index}`)} href={href}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={getStringField(image, 'alt') || articleTitle}
                  width={480}
                  height={270}
                />
              ) : null}
              <span>{articleTitle}</span>
            </SmartLink>
          )
        })}
      </div>
    </aside>
  )
}

function CTABlock({ block }: { block: ArticleContentBlock }) {
  const headline = getStringField(block, 'headline') || getStringField(block, 'title') || 'Keep riding the wave.'
  const body = getStringField(block, 'body') || getStringField(block, 'description')
  const buttonUrl = getStringField(block, 'buttonUrl') || getStringField(block, 'href')
  const buttonLabel = getStringField(block, 'buttonLabel') || getStringField(block, 'label', 'Explore More')
  const variant = getStringField(block, 'variant', 'primary')

  return (
    <aside className={`${styles.ctaBlock} ${styles[`cta_${variant}`] || ''}`}>
      {block.eyebrow ? <p className={styles.eyebrow}>{String(block.eyebrow)}</p> : null}
      <h2>{headline}</h2>
      {body ? <p>{body}</p> : null}
      {buttonUrl ? <SmartLink href={buttonUrl}>{buttonLabel}</SmartLink> : null}
    </aside>
  )
}

function AdBlock({ block }: { block: ArticleContentBlock }) {
  const adPlacement = getRecord(block.adPlacement)
  const label = getStringField(block, 'label') || getStringField(adPlacement, 'label') || 'Advertisement'
  const slotId =
    getStringField(block, 'slotId') ||
    getStringField(adPlacement, 'slotId') ||
    getStringField(adPlacement, 'name') ||
    'WaveNation Sponsor Slot'

  return (
    <aside className={styles.adBlock} aria-label="Advertisement">
      <span>{label}</span>
      <strong>{slotId}</strong>
    </aside>
  )
}

function DividerBlock({ block }: { block: ArticleContentBlock }) {
  const style = getStringField(block, 'style', 'solid')

  if (style === 'spacing') {
    return <div className={styles.dividerSpacing} aria-hidden="true" />
  }

  if (style === 'asterisks') {
    return (
      <div className={styles.dividerAsterisks} aria-hidden="true">
        <span>*</span>
        <span>*</span>
        <span>*</span>
      </div>
    )
  }

  return <hr className={styles.dividerBlock} />
}

function InterviewQuestionBlock({ block }: { block: ArticleContentBlock }) {
  const question = getStringField(block, 'question')
  const askedBy = getStringField(block, 'askedBy')

  if (!question) return null

  return (
    <section className={styles.interviewQuestion}>
      {askedBy ? <p>{askedBy}</p> : null}
      <h2>{question}</h2>
    </section>
  )
}

function InterviewAnswerBlock({ block }: { block: ArticleContentBlock }) {
  const answer = getRecord(block.answer)
  const root = getRecordField(answer, 'root')
  const children = Array.isArray(root?.children) ? (root.children as LexicalNode[]) : []
  const answeredBy = getStringField(block, 'answeredBy')
  const highlight = getBooleanField(block, 'highlight')

  if (!children.length) return null

  return (
    <section className={`${styles.interviewAnswer} ${highlight ? styles.interviewAnswerHighlight : ''}`}>
      {answeredBy ? <p className={styles.eyebrow}>{answeredBy}</p> : null}
      {children.map((node, index) => renderLexicalNode(node, `answer-${index}`))}
    </section>
  )
}

function TimelineBlock({ block }: { block: ArticleContentBlock }) {
  const title = getStringField(block, 'title')
  const timelineStyle = getStringField(block, 'style', 'vertical')
  const items = asArray(block.items)

  if (!items.length) return null

  return (
    <section className={styles.timelineBlock} data-style={timelineStyle}>
      {title ? <h2>{title}</h2> : null}

      <ol className={styles.timelineList}>
        {items.map((item, index) => {
          const date = getStringField(item, 'date')
          const headline = getStringField(item, 'headline', 'Timeline moment')
          const description = getStringField(item, 'description')
          const image = getRecord(item.image)
          const imageUrl = getBestImageUrl(image, 'card')
          const link = getStringField(item, 'link')
          const highlight = getBooleanField(item, 'highlight')

          return (
            <li
              key={`${headline}-${index}`}
              className={highlight ? styles.timelineHighlight : undefined}
            >
              {date ? <time>{date}</time> : null}

              <div>
                <h3>{headline}</h3>
                {description ? <p>{description}</p> : null}

                {imageUrl ? (
                  <Image
                    className={styles.timelineMedia}
                    src={imageUrl}
                    alt={getStringField(image, 'alt') || headline}
                    width={800}
                    height={451}
                  />
                ) : null}

                {link ? <SmartLink href={link}>Read related story</SmartLink> : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function ArticleRenderer({ blocks }: ArticleRendererProps) {
  if (!blocks?.length) {
    return (
      <section className={styles.articleRichText}>
        <p>This story is being prepared by the WaveNation editorial team.</p>
      </section>
    )
  }

  return (
    <>
      {blocks.map((block, index) => {
        const type = normalizeBlockType(block)
        const key = block.id || `${type}-${index}`

        if (type.includes('rich-text') || type.includes('richtext')) {
          return <RichTextBlock key={key} block={block} />
        }

        if (type === 'image' || type.includes('image-block')) {
          return <ImageBlock key={key} block={block} />
        }

        if (type.includes('gallery')) {
          return <GalleryBlock key={key} block={block} />
        }

        if (type.includes('pull-quote') || type.includes('pullquote') || type.includes('quote')) {
          return <QuoteBlock key={key} block={block} />
        }

        if (type.includes('embed')) {
          return <EmbedBlock key={key} block={block} />
        }

        if (type.includes('video')) {
          return <VideoBlock key={key} block={block} />
        }

        if (type.includes('audio')) {
          return <AudioBlock key={key} block={block} />
        }

        if (type.includes('artist-spotlight') || type.includes('artistspotlight')) {
          return <ArtistSpotlightBlock key={key} block={block} />
        }

        if (type.includes('related-articles') || type.includes('relatedarticles')) {
          return <RelatedArticlesBlock key={key} block={block} />
        }

        if (type.includes('cta')) {
          return <CTABlock key={key} block={block} />
        }

        if (type.includes('ad-insert') || type.includes('adinsert') || type.includes('ad')) {
          return <AdBlock key={key} block={block} />
        }

        if (type.includes('divider')) {
          return <DividerBlock key={key} block={block} />
        }

        if (type.includes('interview-question') || type.includes('interviewquestion')) {
          return <InterviewQuestionBlock key={key} block={block} />
        }

        if (type.includes('interview-answer') || type.includes('interviewanswer')) {
          return <InterviewAnswerBlock key={key} block={block} />
        }

        if (type.includes('timeline')) {
          return <TimelineBlock key={key} block={block} />
        }

        return null
      })}
    </>
  )
}