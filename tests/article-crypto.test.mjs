import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash, pbkdf2Sync } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PBKDF2_SALT,
  PBKDF2_ITERATIONS,
  hashPassword,
  encryptContent,
  decryptContent,
  encryptArticlePayload,
  decryptArticlePayload,
  initProtectedMarkdownRenderer,
  renderMarkdownToHtml,
} from '../scripts/lib/article-crypto.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('article-crypto', () => {
  it('hashPassword 输出稳定的 SHA-256 十六进制', () => {
    const hash = hashPassword('test-password')
    const expected = createHash('sha256').update('test-password', 'utf8').digest('hex')
    assert.equal(hash, expected)
    assert.match(hash, /^[0-9a-f]{64}$/)
  })

  it('encryptContent / decryptContent 可往返解密', () => {
    const password = 'room-secret'
    const plaintext = '受保护的正文内容'
    const encrypted = encryptContent(plaintext, password)

    assert.ok(encrypted.iv)
    assert.ok(encrypted.ciphertext)
    assert.ok(encrypted.tag)

    const decrypted = decryptContent(encrypted, password)
    assert.equal(decrypted, plaintext)
  })

  it('错误密码无法解密', () => {
    const encrypted = encryptContent('secret', 'correct-password')
    assert.throws(() => decryptContent(encrypted, 'wrong-password'))
  })

  it('encryptArticlePayload 保留 html 与 markdown 字段', () => {
    const password = 'export-key'
    const html = '<p>Hello</p>'
    const markdown = '# Hello'
    const encrypted = encryptArticlePayload(html, markdown, password)
    const payload = decryptArticlePayload(encrypted, password)

    assert.equal(payload.html, html)
    assert.equal(payload.markdown, markdown)
  })
})

describe('protected markdown renderer', () => {
  it('代码块输出与 VitePress 一致的结构（含复制按钮与高亮）', async () => {
    await initProtectedMarkdownRenderer(ROOT)
    const html = await renderMarkdownToHtml('```python\nclass Stage:\n    pass\n```')

    assert.match(html, /class="language-python/)
    assert.match(html, /<button title="Copy Code" class="copy">/)
    assert.match(html, /class="shiki/)
    assert.match(html, /vp-code/)
  })
})

/**
 * 模拟浏览器 useArticleAccess 中的 Web Crypto 解密逻辑
 * @param {{ iv: string, ciphertext: string, tag: string }} payload
 * @param {string} password
 */
async function browserStyleDecrypt(payload, password) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
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

  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0))
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0))
  const tag = Uint8Array.from(atob(payload.tag), (c) => c.charCodeAt(0))
  const combined = new Uint8Array(ciphertext.length + tag.length)
  combined.set(ciphertext)
  combined.set(tag, ciphertext.length)

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined)
  return new TextDecoder().decode(decrypted)
}

describe('crypto 跨端兼容（Node 加密 → Web Crypto 解密）', () => {
  it('浏览器端解密逻辑可解开 sync 生成的密文', async () => {
    const password = 'cross-platform-test'
    const encrypted = encryptArticlePayload('<p>正文</p>', '# 正文', password)
    const raw = await browserStyleDecrypt(encrypted, password)
    const payload = JSON.parse(raw)

    assert.equal(payload.html, '<p>正文</p>')
    assert.equal(payload.markdown, '# 正文')
  })

  it('Node pbkdf2 与 Web Crypto deriveKey 生成相同 AES 密钥材料', async () => {
    const password = 'key-compare'
    const nodeKey = pbkdf2Sync(password, PBKDF2_SALT, PBKDF2_ITERATIONS, 32, 'sha256')

    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(PBKDF2_SALT),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256,
    )
    const webKey = Buffer.from(bits)

    assert.equal(nodeKey.compare(webKey), 0)
  })
})
