/** @param {unknown} value */
export function isProtectedFlag(value) {
  return value === true || value === 'true'
}

/** @param {string} value */
export function stripQuotes(value) {
  return value.replace(/^["']+|["']+$/g, '')
}

/** @typedef {{ id: string, label: string, dir: string, description?: string, color?: string }} Category */

/** @param {string} raw */
export function parseCategoriesYaml(raw) {
  const categories = []
  let current = /** @type {Partial<Category>} */ ({})

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- id:')) {
      if (current.id) categories.push(/** @type {Category} */ (current))
      current = { id: trimmed.slice(5).trim() }
    } else if (trimmed.startsWith('label:')) {
      current.label = trimmed.slice(6).trim()
    } else if (trimmed.startsWith('dir:')) {
      current.dir = trimmed.slice(4).trim()
    } else if (trimmed.startsWith('description:')) {
      current.description = trimmed.slice(12).trim()
    } else if (trimmed.startsWith('color:')) {
      current.color = stripQuotes(trimmed.slice(6).trim())
    }
  }
  if (current.id) categories.push(/** @type {Category} */ (current))
  return { categories }
}

/**
 * @param {string} content
 * @returns {{ meta: Record<string, string | string[] | boolean>, body: string }}
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  /** @type {Record<string, string | string[] | boolean>} */
  const meta = {}
  let currentKey = ''
  /** @type {string[]} */
  let listItems = []

  for (const line of match[1].split('\n')) {
    const listMatch = line.match(/^\s+-\s+(.+)$/)
    if (listMatch && currentKey) {
      listItems.push(listMatch[1].trim().replace(/^["']|["']$/g, ''))
      continue
    }
    if (listItems.length && currentKey) {
      meta[currentKey] = listItems
      listItems = []
    }
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue
    currentKey = kv[1]
    const value = kv[2].trim()
    if (!value) {
      listItems = []
      continue
    }
    if (value === 'true') meta[currentKey] = true
    else if (value === 'false') meta[currentKey] = false
    else meta[currentKey] = value.replace(/^["']|["']$/g, '')
    currentKey = ''
  }
  if (listItems.length && currentKey) meta[currentKey] = listItems

  return { meta, body: match[2] }
}

/**
 * @param {Record<string, string | string[] | boolean>} meta
 * @param {string} slug
 * @param {string} categoryId
 */
export function serializeFrontmatter(meta, slug, categoryId) {
  const lines = ['---']
  const order = ['title', 'description', 'author', 'date', 'category', 'tags', 'cover', 'protected', 'sidebar', 'aside']
  const merged = {
    sidebar: false,
    aside: true,
    category: categoryId,
    ...meta,
  }

  for (const key of order) {
    if (merged[key] === undefined) continue
    const val = merged[key]
    if (Array.isArray(val)) {
      lines.push(`${key}:`)
      for (const item of val) lines.push(`  - ${item}`)
    } else {
      lines.push(`${key}: ${val}`)
    }
  }

  for (const [key, val] of Object.entries(merged)) {
    if (order.includes(key)) continue
    if (Array.isArray(val)) {
      lines.push(`${key}:`)
      for (const item of val) lines.push(`  - ${item}`)
    } else {
      lines.push(`${key}: ${val}`)
    }
  }

  lines.push('---', '')
  return lines.join('\n')
}

/**
 * @param {string} body
 * @param {string} slug
 */
export function rewriteImagePaths(body, slug) {
  return body
    .replace(/!\[([^\]]*)\]\(images\//g, `![$1](/assets/${slug}/`)
    .replace(/!\[([^\]]*)\]\(\.\/images\//g, `![$1](/assets/${slug}/`)
}

/**
 * @param {string} body
 */
export function extractTitleFromBody(body) {
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : '未命名文章'
}

/**
 * @param {string} body
 */
export function extractDescription(body) {
  const paragraphs = body
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('>'))
  const text = paragraphs.find((p) => p.length > 20) ?? paragraphs[0] ?? ''
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 120)
}
