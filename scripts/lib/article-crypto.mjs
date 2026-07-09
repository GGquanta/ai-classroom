import { createHash, pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto'
import MarkdownIt from 'markdown-it'

export const PBKDF2_SALT = 'ai-classroom-protected'
export const PBKDF2_ITERATIONS = 100_000

const md = new MarkdownIt({ html: false, linkify: true })

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

/** @param {string} markdown */
export function renderMarkdownToHtml(markdown) {
  return md.render(markdown)
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
