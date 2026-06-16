import Image from 'next/image'
import Link from 'next/link'
import type { ArticleContentBlock } from '../../../../../apps/web/src/lib/news/news-types'
import { getBestImageUrl } from '../../../../../apps/web/src/lib/news/news-types'
import styles from './News.module.css'

type ArticleRendererProps = {
  blocks?: ArticleContentBlock[] | null
}

function normalizeBlockType(block: ArticleContentBlock) {
  return String(block.blockType || block.__typename || '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function renderTextNode(node: any, key: string) {
  let content: React.ReactNode = node.text || ''

  if (node.format & 1) content = <strong>{content}</strong>
  if (node.format & 2) content = <em>{content}</em>
  if (node.format & 8) content = <u>{content}</u>
  if (node.format & 16) content = <code>{content}</code>

  return <span key={key}>{content}</span>
}

function renderLexicalNode(node: any, key: string): React.ReactNode {
  if (!node) return null

  if (node.type === 'text') {
    return renderTextNode(node, key)
  }

  const children = Array.isArray(node.children)
    ? node.children.map((child: any, index: number) => renderLexicalNode(child, `${key}-${index}`))
    : null

  switch (node.type) {
    case 'heading': {
      const Tag = node.tag || 'h2'
      return <Tag key={key}>{children}</Tag>
    }

    case 'paragraph':
      return <p key={key}>{children}</p>

    case 'quote':
      return <blockquote key={key}>{children}</blockquote>

    case 'list':
      return node.listType === 'number' ? <ol key={key}>{children}</ol> : <ul key={key}>{children}</ul>

    case 'listitem':
      return <li key={key}>{children}</li>

    case 'link':
      return (
        <a key={key} href={node.fields?.url || '#'} target={node.fields?.newTab ? '_blank' : undefined} rel="noreferrer">
          {children}
        </a>
      )

    default:
      return <>{children}</>
  }
}

function RichTextBlock({ block }: { block: ArticleContentBlock }) {
  const content = block.content as any
  const root = content?.root

  return (
    <section className={styles.articleRichText}>
      {block.blockName ? <h2>{String(block.blockName)}</h2> : null}
      {root?.children?.map((node: any, index: number) => renderLexicalNode(node, `node-${index}`))}
    </section>
  )
}

function ImageBlock({ block }: { block: ArticleContentBlock }) {
  const image = block.image as any
  const imageUrl = getBestImageUrl(image, 'hero')

  if (!imageUrl) return null

  return (
    <figure className={styles.articleImageBlock}>
      <Image src={imageUrl} alt={image?.alt || String(block.caption || '') || 'WaveNation article image'} width={1200} height={675} />
      {block.caption || block.credit ? (
        <figcaption>
          {block.caption ? <span>{String(block.caption)}</span> : null}
          {block.credit ? <small>{String(block.credit)}</small> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}

function QuoteBlock({ block }: { block: ArticleContentBlock }) {
  return (
    <blockquote className={styles.articleQuote}>
      <p>{String(block.quote || '')}</p>
      {block.attribution || block.source ? <cite>{String(block.attribution || block.source)}</cite> : null}
    </blockquote>
  )
}

function EmbedBlock({ block }: { block: ArticleContentBlock }) {
  const url = String(block.embedUrl || block.url || '')

  if (!url) return null

  return (
    <div className={styles.embedBlock}>
      <iframe src={url} title={String(block.title || 'Embedded WaveNation content')} loading="lazy" allowFullScreen />
      {block.caption ? <p>{String(block.caption)}</p> : null}
    </div>
  )
}

function VideoBlock({ block }: { block: ArticleContentBlock }) {
  const media = block.media as any
  const poster = block.poster as any
  const src = String(block.videoUrl || media?.url || '')
  const posterUrl = getBestImageUrl(poster, 'hero')

  if (!src) return null

  return (
    <section className={styles.videoBlock}>
      {block.title ? <h2>{String(block.title)}</h2> : null}
      <video controls preload="metadata" poster={posterUrl || undefined}>
        <source src={src} />
      </video>
      {block.description ? <p>{String(block.description)}</p> : null}
    </section>
  )
}

function AdBlock({ block }: { block: ArticleContentBlock }) {
  return (
    <aside className={styles.adBlock} aria-label="Advertisement">
      <span>{String(block.label || 'Advertisement')}</span>
      <strong>{String(block.slotId || 'WaveNation Sponsor Slot')}</strong>
    </aside>
  )
}

function CTABlock({ block }: { block: ArticleContentBlock }) {
  return (
    <aside className={styles.ctaBlock}>
      {block.eyebrow ? <p className={styles.eyebrow}>{String(block.eyebrow)}</p> : null}
      <h2>{String(block.title || 'Keep riding the wave.')}</h2>
      {block.description ? <p>{String(block.description)}</p> : null}
      {block.href ? <Link href={String(block.href)}>{String(block.label || 'Explore More')}</Link> : null}
    </aside>
  )
}

function GalleryBlock({ block }: { block: ArticleContentBlock }) {
  const images = Array.isArray(block.images) ? block.images : []

  if (!images.length) return null

  return (
    <section className={styles.galleryBlock}>
      {block.title ? <h2>{String(block.title)}</h2> : null}

      <div className={styles.galleryGrid}>
        {images.map((item: any, index) => {
          const image = item.image
          const imageUrl = getBestImageUrl(image, 'card')
          if (!imageUrl) return null

          return (
            <figure key={`${imageUrl}-${index}`}>
              <Image src={imageUrl} alt={image?.alt || item.caption || 'WaveNation gallery image'} width={800} height={451} />
              {item.caption ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          )
        })}
      </div>
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

        if (type.includes('rich-text') || type.includes('richtext')) return <RichTextBlock key={key} block={block} />
        if (type.includes('image')) return <ImageBlock key={key} block={block} />
        if (type.includes('quote')) return <QuoteBlock key={key} block={block} />
        if (type.includes('embed')) return <EmbedBlock key={key} block={block} />
        if (type.includes('video')) return <VideoBlock key={key} block={block} />
        if (type.includes('ad')) return <AdBlock key={key} block={block} />
        if (type.includes('cta')) return <CTABlock key={key} block={block} />
        if (type.includes('gallery')) return <GalleryBlock key={key} block={block} />

        return null
      })}
    </>
  )
}