---
title: 文档站点从 0 到 1 的 AI 协作案例
description: 使用 AI 助手初始化 VitePress 知识库项目、编写同步脚本与 CI 配置的实践复盘。
author: 示例作者
date: 2026-06-01
tags:
  - vitepress
  - github-pages
  - case-study
category: cases
---

# 文档站点从 0 到 1 的 AI 协作案例

本案例记录如何利用 AI 助手快速搭建团队知识分享站点。

## 背景

团队积累了大量 AI 工具使用笔记，分散在个人文档与聊天记录中，检索困难。

## 方案

1. 统一 Markdown 格式与 frontmatter 规范
2. 使用 VitePress 生成静态站点
3. 编写同步脚本，将 `content/` 自动映射至 `docs/articles/`
4. GitHub Actions 部署至 GitHub Pages

## 关键决策

| 决策 | 理由 |
|------|------|
| VitePress 而非 Docusaurus | 内容以 Markdown 为主，无需复杂版本化，构建更快 |
| content/ 与 docs/ 分离 | 投稿者只需关注 content/，降低参与门槛 |
| 本地搜索 | 无需 Algolia 等外部服务，适合内部知识库规模 |

## 经验总结

- 先定目录结构与文档规范，再批量迁移内容
- 提供 1～2 篇示例文章，比长篇规范更易被接受
- CI 构建应在 PR 阶段就跑通，避免合并后才发现问题
