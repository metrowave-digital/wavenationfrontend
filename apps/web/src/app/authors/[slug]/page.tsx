import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuthorProfile } from '@wavenation/ui-web'
import { getAuthorArticles, getAuthorBySlug } from '@/lib/wavenation-authors'
import styles from './page.module.css'

type AuthorPageParams = {
  slug: string
}

type AuthorPageProps = {
  params: Promise<AuthorPageParams>
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)

  if (!author) {
    return {
      title: 'Author Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = author.bioText
    ? author.bioText.slice(0, 155)
    : `Read the latest WaveNation stories by ${author.fullName}.`

  return {
    title: `${author.fullName} | Authors & Contributors`,
    description,
    alternates: {
      canonical: `/authors/${author.slug}`,
    },
    openGraph: {
      title: `${author.fullName} | WaveNation`,
      description,
      type: 'profile',
      url: `/authors/${author.slug}`,
      images: author.avatarUrl
        ? [
            {
              url: author.avatarUrl,
              alt: author.avatarAlt ?? author.fullName,
            },
          ]
        : undefined,
    },
  }
}

export default async function AuthorDetailPage({ params }: AuthorPageProps) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)

  if (!author) notFound()

  const articlesResponse = await getAuthorArticles(author.id, {
    page: 1,
    limit: 12,
  })

  return (
    <main className={styles.page}>
      <AuthorProfile
        author={author}
        articles={articlesResponse.articles}
        articlesPagination={articlesResponse}
        backHref="/authors"
      />
    </main>
  )
}
