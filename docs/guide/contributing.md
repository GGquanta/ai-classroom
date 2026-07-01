# 如何投稿

本文说明如何向 AI 课堂提交一篇经验分享文章。

## 快速流程

1. Fork 本仓库（或直接在本仓库创建分支）
2. 在 `content/library/<分类>/` 下新建 Markdown 文件
3. 填写 frontmatter 元数据
4. 提交 Pull Request
5. 审核合并后，站点将自动更新

## 目录与分类

| 目录 | 适用内容 |
|------|----------|
| `content/library/tools/` | AI 工具使用技巧（Cursor、Copilot 等） |
| `content/library/workflows/` | 协同办公与开发流程 |
| `content/library/prompts/` | Prompt 模板与对话策略 |
| `content/library/cases/` | 项目案例与经验复盘 |

待审核的初稿可暂存于 `content/inbox/`，由维护者归档至 `library/`。

## Frontmatter 规范

每篇文章顶部需包含 YAML frontmatter：

```yaml
---
title: 文章标题
description: 一句话摘要，用于 SEO 与列表展示
author: 作者姓名或昵称
date: 2026-06-30
tags:
  - cursor
  - 代码审查
category: tools
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题 |
| `description` | 是 | 摘要，建议 50～120 字 |
| `author` | 是 | 作者 |
| `date` | 是 | 发布日期，格式 `YYYY-MM-DD` |
| `tags` | 否 | 标签列表 |
| `category` | 否 | 分类，与所在目录一致 |

## 写作建议

- 一篇文档聚焦一个主题，避免过长
- 使用二级、三级标题组织内容
- 代码示例注明语言与运行环境
- 截图放入 `content/assets/<文章slug>/` 并在文中引用
- 敏感信息（密钥、内网地址）不得出现在正文中

## 本地预览

```bash
npm install
npm run docs:dev
```

浏览器访问 `http://localhost:5173/` 预览效果。

## 审核标准

- 内容真实、可复现
- 格式符合 frontmatter 规范
- 无敏感信息与版权问题
- 语言清晰，对团队有实际参考价值
