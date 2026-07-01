# AI 课堂

团队 **AI 协同办公、开发赋能与工具使用** 经验的知识分享站点。成员在 `content/` 目录投稿 Markdown 资料，经审核后自动构建为静态网站并发布至 [https://ai-classroom.qubitlab.cc](https://ai-classroom.qubitlab.cc)（GitHub Pages + 自定义域名）。

## 功能特性

- **MOOC 式浏览体验**：首页卡片展示最新文章，探索页支持按分类、作者、时间筛选
- **Markdown 投稿**：统一 frontmatter 规范，降低写作门槛
- **自动同步**：`content/library/` → `docs/articles/` + 文章索引 JSON
- **CI/CD**：合并至 `main` 后自动部署

## 项目结构

```
ai-classroom/
├── content/                 # 内容源（投稿入口）
│   ├── _meta/               # 分类配置
│   ├── inbox/               # 待审核投稿
│   ├── library/             # 已发布文章（按分类）
│   └── assets/              # 图片等静态资源
├── docs/                    # VitePress 站点
│   ├── .vitepress/          # 配置、MOOC 自定义主题、articles.json
│   ├── articles/            # 同步生成的文章（勿手改）
│   ├── explore.md           # 探索页（sync 生成）
│   └── guide/               # 站点内指南页
├── import/                  # 待导入的原始资料（按作者分子目录）
├── scripts/                 # 自动化脚本
│   └── sync-content.mjs     # 内容同步
├── .github/workflows/       # CI / 部署
├── AGENTS.md                # AI 助手协作说明
├── CONTRIBUTING.md          # 贡献指南
└── README.md
```

## 快速开始

### 环境要求

- Node.js ≥ 20
- npm ≥ 10

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（含内容同步）
npm run docs:dev
```

浏览器访问 [http://localhost:5173/](http://localhost:5173/)。

### 构建与预览

```bash
npm run docs:build
npm run docs:preview
```

## 投稿流程

1. 在 `content/library/<分类>/` 新建 `.md` 文件
2. 填写 frontmatter（title、description、author、date）
3. 提交 Pull Request
4. 审核合并后站点自动更新

详细规范见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 内容分类

| 分类 | 目录 | 说明 |
|------|------|------|
| AI 工具 | `content/library/tools/` | Cursor、Copilot 等工具技巧 |
| 协同流程 | `content/library/workflows/` | AI 辅助的开发与协作流程 |
| Prompt 实践 | `content/library/prompts/` | Prompt 模板与对话策略 |
| 案例经验 | `content/library/cases/` | 项目案例与复盘 |

## 部署

站点通过 GitHub Actions 部署至 GitHub Pages，默认访问域名为 **https://ai-classroom.qubitlab.cc**。

首次启用需在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**，并在 **Custom domain** 中填写 `ai-classroom.qubitlab.cc`（DNS 需配置 CNAME 指向 GitHub Pages）。

部署地址：https://ai-classroom.qubitlab.cc

## 相关文档

- [AGENTS.md](./AGENTS.md) — AI 编码助手协作上下文
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 贡献与投稿规范
- [content/README.md](./content/README.md) — 内容目录说明

## 许可证

[MIT License](./LICENSE)
