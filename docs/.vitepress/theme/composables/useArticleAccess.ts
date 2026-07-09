import { ref, computed } from 'vue'
import protectedConfig from '../../data/protected-config.json'
import protectedContent from '../../data/protected-content.json'
import type { Article } from './useArticles'
import { PBKDF2_SALT, PBKDF2_ITERATIONS } from './articleCryptoConstants'

const STORAGE_KEY = 'ai-classroom-protected-unlocked'
const CONTENT_STORAGE_KEY = 'ai-classroom-protected-content'

export interface EncryptedPayload {
  iv: string
  ciphertext: string
  tag: string
}

export interface DecryptedArticlePayload {
  html: string
  markdown: string
}

const unlocked = ref(initUnlockedState())
const decryptedCache = new Map<string, DecryptedArticlePayload>()

function readUnlockedFromStorage(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(STORAGE_KEY) === 'true'
}

function restoreCacheFromStorage(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  const raw = sessionStorage.getItem(CONTENT_STORAGE_KEY)
  if (!raw) return false
  try {
    const data = JSON.parse(raw) as Record<string, DecryptedArticlePayload>
    decryptedCache.clear()
    for (const [articleId, payload] of Object.entries(data)) {
      decryptedCache.set(articleId, payload)
    }
    return decryptedCache.size > 0
  } catch {
    sessionStorage.removeItem(CONTENT_STORAGE_KEY)
    return false
  }
}

function initUnlockedState(): boolean {
  if (!readUnlockedFromStorage()) return false
  if (restoreCacheFromStorage()) return true
  persistUnlocked(false)
  return false
}

function persistUnlocked(value: boolean) {
  if (typeof sessionStorage === 'undefined') return
  if (value) sessionStorage.setItem(STORAGE_KEY, 'true')
  else {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(CONTENT_STORAGE_KEY)
  }
}

function persistCacheToStorage() {
  if (typeof sessionStorage === 'undefined') return
  const data = Object.fromEntries(decryptedCache)
  sessionStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data))
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function deriveKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(PBKDF2_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

async function decryptPayload(
  payload: EncryptedPayload,
  password: string,
): Promise<string> {
  const key = await deriveKey(password)
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0))
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0))
  const tag = Uint8Array.from(atob(payload.tag), (c) => c.charCodeAt(0))
  const combined = new Uint8Array(ciphertext.length + tag.length)
  combined.set(ciphertext)
  combined.set(tag, ciphertext.length)

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined)
  return new TextDecoder().decode(decrypted)
}

const contentMap = protectedContent as Record<string, EncryptedPayload>
const config = protectedConfig as { passwordHash: string }

export function useArticleAccess() {
  const isUnlocked = computed(() => unlocked.value)

  function isProtectedArticle(article: Pick<Article, 'protected'>) {
    return article.protected === true
  }

  function getDecryptedHtml(articleId: string): string | null {
    return decryptedCache.get(articleId)?.html ?? null
  }

  function getDecryptedMarkdown(articleId: string): string | null {
    return decryptedCache.get(articleId)?.markdown ?? null
  }

  async function verifyAndUnlock(password: string): Promise<boolean> {
    if (!config.passwordHash) return false

    const inputHash = await sha256Hex(password)
    if (inputHash !== config.passwordHash) return false

    decryptedCache.clear()
    for (const [articleId, payload] of Object.entries(contentMap)) {
      try {
        const raw = await decryptPayload(payload, password)
        decryptedCache.set(articleId, JSON.parse(raw) as DecryptedArticlePayload)
      } catch {
        return false
      }
    }

    unlocked.value = true
    persistUnlocked(true)
    persistCacheToStorage()
    return true
  }

  function lock() {
    unlocked.value = false
    decryptedCache.clear()
    persistUnlocked(false)
  }

  return {
    isUnlocked,
    isProtectedArticle,
    getDecryptedHtml,
    getDecryptedMarkdown,
    verifyAndUnlock,
    lock,
  }
}
