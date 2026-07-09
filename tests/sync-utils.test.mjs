import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isProtectedFlag,
  stripQuotes,
  parseCategoriesYaml,
  parseFrontmatter,
  serializeFrontmatter,
  rewriteImagePaths,
  extractTitleFromBody,
  extractDescription,
} from '../scripts/lib/sync-utils.mjs'

describe('sync-utils', () => {
  describe('isProtectedFlag', () => {
    it('识别 boolean 与字符串形式的 protected 标记', () => {
      assert.equal(isProtectedFlag(true), true)
      assert.equal(isProtectedFlag('true'), true)
      assert.equal(isProtectedFlag(false), false)
      assert.equal(isProtectedFlag('false'), false)
      assert.equal(isProtectedFlag(undefined), false)
    })
  })

  describe('stripQuotes', () => {
    it('去除首尾引号', () => {
      assert.equal(stripQuotes('"#d97706"'), '#d97706')
      assert.equal(stripQuotes("'#0b5cab'"), '#0b5cab')
      assert.equal(stripQuotes('#0b5cab'), '#0b5cab')
    })
  })

  describe('parseCategoriesYaml', () => {
    it('解析分类列表', () => {
      const raw = `
- id: tools
  label: AI 工具
  dir: content/library/tools
  color: "#0b5cab"
- id: cases
  label: 案例经验
  dir: content/library/cases
  color: "#d97706"
`
      const { categories } = parseCategoriesYaml(raw)
      assert.equal(categories.length, 2)
      assert.equal(categories[0].id, 'tools')
      assert.equal(categories[0].color, '#0b5cab')
      assert.equal(categories[1].label, '案例经验')
    })
  })

  describe('parseFrontmatter', () => {
    it('解析标量、列表与布尔 frontmatter', () => {
      const raw = `---
title: 测试文章
author: 作者
tags:
  - cursor
  - test
protected: true
---

# 正文
`
      const { meta, body } = parseFrontmatter(raw)
      assert.equal(meta.title, '测试文章')
      assert.deepEqual(meta.tags, ['cursor', 'test'])
      assert.equal(meta.protected, true)
      assert.match(body.trim(), /^# 正文/)
    })

    it('无 frontmatter 时返回原文', () => {
      const raw = '# 只有正文'
      const { meta, body } = parseFrontmatter(raw)
      assert.deepEqual(meta, {})
      assert.equal(body, raw)
    })
  })

  describe('serializeFrontmatter', () => {
    it('输出固定字段顺序并注入 sidebar/aside 默认值', () => {
      const output = serializeFrontmatter(
        { title: '标题', author: '作者', date: '2026-01-01', tags: ['a'] },
        'slug',
        'tools',
      )

      assert.match(output, /^---\n/)
      assert.match(output, /title: 标题/)
      assert.match(output, /category: tools/)
      assert.match(output, /sidebar: false/)
      assert.match(output, /aside: true/)
      assert.match(output, /tags:\n  - a/)
    })
  })

  describe('rewriteImagePaths', () => {
    it('将相对 images 路径改写为 /assets/<slug>/', () => {
      const body = '![图](images/a.png) 和 ![图](./images/b.png)'
      const rewritten = rewriteImagePaths(body, 'demo-article')
      assert.equal(
        rewritten,
        '![图](/assets/demo-article/a.png) 和 ![图](/assets/demo-article/b.png)',
      )
    })
  })

  describe('extractTitleFromBody', () => {
    it('从首个一级标题提取标题', () => {
      assert.equal(extractTitleFromBody('## 二级\n# 一级标题\n'), '一级标题')
      assert.equal(extractTitleFromBody('无标题'), '未命名文章')
    })
  })

  describe('extractDescription', () => {
    it('跳过标题、引用与图片，截取合适段落', () => {
      const body = `
# 标题

> 引用

![图](images/x.png)

这是足够长的一段正文摘要，用于自动生成 description 字段。
`
      const description = extractDescription(body)
      assert.match(description, /这是足够长的一段正文摘要/)
      assert.ok(description.length <= 120)
    })
  })
})
