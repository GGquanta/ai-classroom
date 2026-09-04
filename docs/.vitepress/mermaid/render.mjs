import { renderMermaidSVG } from 'beautiful-mermaid'

/**
 * Cursor Preview / Plan 同款布局参数：ELK layered + orthogonal 折线。
 * beautiful-mermaid 默认已是 40 / 28 / 48，这里显式锁定，避免升级漂移。
 */
export const SITE_MERMAID_LAYOUT = {
  padding: 40,
  nodeSpacing: 28,
  layerSpacing: 48,
}

/** 主题 token → beautiful-mermaid 的 CSS 变量（节点色用 color-mix 从 --fg/--bg 派生） */
export const SITE_MERMAID_THEME = {
  bg: 'var(--mooc-surface)',
  fg: 'var(--mooc-text)',
  accent: 'var(--mooc-primary)',
  muted: 'var(--mooc-muted)',
  surface: 'var(--mooc-bg)',
  border: 'var(--mooc-border)',
  font: 'var(--mooc-font)',
  transparent: true,
}

/**
 * 渲染前剥掉 YAML frontmatter、远程图片与外链 click，避免图里夹带数据。
 * @param {string} source
 */
export function sanitizeMermaidSource(source) {
  let text = String(source ?? '').replace(/^\uFEFF/, '')
  text = text.replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '')
  text = text.replace(/!\[[^\]]*]\(\s*https?:\/\/[^)]+\)/gi, '')
  text = text.replace(/<img\b[^>]*>/gi, '')
  text = text.replace(/^\s*click\s+\S+.*$/gim, '')
  return text.trim()
}

/**
 * 去掉 SVG 内联 <style>（Vue 会把它当组件 style 块报错），并剥离远程资源。
 * 派生色与字体改由 mermaid.css 提供。
 * @param {string} svg
 */
export function applySiteSvgTheme(svg) {
  return svg
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s(?:href|xlink:href|src)="https?:[^"]*"/gi, '')
}

let renderSeq = 0

/** @param {string} text */
function shortHash(text) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

/**
 * 同页多图时避免 marker / node id 冲突。
 * @param {string} svg
 * @param {string} suffix
 */
export function uniquifySvgIds(svg, suffix) {
  return svg
    .replace(/\bid="([^"]+)"/g, (_match, id) => `id="${id}-${suffix}"`)
    .replace(/url\(#([^)]+)\)/g, (_match, id) => `url(#${id}-${suffix})`)
}

/**
 * 把 Mermaid 源码画成 SVG（ELK orthogonal + 主题 CSS 变量 + 自绘路径）。
 * @param {string} source
 * @returns {{ svg: string, error: string | null }}
 */
export function renderSiteMermaid(source) {
  const sanitized = sanitizeMermaidSource(source)
  if (!sanitized) {
    return { svg: '', error: '空的 mermaid 图' }
  }

  try {
    const svg = uniquifySvgIds(
      applySiteSvgTheme(
        renderMermaidSVG(sanitized, {
          ...SITE_MERMAID_THEME,
          ...SITE_MERMAID_LAYOUT,
        }),
      ),
      `${shortHash(sanitized)}-${++renderSeq}`,
    )
    return { svg, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { svg: '', error: message }
  }
}

/** @param {string} text */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 生成可直接写入 Markdown HTML 的图容器（含 v-pre，避免 Vue 编译 SVG）。
 * @param {string} source
 */
export function renderMermaidHtml(source) {
  const { svg, error } = renderSiteMermaid(source)

  if (error || !svg) {
    const fallback = escapeHtml(String(source ?? '').trim())
    const message = escapeHtml(error ?? '渲染失败')
    return [
      '<div class="mermaid-diagram mermaid-diagram--error" data-renderer="beautiful-mermaid">',
      `  <p class="mermaid-diagram__error">${message}</p>`,
      `  <pre class="mermaid-diagram__fallback"><code>${fallback}</code></pre>`,
      '</div>\n',
    ].join('\n')
  }

  return [
    '<div class="mermaid-diagram" data-renderer="beautiful-mermaid" v-pre>',
    svg,
    '</div>\n',
  ].join('\n')
}
