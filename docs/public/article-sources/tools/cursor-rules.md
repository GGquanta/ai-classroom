
# Cursor Rules：给 Agent 的持久化项目约定

**Cursor Rules** 是放在 `.cursor/rules/` 下的 `.mdc` 文件，用来把「每次对话都要重复说的约定」写进项目，Agent 会自动读取并遵守。

创建方式：对话输入 `/create-rule`，或在 `.cursor/rules/` 手动新建 `.mdc` 文件。

## 与 AGENTS.md、Skills 的区别

| 机制 | 放什么 | 何时加载 |
| --- | --- | --- |
| `AGENTS.md` | 项目背景、目录结构、协作约定 | 每次对话 |
| **Rules** | 编码规范、文件类型约定、禁止事项 | 始终生效，或编辑匹配文件时 |
| Skills | 完整工作流（审查、做 PPT 等） | 按需 / `@` 引用 |

Rules 适合把 AGENTS.md 里的大块约定拆成更小、更精准的模块。

## 文件格式

```markdown
---
description: 简要说明这条 rule 做什么
globs: content/**/*.md      # 可选，按文件匹配
alwaysApply: false          # true = 每次对话都生效
---

# 规则标题

- 具体、可执行的条目
```

| 字段 | 说明 |
| --- | --- |
| `description` | 规则用途，会显示在 Rule 选择器里 |
| `globs` | 文件匹配模式，编辑对应文件时生效 |
| `alwaysApply` | `true` 时每次对话都注入上下文 |

## 两种生效方式

### 始终生效

适合全项目都要遵守的约定。本仓库示例 `.cursor/rules/project-core.mdc`：

```markdown
---
description: AI 课堂项目核心约定
alwaysApply: true
---

# AI 课堂 — 核心约定

- 内容源在 `content/library/`，**不要**直接改 `docs/articles/`（由 sync 脚本生成）
- 新增文章必须含 frontmatter：title、description、author、date
- VitePress base 为 `/`，本地预览地址为 http://localhost:5173/
- Commit message 使用中文，前缀 feat/fix/docs/chore
- 禁止提交密钥、Token、内网地址
```

### 按文件匹配

适合只在特定文件类型下才需要的规范。本仓库示例 `.cursor/rules/content-markdown.mdc`：

````markdown
---
description: Markdown 投稿内容规范
globs: content/**/*.md
alwaysApply: false
---

# 内容 Markdown 规范

## Frontmatter 模板

```yaml
---
title: 标题
description: 摘要
author: 作者
date: YYYY-MM-DD
tags: []
category: tools
---
```

## 分类目录

- `library/tools/` — AI 工具
- `library/workflows/` — 协同流程
- `library/prompts/` — Prompt 实践
- `library/cases/` — 案例经验

## 注意

- 图片放 `content/assets/<slug>/`
- 勿含敏感信息
````

编辑 `content/library/` 下的 `.md` 时，Agent 会自动知道 frontmatter 模板、分类目录和配图路径。

## 写一个自己的 Rule

例如 TypeScript 错误处理规范，保存为 `.cursor/rules/typescript-errors.mdc`：

````markdown
---
description: TypeScript 错误处理约定
globs: **/*.ts
alwaysApply: false
---

# Error Handling

```typescript
// ❌ BAD — 空 catch，吞掉错误
try {
  await fetchData();
} catch (e) {}

// ✅ GOOD — 记录日志并抛出语义化错误
try {
  await fetchData();
} catch (e) {
  logger.error('Failed to fetch', { error: e });
  throw new DataFetchError('Unable to retrieve data', { cause: e });
}
```
````

## 写法建议

- 一条 rule 只管一件事
- 控制在 50 行以内
- 写「要做什么」，少写背景解释
- 用 ✅/❌ 或列表示例
- 大项目拆成多个 `.mdc`，不要堆在一个文件里

## 延伸阅读

- [Cursor 官方文档](https://docs.cursor.com/)
- 站内：[Cursor Skills：查找、安装、创建与常用推荐](./cursor-skills.md)
