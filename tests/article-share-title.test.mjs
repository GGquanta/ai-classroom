import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  fitTitleTwoLines,
  truncateWithEllipsis,
  wrapToTwoLines,
} from '../scripts/lib/article-share-title.mjs'

function createMockCtx(charWidth = 16) {
  return {
    font: '',
    measureText(text) {
      return { width: text.length * charWidth }
    },
  }
}

describe('article-share-title', () => {
  const titleRegion = { x: 50, y: 24, width: 400, height: 120 }

  describe('wrapToTwoLines', () => {
    it('短标题保持单行', () => {
      const ctx = createMockCtx()
      const lines = wrapToTwoLines(ctx, 'Cursor 使用指南', titleRegion.width)
      assert.equal(lines.length, 1)
      assert.equal(lines[0], 'Cursor 使用指南')
    })

    it('长标题拆成两行', () => {
      const ctx = createMockCtx()
      const longTitle = '这是一篇非常非常长的文章标题用于测试自动换行与排版效果'
      const lines = wrapToTwoLines(ctx, longTitle, 200)
      assert.equal(lines.length, 2)
      assert.ok(lines[0].length > 0)
      assert.ok(lines[1].length > 0)
    })
  })

  describe('truncateWithEllipsis', () => {
    it('超长单行末尾添加省略号', () => {
      const ctx = createMockCtx()
      const truncated = truncateWithEllipsis(ctx, '这是一段需要被截断的超长标题文本内容', 120)
      assert.ok(truncated.endsWith('…'))
      assert.ok(ctx.measureText(truncated).width <= 120)
    })
  })

  describe('fitTitleTwoLines', () => {
    it('短标题使用较大字号且单行展示', () => {
      const ctx = createMockCtx()
      const fitted = fitTitleTwoLines(ctx, 'AI 课堂投稿指南', titleRegion)
      assert.equal(fitted.lines.length, 1)
      assert.ok(fitted.fontSize >= 20)
    })

    it('长标题最多两行并自动缩小字号', () => {
      const ctx = createMockCtx()
      const fitted = fitTitleTwoLines(
        ctx,
        '从零开始搭建团队知识库：VitePress 内容同步、分类筛选与部署实践完整教程',
        titleRegion,
      )
      assert.ok(fitted.lines.length <= 2)
      assert.ok(fitted.fontSize >= 20)
      assert.ok(fitted.lines.every((line) => ctx.measureText(line).width <= titleRegion.width))
    })

    it('极长标题在受限区域内保持不溢出', () => {
      const ctx = createMockCtx()
      const fitted = fitTitleTwoLines(
        ctx,
        '超长标题'.repeat(30),
        { ...titleRegion, width: 160, height: 56 },
      )
      assert.ok(fitted.lines.length <= 2)
      assert.ok(fitted.fontSize >= 20)
      assert.ok(fitted.lines.every((line) => ctx.measureText(line).width <= 160))
    })
  })
})
