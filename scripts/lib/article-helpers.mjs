/** 本地默认封面（源文件 content/assets/_defaults/，sync 复制到 public） */
export const DEFAULT_COVERS = [
  '/assets/defaults/cover-01.jpg',
  '/assets/defaults/cover-02.jpg',
  '/assets/defaults/cover-03.jpg',
  '/assets/defaults/cover-04.jpg',
  '/assets/defaults/cover-05.jpg',
  '/assets/defaults/cover-06.jpg',
]

/** @param {string} color */
export function normalizeColor(color) {
  if (!color) return '#0b5cab'
  const cleaned = color.replace(/\\"/g, '').replace(/^["']+|["']+$/g, '')
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : '#0b5cab'
}

/** @param {string} date */
export function formatDate(date) {
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

/** @param {string} value */
function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * @param {{ id: string, cover?: string | null }} article
 */
export function getArticleCover(article) {
  if (article.cover) return article.cover
  return DEFAULT_COVERS[hashString(article.id) % DEFAULT_COVERS.length]
}

/** @param {string} cover */
export function isDefaultCover(cover) {
  return DEFAULT_COVERS.some((path) => cover === path)
}

/** @param {string} color */
export function categoryGradient(color) {
  const normalized = normalizeColor(color)
  return `linear-gradient(135deg, ${normalized} 0%, ${adjustColor(normalized, 40)} 100%)`
}

/** @param {string} hex @param {number} amount */
function adjustColor(hex, amount) {
  const c = hex.replace('#', '')
  const num = parseInt(c, 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** @param {string} slug */
export function skillName(slug) {
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64)
}

/** @param {string} body @param {string} slug */
export function extractImagePaths(body, slug) {
  const prefix = `/assets/${slug}/`
  const paths = new Set()
  const re = /!\[[^\]]*\]\(([^)]+)\)/g
  let match
  while ((match = re.exec(body)) !== null) {
    const src = match[1].trim()
    if (src.startsWith(prefix)) paths.add(src)
  }
  return [...paths]
}

/** @param {string} body @param {string} slug */
export function rewriteImagePathsForSkill(body, slug) {
  const prefix = `/assets/${slug}/`
  return body.replace(
    new RegExp(`!\\[([^\\]]*)\\]\\(${prefix.replace(/\//g, '\\/')}([^)]+)\\)`, 'g'),
    '![$1](assets/$2)',
  )
}

/** @param {string} value */
export function yamlQuote(value) {
  if (/[:#"'\n]/.test(value) || value.startsWith(' ') || value.endsWith(' ')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value
}
