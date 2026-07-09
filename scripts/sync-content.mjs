#!/usr/bin/env node
/**
 * 将 content/library/ 同步至 docs/articles/，复制静态资源，
 * 生成 articles.json 索引与 sidebar 配置。
 */
import { readFile, writeFile, readdir, mkdir, rm, cp } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join, relative, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_ARTICLES = join(ROOT, 'docs', 'articles')
const CATEGORIES_FILE = join(ROOT, 'content', '_meta', 'categories.yaml')
const SIDEBAR_SNIPPET = join(ROOT, 'docs', '.vitepress', 'sidebar.generated.json')
const ARTICLES_DATA = join(ROOT, 'docs', '.vitepress', 'data', 'articles.json')
const PUBLIC_ASSETS = join(ROOT, 'docs', 'public', 'assets')
const ARTICLE_SOURCES = join(ROOT, 'docs', 'public', 'article-sources')
const CONTENT_ASSETS = join(ROOT, 'content', 'assets')
const AVATARS_SRC = join(ROOT, 'avatars')
const AVATARS_ASSETS = join(CONTENT_ASSETS, 'avatars')
const IMPORT_DIR = join(ROOT, 'import')

/** @typedef {{ id: string, label: string, dir: string, description?: string, color?: string }} Category */

/** @param {string} value */
function stripQuotes(value) {
  return value.replace(/^["']+|["']+$/g, '')
}

/** @typedef {{ title: string, description: string, author: string, date: string, tags: string[], category: string, cover?: string, layout?: string, sidebar?: boolean }} ArticleMeta */

function parseCategoriesYaml(raw) {
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
 * @returns {{ meta: Record<string, string | string[]>, body: string }}
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  /** @type {Record<string, string | string[]>} */
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
    meta[currentKey] = value.replace(/^["']|["']$/g, '')
    currentKey = ''
  }
  if (listItems.length && currentKey) meta[currentKey] = listItems

  return { meta, body: match[2] }
}

/**
 * @param {Record<string, string | string[]>} meta
 * @param {string} slug
 * @param {string} categoryId
 */
function serializeFrontmatter(meta, slug, categoryId) {
  const lines = ['---']
  const order = ['title', 'description', 'author', 'date', 'category', 'tags', 'cover', 'sidebar', 'aside']
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
function rewriteImagePaths(body, slug) {
  return body
    .replace(/!\[([^\]]*)\]\(images\//g, `![$1](/assets/${slug}/`)
    .replace(/!\[([^\]]*)\]\(\.\/images\//g, `![$1](/assets/${slug}/`)
}

/**
 * @param {string} body
 */
function extractTitleFromBody(body) {
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : '未命名文章'
}

/**
 * @param {string} body
 */
function extractDescription(body) {
  const paragraphs = body
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('>'))
  const text = paragraphs.find((p) => p.length > 20) ?? paragraphs[0] ?? ''
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 120)
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdownFiles(full)))
    else if (entry.isFile() && extname(entry.name) === '.md') files.push(full)
  }
  return files
}

/**
 * @param {string} srcDir
 * @param {string} destDir
 */
async function copyDirIfExists(srcDir, destDir) {
  try {
    await cp(srcDir, destDir, { recursive: true })
    return true
  } catch {
    return false
  }
}

/**
 * 从 import/<slug>/readme.md 读取作者显示名称
 * @param {string} slug
 */
async function readAuthorNameFromImport(slug) {
  try {
    const readme = await readFile(join(IMPORT_DIR, slug, 'readme.md'), 'utf-8')
    const match = readme.match(/作者名称[：:]\s*(.+)/)
    return match ? match[1].trim() : slug
  } catch {
    return slug
  }
}

/**
 * 将 avatars/ 源图居中裁剪为 512×512 并输出到 content/assets/avatars/
 * @returns {Promise<Record<string, string>>} 作者名 → 公开路径
 */
async function processAvatars() {
  /** @type {Record<string, string>} */
  const authorAvatars = {}

  let files = []
  try {
    files = await readdir(AVATARS_SRC)
  } catch {
    return authorAvatars
  }

  await mkdir(AVATARS_ASSETS, { recursive: true })

  for (const file of files) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue

    const slug = basename(file, extname(file))
    const destFile = `${slug}.jpg`
    const srcPath = join(AVATARS_SRC, file)
    const destPath = join(AVATARS_ASSETS, destFile)

    try {
      await execFileAsync('magick', [
        srcPath,
        '-auto-orient',
        '-resize', '512x512^',
        '-gravity', 'center',
        '-extent', '512x512',
        '-strip',
        '-quality', '85',
        destPath,
      ])
    } catch (err) {
      console.warn(`⚠ 头像处理失败 ${file}:`, err instanceof Error ? err.message : err)
      continue
    }

    const authorName = await readAuthorNameFromImport(slug)
    authorAvatars[authorName] = `/assets/avatars/${destFile}`
  }

  return authorAvatars
}

