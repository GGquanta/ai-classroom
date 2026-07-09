#!/usr/bin/env node
/**
 * 将 content/library/ 同步至 docs/articles/，复制静态资源，
 * 生成 articles.json 索引与 sidebar 配置。
 */
import { readFile, writeFile, readdir, mkdir, rm, cp } from 'node:fs/promises'
import { join, relative, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  hashPassword,
  encryptArticlePayload,
  initProtectedMarkdownRenderer,
  renderMarkdownToHtml,
} from './lib/article-crypto.mjs'
import {
  isProtectedFlag,
  stripQuotes,
  parseCategoriesYaml,
  parseFrontmatter,
  serializeFrontmatter,
  rewriteImagePaths,
  extractTitleFromBody,
  extractDescription,
} from './lib/sync-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_ARTICLES = join(ROOT, 'docs', 'articles')
const CATEGORIES_FILE = join(ROOT, 'content', '_meta', 'categories.yaml')
const SIDEBAR_SNIPPET = join(ROOT, 'docs', '.vitepress', 'sidebar.generated.json')
const ARTICLES_DATA = join(ROOT, 'docs', '.vitepress', 'data', 'articles.json')
const PROTECTED_CONTENT = join(ROOT, 'docs', '.vitepress', 'data', 'protected-content.json')
const PROTECTED_CONFIG = join(ROOT, 'docs', '.vitepress', 'data', 'protected-config.json')
const PUBLIC_ASSETS = join(ROOT, 'docs', 'public', 'assets')
const ARTICLE_SOURCES = join(ROOT, 'docs', 'public', 'article-sources')
const CONTENT_ASSETS = join(ROOT, 'content', 'assets')
const AVATARS_ASSETS = join(CONTENT_ASSETS, 'avatars')
const IMPORT_DIR = join(ROOT, 'import')

const PROTECTED_PLACEHOLDER = `> 本文受密码保护。请在下方输入访问密码以阅读全文。

`

/** @typedef {{ id: string, label: string, dir: string, description?: string, color?: string }} Category */

/** @typedef {{ title: string, description: string, author: string, date: string, tags: string[], category: string, cover?: string, layout?: string, sidebar?: boolean }} ArticleMeta */

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
 * 从 content/assets/avatars/ 读取已处理头像，按 import/<slug>/readme.md 映射作者名
 * @returns {Promise<Record<string, string>>} 作者名 → 公开路径
 */
async function collectAuthorAvatars() {
  /** @type {Record<string, string>} */
  const authorAvatars = {}

  let files = []
  try {
    files = await readdir(AVATARS_ASSETS)
  } catch {
    return authorAvatars
  }

  for (const file of files) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue

    const slug = basename(file, extname(file))
    const authorName = await readAuthorNameFromImport(slug)
    authorAvatars[authorName] = `/assets/avatars/${file}`
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
  const authorAvatars = await collectAuthorAvatars()
  await copyDirIfExists(AVATARS_ASSETS, join(PUBLIC_ASSETS, 'avatars'))
  await mkdir(dirname(ARTICLES_DATA), { recursive: true })

  /** @type {{ text: string, items: { text: string, link: string }[] }[]} */
  const sidebar = []
  /** @type {Record<string, unknown>[]} */
  const articles = []
  /** @type {Record<string, { iv: string, ciphertext: string, tag: string }>} */
  const protectedContent = {}
  let hasProtectedArticles = false

  const accessPassword = process.env.ARTICLE_ACCESS_PASSWORD?.trim() || ''

  await initProtectedMarkdownRenderer(ROOT)

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
      const isProtected = isProtectedFlag(meta.protected)
      const articleId = `${category.id}/${slug}`

      if (isProtected) {
        hasProtectedArticles = true
        if (!accessPassword) {
          throw new Error(
            `文章「${title}」标记为 protected，但未设置 ARTICLE_ACCESS_PASSWORD。\n` +
              '请在 .env 中配置密码后重试（可参考 .env.example）。',
          )
        }

        const html = await renderMarkdownToHtml(rewrittenBody)
        protectedContent[articleId] = encryptArticlePayload(html, rewrittenBody, accessPassword)

        const output = serializeFrontmatter(
          { ...meta, title, description, author, date, tags, protected: true },
          slug,
          category.id,
        ) + PROTECTED_PLACEHOLDER

        await writeFile(join(destDir, `${slug}.md`), output, 'utf-8')
      } else {
        const output = serializeFrontmatter(
          { ...meta, title, description, author, date, tags },
          slug,
          category.id,
        ) + rewrittenBody

        await writeFile(join(destDir, `${slug}.md`), output, 'utf-8')

        const sourceDir = join(ARTICLE_SOURCES, category.id)
        await mkdir(sourceDir, { recursive: true })
        await writeFile(join(sourceDir, `${slug}.md`), rewrittenBody, 'utf-8')
      }

      const link = `/articles/${category.id}/${slug}`
      items.push({ title, slug, link })

      articles.push({
        id: articleId,
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
        ...(isProtected ? { protected: true } : {}),
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
  await writeFile(PROTECTED_CONTENT, JSON.stringify(protectedContent, null, 2) + '\n', 'utf-8')
  await writeFile(
    PROTECTED_CONFIG,
    JSON.stringify(
      {
        passwordHash: hasProtectedArticles ? hashPassword(accessPassword) : '',
      },
      null,
      2,
    ) + '\n',
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
