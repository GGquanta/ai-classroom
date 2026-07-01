# 内容目录说明

本目录存放团队收集的 **原始 Markdown 资料**，是站点的内容源（Source of Truth）。

## 目录结构

```
content/
├── _meta/           # 分类、标签等元数据配置
├── inbox/           # 待审核的新投稿
├── library/         # 已审核、可发布的文章
│   ├── tools/       # AI 工具使用
│   ├── workflows/   # 协同办公与开发流程
│   ├── prompts/     # Prompt 与最佳实践
│   └── cases/       # 案例与经验复盘
└── assets/          # 图片等静态资源（按文章 slug 分子目录）
```

## 工作流

1. 作者在 `inbox/` 或 `library/<分类>/` 撰写 Markdown
2. 提交 PR，由维护者审核
3. 合并至 `main` 后，`scripts/sync-content.mjs` 将内容同步至 `docs/articles/`
4. GitHub Actions 构建 VitePress 并部署至 GitHub Pages

## 注意事项

- 请勿在正文中包含密钥、Token、内网地址等敏感信息
- 图片请放在 `assets/` 下，使用相对路径引用
- 详细规范见 [CONTRIBUTING.md](../CONTRIBUTING.md)
