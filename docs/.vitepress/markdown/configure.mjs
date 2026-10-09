import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
import { configureMermaidMarkdown } from '../mermaid/markdownPlugin.mjs'

/**
 * 站点统一的 Markdown 配置。
 * CommonMark 在强调标记紧挨中文标点时不会闭合，例如「**朝一个方向走。**从左到右」。
 * @param {import('markdown-it').default} md
 */
export function configureSiteMarkdown(md) {
  md.use(markdownItCjkFriendly)
  configureMermaidMarkdown(md)
}
