# AGENTS.md — AI 课堂（ai-classroom）

本文件为在本仓库中工作的 **AI 编码助手** 与 **人类协作者** 提供统一上下文：项目目标、目录约定、常用命令与禁止事项。

## 项目一句话

**MOOC 风格的 VitePress 知识站点**：首页卡片 + 探索页多维筛选 + 文章详情页；内容经 `sync-content.mjs` 同步，部署至 **https://ai-classroom.qubitlab.cc**。

## 技术栈

| 组件 | 选型 |
|------|------|
| 静态站点 | [VitePress](https://vitepress.dev/) 1.x |
| 包管理 | npm |
| 运行时 | Node.js ≥ 20 |
| 部署 | Cloudflare Workers Builds（Git 推送自动部署） |
| 内容格式 | Markdown + YAML frontmatter |

## 目录与职责

| 路径 | 职责 | 编辑方式 |
|------|------|----------|
| `content/library/` | **内容源**，团队投稿的文章 | 人工 / PR 投稿 |
| `content/inbox/` | 待审核初稿 | 人工投稿 |
| `content/_meta/categories.yaml` | 分类定义 | 维护者修改 |
| `content/assets/` | 文章配图 | 按文章 slug 分子目录 |
| `import/` | 待导入的原始资料（按作者分子目录） | 人工投稿 / 批量导入 |
| `docs/articles/` | 同步生成的站点文章 | **禁止手改**，由 `npm run sync` 生成 |
| `docs/.vitepress/theme/` | MOOC 自定义主题（首页、探索页、文章卡片） | 维护者修改 |
| `docs/.vitepress/data/articles.json` | 文章索引（sync 生成，供筛选/卡片） | **禁止手改** |
| `docs/explore.md` | 探索页入口 | sync 生成 |
| `docs/index.md`、`docs/about.md`、`docs/guide/` | 站点固定页面 | 可手改 |
| `scripts/sync-content.mjs` | 内容同步脚本 | 按需扩展 |

## 常用命令

```bash
npm install          # 安装依赖
npm run sync         # 同步 content → docs/articles
npm run docs:dev     # 开发服务器（先 sync 再启动）
npm run docs:build   # 生产构建
npm run docs:preview # 预览构建产物
```

## 内容规范

### Frontmatter（必填）

```yaml
---
title: 文章标题
description: 50～120 字摘要
author: 作者
date: YYYY-MM-DD
tags:
  - 标签
category: tools | workflows | prompts | cases
cover: /assets/<slug>/cover.png   # 可选，卡片封面图
---
```

### 新增分类

1. 在 `content/_meta/categories.yaml` 添加条目
2. 创建 `content/library/<id>/` 目录
3. 运行 `npm run sync` 更新 sidebar
4. 无需手改 `docs/.vitepress/config.ts`（sidebar 从 `sidebar.generated.json` 读取）

### 新增文章

1. 在对应 `content/library/<分类>/` 下创建 `.md`
2. 运行 `npm run sync` 或 `npm run docs:dev` 验证
3. 提交 PR

### 从 `import/` 导入文章

`import/` 存放待整理的原始 Markdown 与配图，按**作者**分子目录（如 `import/zhaoyang/`）。

**作者登记（必做）**：每个作者子目录下必须有 `readme.md`，用于记录该目录下所有稿件的统一作者名称，格式如下：

```markdown
作者名称：朝阳
```

**导入流程**：

1. 在 `import/<作者目录>/` 下放置原始稿件（可含子文件夹与配图）
2. 确认同级存在 `readme.md`，且 `作者名称` 已填写
3. 整理为 `content/library/<分类>/` 下的正式文章，frontmatter 中 `author` **必须与** `import/<作者目录>/readme.md` 中的作者名称一致
4. 配图迁至 `content/assets/<slug>/`，运行 `npm run sync` 验证

新增作者目录时，先创建 `import/<目录名>/readme.md` 再投稿，后续该目录下的所有引入文章均沿用此作者名称。

## 编码约定

- **变更范围**：只改与任务相关的文件；不做无关重构
- **docs/articles/**：视为生成目录，修改内容应改 `content/library/` 源文件
- **base 路径**：VitePress `base` 为 `/`（根路径部署）
- **站点域名**：生产环境 `https://ai-classroom.qubitlab.cc`；自定义域名在 `wrangler.jsonc` 的 `routes` 中配置
- **密钥**：禁止在内容或配置中提交 Token、密码、内网地址

## PR / 提交约定

- **Commit message**：使用中文，前缀 `feat:`、`fix:`、`docs:`、`chore:` 等
- **PR 描述**：说明变更类型（内容 / 配置 / 脚本），确认无敏感信息

## 禁止事项

- 禁止直接编辑 `docs/articles/` 下的同步文件（应改 `content/library/`）
- 禁止将 API 密钥、Token 写入内容或 `.env` 并提交
- 禁止在 `docs:build` 失败时强制合并 PR
- 禁止删除他人文章 frontmatter 中的 `author` 字段

## AI 助手工作提示

- 帮用户**写投稿文章**时，文件放在 `content/library/<合适分类>/`，并补全 frontmatter
- 帮用户**从 `import/` 导入文章**时，先读取对应作者目录下的 `readme.md` 获取作者名称，写入 frontmatter 的 `author` 字段
- 帮用户**改站点外观/导航**时，改 `docs/.vitepress/config.ts` 或主题文件
- 帮用户**扩展自动化**时，优先改 `scripts/sync-content.mjs`
- 完成任务后建议运行 `npm run docs:build` 验证构建通过

---

*修订策略：变更目录结构、分类或部署方式时，同步更新本文件与 README.md。*
