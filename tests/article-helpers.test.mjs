import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_COVERS,
  normalizeColor,
  formatDate,
  getArticleCover,
  isDefaultCover,
  categoryGradient,
  skillName,
  extractImagePaths,
  rewriteImagePathsForSkill,
  yamlQuote,
} from '../scripts/lib/article-helpers.mjs'

describe('article-helpers', () => {
  describe('normalizeColor', () => {
    it('清理引号并校验十六进制色值', () => {
      assert.equal(normalizeColor('"#d97706"'), '#d97706')
      assert.equal(normalizeColor('invalid'), '#0b5cab')
      assert.equal(normalizeColor(''), '#0b5cab')
    })
  })

  describe('formatDate', () => {
    it('格式化有效日期，占位日期显示为日期待定', () => {
      assert.equal(formatDate('1970-01-01'), '日期待定')
      assert.match(formatDate('2026-07-08'), /2026/)
      assert.match(formatDate('2026-07-08'), /7/)
    })
  })

  describe('getArticleCover', () => {
    it('有 cover 时直接返回，否则按 id 稳定映射默认图', () => {
      const custom = { id: 'tools/demo', cover: '/assets/demo/cover.png' }
      assert.equal(getArticleCover(custom), '/assets/demo/cover.png')

      const fallback = { id: 'tools/demo', cover: null }
      const first = getArticleCover(fallback)
      const second = getArticleCover(fallback)
      assert.ok(DEFAULT_COVERS.includes(first))
      assert.equal(first, second)
    })
  })

  describe('isDefaultCover', () => {
    it('识别默认封面路径', () => {
      assert.equal(isDefaultCover(DEFAULT_COVERS[0]), true)
      assert.equal(isDefaultCover('/assets/custom/cover.png'), false)
    })
  })

  describe('categoryGradient', () => {
    it('生成基于分类色的渐变 CSS', () => {
      const gradient = categoryGradient('#0b5cab')
      assert.match(gradient, /^linear-gradient/)
      assert.match(gradient, /#0b5cab/)
    })
  })

  describe('skillName', () => {
    it('将 slug 规范为 skill 目录名', () => {
      assert.equal(skillName('Cursor_Rules'), 'cursor-rules')
      assert.ok(skillName('a'.repeat(80)).length <= 64)
    })
  })

  describe('extractImagePaths', () => {
    it('仅提取当前文章 assets 下的图片', () => {
      const body = `
![a](/assets/demo/a.png)
![b](/assets/other/b.png)
![c](https://example.com/c.png)
`
      assert.deepEqual(extractImagePaths(body, 'demo'), ['/assets/demo/a.png'])
    })
  })

  describe('rewriteImagePathsForSkill', () => {
    it('导出 skill 时将站点绝对路径改为相对 assets/', () => {
      const body = '![截图](/assets/demo/screen.png)'
      assert.equal(
        rewriteImagePathsForSkill(body, 'demo'),
        '![截图](assets/screen.png)',
      )
    })
  })

  describe('yamlQuote', () => {
    it('含特殊字符时加引号并转义', () => {
      assert.equal(yamlQuote('plain'), 'plain')
      assert.equal(yamlQuote('has: colon'), '"has: colon"')
      assert.equal(yamlQuote('say "hi"'), '"say \\"hi\\""')
    })
  })
})
