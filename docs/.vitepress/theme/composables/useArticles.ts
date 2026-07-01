import { computed } from 'vue'
import articlesData from '../../data/articles.json'

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
}

export function useArticles() {
  const articles = computed(() => data.articles)
  const categories = computed(() => data.categories)
  const authors = computed(() => data.authors)

  function getByLink(path: string) {
    const normalized = path.replace(/\.html$/, '').replace(/\/index$/, '')
    return data.articles.find((a) => {
      const link = a.link.replace(/^\//, '')
      return normalized.endsWith(link) || normalized === link
    })
  }

  function recent(limit = 6) {
    return [...data.articles]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
  }

  function byCategory(categoryId: string) {
    return data.articles.filter((a) => a.category === categoryId)
  }

  return { articles, categories, authors, getByLink, recent, byCategory }
}

export function formatDate(date: string) {
  if (!date || date === '1970-01-01') return '日期待定'
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  } catch {
    return date
  }
}

export function categoryGradient(color: string) {
  return `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, 40)} 100%)`
}

function adjustColor(hex: string, amount: number) {
  const c = hex.replace('#', '')
  const num = parseInt(c, 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
