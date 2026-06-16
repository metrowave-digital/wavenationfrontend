import { NextRequest, NextResponse } from 'next/server'
import {
  getArticles,
  getAuthorBySlug,
  getCategoryBySlug,
  getSubcategoryBySlug,
  getTagBySlug,
  getTopicBySlug,
} from '@/lib/news/news-rest'
import type { ArticleQueryFilters } from '@wavenation/ui-web'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '12')

    const categorySlug = searchParams.get('categorySlug') || undefined
    const subcategorySlug = searchParams.get('subcategorySlug') || undefined
    const topicSlug = searchParams.get('topicSlug') || undefined
    const tagSlug = searchParams.get('tagSlug') || undefined
    const authorSlug = searchParams.get('authorSlug') || undefined
    const search = searchParams.get('q') || undefined
    const year = searchParams.get('year') || undefined
    const month = searchParams.get('month') || undefined

    const filters: ArticleQueryFilters = {
      search,
      year,
      month,
    }

    if (categorySlug) {
      const category = await getCategoryBySlug(categorySlug)

      if (!category) {
        return NextResponse.json({
          docs: [],
          hasNextPage: false,
          page,
          totalPages: 0,
        })
      }

      filters.categoryId = category.id
    }

    if (subcategorySlug) {
      const subcategory = await getSubcategoryBySlug(subcategorySlug, filters.categoryId)

      if (!subcategory) {
        return NextResponse.json({
          docs: [],
          hasNextPage: false,
          page,
          totalPages: 0,
        })
      }

      filters.subcategoryId = subcategory.id
    }

    if (topicSlug) {
      const topic = await getTopicBySlug(topicSlug)

      if (!topic) {
        return NextResponse.json({
          docs: [],
          hasNextPage: false,
          page,
          totalPages: 0,
        })
      }

      filters.topicId = topic.id
    }

    if (tagSlug) {
      const tag = await getTagBySlug(tagSlug)

      if (!tag) {
        return NextResponse.json({
          docs: [],
          hasNextPage: false,
          page,
          totalPages: 0,
        })
      }

      filters.tagId = tag.id
    }

    if (authorSlug) {
      const author = await getAuthorBySlug(authorSlug)

      if (!author) {
        return NextResponse.json({
          docs: [],
          hasNextPage: false,
          page,
          totalPages: 0,
        })
      }

      filters.authorId = author.id
    }

    const articles = await getArticles(filters, page, limit)

    return NextResponse.json(articles)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to load WaveNation articles.',
      },
      { status: 500 },
    )
  }
}