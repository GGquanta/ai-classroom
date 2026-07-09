import { zip } from 'fflate'
import type { Article } from './useArticles'
import { formatDate } from './useArticles'
import { useArticleAccess } from './useArticleAccess'

const SITE_ORIGIN = 'https://ai-classroom.qubitlab.cc'

export async function fetchArticleBody(article: Article): Promise<string> {
  const { isProtectedArticle, isUnlocked, getDecryptedMarkdown } = useArticleAccess()

  if (isProtectedArticle(article)) {
    if (!isUnlocked.value) {
      throw new Error('请先输入访问密码后再导出')
    }
    const markdown = getDecryptedMarkdown(article.id)
    if (!markdown) {
      throw new Error('无法加载文章内容')
    }
    return markdown
  }

  const url = `/article-sources/${article.category}/${article.slug}.md`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`无法加载文章内容（${res.status}）`)
  }
  return res.text()
}

export function buildPrompt(article: Article, body: string): string {
  const tags = article.tags?.length ? article.tags.join('、') : '无'
  const date = formatDate(article.date)

  return `你是一位精通「${article.categoryLabel}」的 AI 助手。请严格依据下方「参考知识」回答用户问题或协助完成任务。

## 行为准则
1. **忠于原文**：优先使用参考知识中的步骤、术语与结论；不得臆造文中未出现的工具、版本或配置项。
2. **结构化输出**：按问题类型组织回答（步骤清单、注意事项、示例），保持与原文相同的逻辑顺序。
3. **边界透明**：参考知识未覆盖的部分，明确标注「文中未涉及」，再基于通用经验给出建议。
4. **可执行性**：涉及工具操作时，给出具体界面、命令或文件路径，避免空泛描述。

## 适用场景
- 分类：${article.categoryLabel}
- 主题：${article.title}
- 标签：${tags}
- 摘要：${article.description}

## 参考知识
> 来源：AI 课堂（${SITE_ORIGIN}${article.link}）
> 作者：${article.author} · ${date}

${body.trim()}`
}

function skillName(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64)
}

function buildSkillDescription(article: Article): string {
  const tagTriggers = article.tags?.length
    ? `Use when working with ${article.tags.join(', ')}.`
    : ''
  const desc = `${article.description} Use when the user asks about ${article.title} or needs guidance on ${article.categoryLabel}. ${tagTriggers}`
  return desc.slice(0, 1024)
}

function buildWhenToUse(article: Article): string {
  const lines = [`- Topics related to ${article.categoryLabel}`]
  if (article.tags?.length) {
    for (const tag of article.tags) {
      lines.push(`- Questions involving ${tag}`)
    }
  }
  lines.push(`- Guidance on: ${article.title}`)
  return lines.join('\n')
}

function extractImagePaths(body: string, slug: string): string[] {
  const prefix = `/assets/${slug}/`
  const paths = new Set<string>()
  const re = /!\[[^\]]*\]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(body)) !== null) {
    const src = match[1].trim()
    if (src.startsWith(prefix)) paths.add(src)
  }
  return [...paths]
}

function rewriteImagePathsForSkill(body: string, slug: string): string {
  const prefix = `/assets/${slug}/`
  return body.replace(
    new RegExp(`!\\[([^\\]]*)\\]\\(${prefix.replace(/\//g, '\\/')}([^)]+)\\)`, 'g'),
    '![$1](assets/$2)',
  )
}

function yamlQuote(value: string): string {
  if (/[:#"'\n]/.test(value) || value.startsWith(' ') || value.endsWith(' ')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value
}

function buildSkillMarkdown(article: Article, body: string): string {
  const name = skillName(article.slug)
  const skillBody = rewriteImagePathsForSkill(body, article.slug)

  return `---
name: ${name}
description: ${yamlQuote(buildSkillDescription(article))}
metadata:
  author: ${yamlQuote(article.author)}
  source: ${SITE_ORIGIN}${article.link}
  version: "1.0.0"
---

# ${article.title}

${article.description}

## When to Use

Use this skill when the user needs guidance on:

${buildWhenToUse(article)}

## Instructions

${skillBody.trim()}

## Source

Originally published on AI 课堂 by ${article.author} (${formatDate(article.date)}).
`
}

function buildSkillReadme(name: string): string {
  return `# ${name}

Agent Skill exported from [AI 课堂](${SITE_ORIGIN}).

## Install

Unzip and copy the \`${name}/\` folder to one of:

| Agent | Project path | Global path |
|-------|--------------|-------------|
| Cursor | \`.cursor/skills/${name}/\` | \`~/.cursor/skills/${name}/\` |
| Claude Code | \`.claude/skills/${name}/\` | \`~/.claude/skills/${name}/\` |
| Generic agents | \`.agents/skills/${name}/\` | \`~/.agents/skills/${name}/\` |

Or install with the skills CLI:

\`\`\`bash
npx skills add ./${name}
\`\`\`
`
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`无法加载图片：${url}`)
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

function zipToBlob(files: Record<string, Uint8Array>): Promise<Blob> {
  return new Promise((resolve, reject) => {
    zip(files, (err, data) => {
      if (err) reject(err)
      else resolve(new Blob([data], { type: 'application/zip' }))
    })
  })
}

export async function buildSkillZip(article: Article, body: string): Promise<Blob> {
  const name = skillName(article.slug)
  const files: Record<string, Uint8Array> = {}

  const skillMd = buildSkillMarkdown(article, body)
  files[`${name}/SKILL.md`] = new TextEncoder().encode(skillMd)
  files[`${name}/README.md`] = new TextEncoder().encode(buildSkillReadme(name))

  const imagePaths = extractImagePaths(body, article.slug)
  await Promise.all(
    imagePaths.map(async (src) => {
      const filename = src.split('/').pop()!
      const bytes = await fetchImageBytes(src)
      files[`${name}/assets/${filename}`] = bytes
    }),
  )

  return zipToBlob(files)
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!ok) throw new Error('当前浏览器不支持复制到剪贴板')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
