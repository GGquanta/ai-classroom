import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  sanitizeMermaidSource,
  applySiteSvgTheme,
  renderSiteMermaid,
  renderMermaidHtml,
} from '../docs/.vitepress/mermaid/render.mjs'
import {
  initProtectedMarkdownRenderer,
  renderMarkdownToHtml,
} from '../scripts/lib/article-crypto.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const FLOWCHART = `flowchart LR
    A[一张截面图片] --> B[识别轮廓]
    B --> C[生成二维截面]
`

describe('mermaid sanitizer', () => {
  it('剥掉 YAML frontmatter、远程图片与 click 外链', () => {
    const source = [
      '---',
      'title: secret',
      '---',
      'flowchart LR',
      '    A --> B',
      '    click A "https://evil.example/leak"',
      '    A --- C["![](https://evil.example/pixel.png)"]',
    ].join('\n')

    const cleaned = sanitizeMermaidSource(source)
    assert.match(cleaned, /^flowchart LR/)
    assert.equal(cleaned.includes('title: secret'), false)
    assert.equal(cleaned.includes('https://'), false)
    assert.equal(/^\s*click\s/m.test(cleaned), false)
  })
})

describe('mermaid svg renderer', () => {
  it('用主题 CSS 变量自绘 SVG，不引入远程字体', () => {
    const { svg, error } = renderSiteMermaid(FLOWCHART)
    assert.equal(error, null)
    assert.match(svg, /^<svg /)
    assert.match(svg, /--fg:var\(--mooc-text\)/)
    assert.match(svg, /--accent:var\(--mooc-primary\)/)
    assert.equal(svg.includes('<style'), false)
    assert.equal(svg.includes('fonts.googleapis.com'), false)
  })

  it('applySiteSvgTheme 去掉内联 style 与远程资源', () => {
    const raw = [
      '<svg style="--bg:var(--mooc-surface)">',
      '<style>text { font-family: Inter; }</style>',
      '<image href="https://evil.example/x.png" />',
      '</svg>',
    ].join('\n')

    const cleaned = applySiteSvgTheme(raw)
    assert.equal(cleaned.includes('<style'), false)
    assert.equal(cleaned.includes('fonts.googleapis.com'), false)
    assert.equal(cleaned.includes('https://evil.example'), false)
    assert.match(cleaned, /--bg:var\(--mooc-surface\)/)
  })

  it('同页多图时 marker id 不冲突', () => {
    const first = renderSiteMermaid(FLOWCHART).svg
    const second = renderSiteMermaid(FLOWCHART).svg
    const ids = (svg) => [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    const firstIds = new Set(ids(first))
    const secondIds = new Set(ids(second))
    for (const id of firstIds) {
      assert.equal(secondIds.has(id), false, `duplicate id ${id}`)
    }
    assert.match(first, /url\(#arrowhead-[^)]+\)/)
  })

  it('不支持的图类型回退为错误而不是抛出', () => {
    const { svg, error } = renderSiteMermaid('pie title Pets\n  "Dogs": 386')
    assert.equal(svg, '')
    assert.match(error ?? '', /Invalid mermaid header/)
  })
})

describe('mermaid markdown fence', () => {
  it('渲染容器带 beautiful-mermaid 标记与内联 SVG', () => {
    const html = renderMermaidHtml(FLOWCHART)
    assert.match(html, /data-renderer="beautiful-mermaid"/)
    assert.match(html, /class="mermaid-diagram"/)
    assert.match(html, /v-pre/)
    assert.match(html, /<svg /)
  })

  it('受保护文章 Markdown 渲染器同样输出 SVG 而不是代码块', async () => {
    await initProtectedMarkdownRenderer(ROOT)
    const html = await renderMarkdownToHtml(['```mermaid', FLOWCHART, '```'].join('\n'))
    assert.match(html, /data-renderer="beautiful-mermaid"/)
    assert.match(html, /<svg /)
    assert.equal(html.includes('language-mermaid'), false)
  })
})
