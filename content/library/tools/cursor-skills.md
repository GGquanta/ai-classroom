---
title: Cursor Skills：查找、安装、创建与常用推荐
description: Cursor Agent Skills 的查找安装、自定义创建与常用清单。
author: niuqq
date: 2026-07-06
tags:
  - cursor
  - agent-skills
category: tools
cover: /assets/cursor-skills/cover.png
---

# Cursor Skills：查找、安装、创建与常用推荐

Cursor 的 **Skill** 是给 Agent 用的专项技能包，写好的工作流、规范和工具说明放在 `SKILL.md` 里。对话时用 `@skill-name` 手动引用，或者让 Agent 根据任务自动匹配。

## 查找与安装

用 [skills CLI](https://github.com/vercel-labs/skills) 管理 Skill，也可在 [skills.sh](https://skills.sh) 浏览。

| 场景 | 命令 |
| --- | --- |
| 关键词搜索 | `npx skills find <关键词>` |
| 安装仓库内全部 Skill | `npx skills add <owner/repo>` |
| 只装某一个 | `npx skills add <owner/repo> --skill <name>` |
| 装到全局（跨项目） | `npx skills add <owner/repo> -g` |
| 查看已安装 | `npx skills list` |

```bash
npx skills find react
npx skills add vercel-labs/agent-skills --skill frontend-design
```

安装后 Cursor 会从 `.cursor/skills/`、`~/.cursor/skills/` 等目录自动发现。

## 创建 Skill

**方式 A — Cursor 内置**：对话输入 `/create-skill`，描述用途即可生成。

**方式 B — 手动创建**：

| 位置 | 范围 |
| --- | --- |
| `.cursor/skills/<name>/` | 当前项目 |
| `~/.cursor/skills/<name>/` | 所有项目 |

```markdown
---
name: my-skill
description: 做什么、什么场景下用。第三人称，含触发关键词。
---

# My Skill

## 步骤
1. ...
```

- `name` 与文件夹名一致，小写连字符
- `description` 决定 Agent 是否自动匹配；只想 `@` 手动调用时加 `disable-model-invocation: true`
- 可用 `npx skills init my-skill` 生成脚手架

用 `@my-skill 测试一下` 验证，或在 Customize → Skills 查看。

## 常用 Skill 清单

### 前端 / 大屏

| Skill | 我用来做什么 | 调用示例 |
| --- | --- | --- |
| `frontend-design` | 做页面、大屏 UI，避免千篇一律的「AI 味」渐变模板 | `@frontend-design 做一个深色数据大屏` |
| `echart-skill` | ECharts 图表、Dashboard、数据分析 | `@echart-skill 用这份 CSV 做 Dashboard` |
| `react-best-practices` | React / Next.js 性能与写法审查 | `@react-best-practices 审查这个组件` |

### 研发流程

| Skill | 我用来做什么 | 调用示例 |
| --- | --- | --- |
| `grill-me` | 开工前把需求问清楚，打磨方案 | `@grill-me 帮我把这个功能需求问清楚` |
| `code-reviewer` | PR 前结构化代码审查 | `@code-reviewer 审查本次变更` |
| `pr-creator` | 按仓库模板写 PR 描述 | `@pr-creator 帮我创建 PR` |
| `update-docs` | 改代码后同步更新文档 | `@update-docs 更新 README` |
| `webapp-testing` | Web 应用交互测试 | `@webapp-testing 测一下登录流程` |
| `frontend-code-review` | 前端专项审查 | `@frontend-code-review 审查前端改动` |

### 调研 / 文档

| Skill | 我用来做什么 | 调用示例 |
| --- | --- | --- |
| `tavily-research` | 多源检索，输出带引用的 Markdown 调研报告 | `@tavily-research 调研 Next.js 与 Remix 在大屏场景的优劣` |
| `deep-research` | 生成结构化 Deep Research 提示词，用于 Gemini / Perplexity 等深度调研 | `@deep-research 帮我整理一份技术选型调研提纲` |

### PPT / 演示

| Skill | 我用来做什么 | 调用示例 |
| --- | --- | --- |
| `pptx` | 日常办公 PPT 创建、编辑 | `@pptx 做一份 10 页产品发布 PPT` |
| `slides-to-pptx` | 高颜值 HTML 演示 → 导出 PPTX | `@slides-to-pptx 做科技感路演 deck` |

## 延伸阅读

- 更多 Skill：[skills.sh](https://skills.sh)
