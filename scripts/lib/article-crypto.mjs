import { createHash, pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
import { join } from 'node:path'
import { createMarkdownRenderer } from 'vitepress'

export const PBKDF2_SALT = 'ai-classroom-protected'
export const PBKDF2_ITERATIONS = 100_000

/** @type {import('markdown-it').default | null} */
let markdownRenderer = null

/** @param {string} rootDir 仓库根目录 */
export async function initProtectedMarkdownRenderer(rootDir) {
  if (markdownRenderer) return markdownRenderer

  markdownRenderer = await createMarkdownRenderer(
    join(rootDir, 'docs'),
    {},
    '/',
    console,
  )

  return markdownRenderer
}

/** @param {string} password */
export function hashPassword(password) {
  return createHash('sha256').update(password, 'utf8').digest('hex')
}

/** @param {string} password */
export function deriveKey(password) {
  return pbkdf2Sync(password, PBKDF2_SALT, PBKDF2_ITERATIONS, 32, 'sha256')
}

/**
 * @param {string} plaintext
 * @param {string} password
 * @returns {{ iv: string, ciphertext: string, tag: string }}
 */
export function encryptContent(plaintext, password) {
  const key = deriveKey(password)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    iv: iv.toString('base64'),
    ciphertext: encrypted.toString('base64'),
    tag: tag.toString('base64'),
  }
}

/**
 * @param {{ iv: string, ciphertext: string, tag: string }} payload
 * @param {string} password
 */
export function decryptContent(payload, password) {
  const key = deriveKey(password)
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

/** @param {string} markdown */
export async function renderMarkdownToHtml(markdown) {
  if (!markdownRenderer) {
    throw new Error('受保护文章 Markdown 渲染器未初始化，请先调用 initProtectedMarkdownRenderer')
  }

  return markdownRenderer.render(markdown)
}

/**
 * @param {string} html
 * @param {string} markdown
 * @param {string} password
 */
export function encryptArticlePayload(html, markdown, password) {
  const payload = JSON.stringify({ html, markdown })
  return encryptContent(payload, password)
}

/**
 * @param {{ iv: string, ciphertext: string, tag: string }} payload
 * @param {string} password
 * @returns {{ html: string, markdown: string }}
 */
export function decryptArticlePayload(payload, password) {
  const raw = decryptContent(payload, password)
  return JSON.parse(raw)
}
