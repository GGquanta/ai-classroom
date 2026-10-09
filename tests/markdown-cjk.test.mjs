import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  initProtectedMarkdownRenderer,
  renderMarkdownToHtml,
} from '../scripts/lib/article-crypto.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('CJK emphasis', () => {
  it('中文标点紧挨强调标记时仍渲染为粗体', async () => {
    await initProtectedMarkdownRenderer(ROOT)
    const html = await renderMarkdownToHtml(
      '1. **让主路径朝一个方向走。**从用户、前端、API 到后台处理和存储',
    )

    assert.match(html, /<strong>让主路径朝一个方向走。<\/strong>从用户/)
    assert.equal(html.includes('**'), false)
  })

  it('括号包住的中文强调，以及英文粗体仍可用', async () => {
    await initProtectedMarkdownRenderer(ROOT)
    const html = await renderMarkdownToHtml(
      ['文字**「粗体」**更多', '', 'English **bold** text'].join('\n'),
    )

    assert.match(html, /文字<strong>「粗体」<\/strong>更多/)
    assert.match(html, /English <strong>bold<\/strong> text/)
  })
})
