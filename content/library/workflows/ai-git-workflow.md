---
title: AI 辅助的 Git 工作流
description: 在 feature 分支开发中结合 AI 工具完成 commit message 撰写、PR 描述生成与变更摘要。
author: 示例作者
date: 2026-06-30
tags:
  - git
  - workflow
  - pr
category: workflows
---

# AI 辅助的 Git 工作流

团队在日常开发中可借助 AI 工具优化 Git 相关文案工作，减少重复劳动。

## Commit Message

在提交前，让 AI 根据 `git diff` 生成符合 Conventional Commits 规范的中文摘要：

```bash
git diff --staged
```

将 diff 粘贴给 AI，要求输出 `feat:` / `fix:` / `docs:` 等前缀的单行标题。

## Pull Request 描述

PR 模板建议包含：

- **Summary**：变更目的与影响范围
- **Test plan**：验证步骤清单

AI 可根据 commit 历史与 diff 自动生成初稿，作者微调后提交。

## 最佳实践

| 做法 | 说明 |
|------|------|
| 小步提交 | 便于 AI 生成准确的 commit message |
| 明确 scope | 在指令中说明模块名，减少泛化描述 |
| 人工复核 | AI 生成的文案需作者确认后再 push |
