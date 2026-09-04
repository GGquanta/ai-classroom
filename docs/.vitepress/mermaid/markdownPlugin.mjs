import { renderMermaidHtml } from './render.mjs'

/**
 * 拦截 ```mermaid 围栏，用 ELK orthogonal + 主题 CSS 变量 + 自绘 SVG 替换高亮代码块。
 * @param {import('markdown-it').default} md
 */
export function configureMermaidMarkdown(md) {
  const defaultFence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const lang = token.info.trim().split(/\s+/)[0]
    if (lang === 'mermaid') {
      return renderMermaidHtml(token.content)
    }
    return defaultFence(tokens, idx, options, env, slf)
  }
}
