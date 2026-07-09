import { computed } from 'vue'
import articlesData from '../../data/articles.json'
import {
  DEFAULT_COVERS,
  normalizeColor,
  formatDate,
  getArticleCover,
  isDefaultCover,
  categoryGradient,
} from '../../../../scripts/lib/article-helpers.mjs'

export { DEFAULT_COVERS, normalizeColor, formatDate, getArticleCover, isDefaultCover, categoryGradient }

export interface Article {
  id: string
  slug: string
  title: string
  description: string
  author: string
  date: string
  tags: string[]
  category: string
  categoryLabel: string
  categoryColor: string
  link: string
  cover: string | null
  protected?: boolean
}

export interface Category {
  id: string
  label: string
  color?: string
  description?: string
}

const data = articlesData as {
  categories: Category[]
  articles: Article[]
  authors: string[]
  authorAvatars?: Record<string, string>
}

export function useArticles() {
  const articles = computed(() => data.articles)
  const categories = computed(() => data.categories)
  const authors = computed(() => data.authors)

  function getByLink(path: string) {
    const normalized = path
      .replace(/\.html$/, '')
      .replace(/\.md$/, '')
      .replace(/\/index$/, '')
    return data.articles.find((a) => {
      const link = a.link.replace(/^\//, '')
      return normalized === link || normalized.endsWith(`/${link}`)
    })
  }

  function recent(limit = 6) {
    return [...data.articles]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
  }

  function random(limit = 6) {
    const pool = [...data.articles]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, Math.min(limit, pool.length))
  }

  function byCategory(categoryId: string) {
    return data.articles.filter((a) => a.category === categoryId)
  }

  return { articles, categories, authors, getByLink, recent, random, byCategory }
}

export function getAuthorAvatar(author: string): string | null {
  return data.authorAvatars?.[author] ?? null
}
