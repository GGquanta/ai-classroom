# 贡献指南

感谢你愿意为 AI 课堂贡献内容！本文说明投稿流程、格式规范与审核标准。

## 参与方式

1. Fork 本仓库（或在本仓库创建 feature 分支）
2. 撰写或修改 Markdown 内容
3. 本地预览确认无误
4. 提交 Pull Request
5. 等待审核合并

## 内容存放位置

| 状态 | 路径 |
|------|------|
| 待审核初稿 | `content/inbox/` |
| 已发布文章 | `content/library/<分类>/` |
| 图片资源 | `content/assets/<文章slug>/` |

维护者审核通过后，会将 `inbox/` 中的稿件移至 `library/` 对应分类。

## Frontmatter 规范

每篇文章必须以 YAML frontmatter 开头：

```yaml
---
title: 文章标题
description: 一句话摘要，用于搜索与列表展示
author: 张三
date: 2026-06-30
tags:
  - cursor
  - 示例标签
category: tools
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题，简洁明确 |
| `description` | ✅ | 摘要，建议 50～120 字 |
| `author` | ✅ | 作者姓名或昵称 |
| `date` | ✅ | 日期，格式 `YYYY-MM-DD` |
| `tags` | ❌ | 标签数组，便于检索 |
| `cover` | ❌ | 封面图 URL，建议放 `content/assets/<slug>/` |

## 写作规范

- 使用中文撰写（专有名词除外）
- 一篇文档聚焦一个主题
- 代码块标注语言类型
- 链接使用完整 URL 或相对路径
- 截图放入 `content/assets/<slug>/`，正文可用 `images/xxx.png`（同步时自动转换）
- 可选 `cover` 字段作为卡片封面

## 禁止内容

- API Key、Token、密码等凭证
- 未脱敏的内网 IP、域名、数据库连接串
- 未经授权的机密业务信息
- 侵犯版权的内容

## 本地预览

```bash
npm install
npm run docs:dev
```

访问 [http://localhost:5173/](http://localhost:5173/) 查看效果。

## 审核流程

1. 维护者检查格式与敏感信息
2. CI 自动运行 `npm run docs:build` 验证构建
3. 审核通过后合并，站点自动部署

## 问题反馈

如有疑问，请在 [GitHub Issues](https://github.com/GGquanta/ai-classroom/issues) 中提出。