async function main() {
  const categoriesRaw = await readFile(CATEGORIES_FILE, 'utf-8')
  const { categories } = parseCategoriesYaml(categoriesRaw)
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  await rm(DOCS_ARTICLES, { recursive: true, force: true })
  await mkdir(DOCS_ARTICLES, { recursive: true })
  await rm(PUBLIC_ASSETS, { recursive: true, force: true })
  await mkdir(PUBLIC_ASSETS, { recursive: true })
  await rm(ARTICLE_SOURCES, { recursive: true, force: true })
  await mkdir(ARTICLE_SOURCES, { recursive: true })
  await copyDirIfExists(join(CONTENT_ASSETS, '_defaults'), join(PUBLIC_ASSETS, 'defaults'))
  const authorAvatars = await processAvatars()
  await copyDirIfExists(AVATARS_ASSETS, join(PUBLIC_ASSETS, 'avatars'))
  await mkdir(dirname(ARTICLES_DATA), { recursive: true })

  /** @type {{ text: string, items: { text: string, link: string }[] }[]} */
  const sidebar = []
  /** @type {Record<string, unknown>[]} */
  const articles = []

  for (const category of categories) {
    const srcDir = join(ROOT, category.dir)
    const destDir = join(DOCS_ARTICLES, category.id)
    await mkdir(destDir, { recursive: true })

    let files = []
    try {
      files = await listMarkdownFiles(srcDir)
    } catch {
      files = []
    }

    /** @type {{ title: string, link: string, slug: string }[]} */
    const items = []

    for (const srcFile of files.sort()) {
      const slug = basename(srcFile, '.md')
      const raw = await readFile(srcFile, 'utf-8')
      const { meta, body } = parseFrontmatter(raw)
      const rewrittenBody = rewriteImagePaths(body, slug)

      const assetSrc = join(CONTENT_ASSETS, slug)
      const assetDest = join(PUBLIC_ASSETS, slug)
      await copyDirIfExists(assetSrc, assetDest)

      const title = String(meta.title ?? extractTitleFromBody(body))
      const description = String(meta.description ?? extractDescription(body))
      const author = String(meta.author ?? '团队')
      const date = String(meta.date ?? '1970-01-01')
      const tags = Array.isArray(meta.tags) ? meta.tags : meta.tags ? [String(meta.tags)] : []
      const cover = meta.cover ? String(meta.cover) : null

      const output = serializeFrontmatter(
        { ...meta, title, description, author, date, tags },
        slug,
        category.id,
      ) + rewrittenBody

      await writeFile(join(destDir, `${slug}.md`), output, 'utf-8')

      const sourceDir = join(ARTICLE_SOURCES, category.id)
      await mkdir(sourceDir, { recursive: true })
      await writeFile(join(sourceDir, `${slug}.md`), rewrittenBody, 'utf-8')

      const link = `/articles/${category.id}/${slug}`
      items.push({ title, slug, link })

      articles.push({
        id: `${category.id}/${slug}`,
        slug,
        title,
        description,
        author,
        date,
        tags,
        category: category.id,
        categoryLabel: category.label,
        categoryColor: stripQuotes(category.color ?? '#0b5cab'),
        link,
        cover,
      })
    }

    sidebar.push({
      text: category.label,
      items: items.map(({ title, link }) => ({ text: title, link })),
    })

    console.log(`✓ ${category.label}: ${items.length} 篇`)
  }

  articles.sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const authors = [...new Set(articles.map((a) => a.author))].sort()

  await writeFile(
    ARTICLES_DATA,
    JSON.stringify({ categories, articles, authors, authorAvatars }, null, 2) + '\n',
    'utf-8',
  )
  await writeFile(SIDEBAR_SNIPPET, JSON.stringify(sidebar, null, 2) + '\n', 'utf-8')

  const explorePage = [
    '---',
    'title: 探索课程',
    'description: 按分类、时间与作者浏览全部文章',
    'layout: articles-explore',
    '---',
    '',
  ].join('\n')
  await writeFile(join(ROOT, 'docs', 'explore.md'), explorePage, 'utf-8')

  console.log(`\n同步完成 → ${articles.length} 篇文章，${authors.length} 位作者`)
}

main().catch((err) => {
  console.error('同步失败:', err)
  process.exit(1)
})
