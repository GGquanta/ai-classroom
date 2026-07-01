---
title: 使用 Cursor 进行代码审查
description: 介绍如何在 Pull Request 阶段借助 Cursor Agent 做结构化代码审查，提高审查效率与一致性。
author: 示例作者
date: 2026-06-30
tags:
  - cursor
  - code-review
  - agent
category: tools
---

# 使用 Cursor 进行代码审查

本文介绍一种在 PR 阶段使用 Cursor Agent 辅助代码审查的实践经验。

## 适用场景

- 变更文件较多、人工逐行阅读成本高
- 需要检查安全、性能、风格等固定维度
- 希望审查意见格式统一，便于作者逐条处理

## 基本步骤

1. 在 Cursor 中打开 PR 对应分支
2. 使用 `@PR` 或 diff 视图让 Agent 了解变更范围
3. 给出明确的审查指令，例如：

```
请审查本次变更，重点关注：
1. 是否有潜在的安全问题
2. 错误处理是否完整
3. 是否与项目现有风格一致
输出格式：按文件分组，每条意见标注严重程度（高/中/低）
```

4. 对 Agent 输出的意见进行人工复核，过滤误报后写入 PR 评论

## 注意事项

- Agent 可能遗漏业务逻辑层面的问题，**不能替代人工终审**
- 审查指令越具体，输出质量越高
- 可将常用审查 Prompt 沉淀至 `content/library/prompts/`

## 延伸阅读

- [Cursor 官方文档 — Agent 模式](https://docs.cursor.com/)
