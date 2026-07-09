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

export function normalizeColor(color: string): string {
  if (!color) return '#0b5cab'
  const cleaned = color.replace(/\\"/g, '').replace(/^["']+|["']+$/g, '')
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : '#0b5cab'
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
  const normalized = normalizeColor(color)
  return `linear-gradient(135deg, ${normalized} 0%, ${adjustColor(normalized, 40)} 100%)`
}

/** 本地默认封面（源文件 content/assets/_defaults/，sync 复制到 public） */
export const DEFAULT_COVERS = [
  '/assets/defaults/cover-01.jpg',
  '/assets/defaults/cover-02.jpg',
  '/assets/defaults/cover-03.jpg',
  '/assets/defaults/cover-04.jpg',
  '/assets/defaults/cover-05.jpg',
  '/assets/defaults/cover-06.jpg',
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** 文章封面：有自定义 cover 用之，否则按 id 稳定映射默认图 */
export function getArticleCover(article: Pick<Article, 'id' | 'cover'>): string {
  if (article.cover) return article.cover
  return DEFAULT_COVERS[hashString(article.id) % DEFAULT_COVERS.length]
}

export function isDefaultCover(cover: string): boolean {
  return DEFAULT_COVERS.some((path) => cover === path)
}

function adjustColor(hex: string, amount: number) {
  const c = hex.replace('#', '')
  const num = parseInt(c, 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
