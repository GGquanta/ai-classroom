# AI 课堂

团队 **AI 协同办公、开发赋能与工具使用** 经验的知识分享站点。成员在 `content/` 目录投稿 Markdown 资料，经审核后自动构建为静态网站并发布至 [https://ai-classroom.qubitlab.cc](https://ai-classroom.qubitlab.cc)（Cloudflare Workers + 自定义域名）。

## 功能特性

- **MOOC 式浏览体验**：首页卡片展示最新文章，探索页支持按分类、作者、时间筛选
- **Markdown 投稿**：统一 frontmatter 规范，降低写作门槛
- **自动同步**：`content/library/` → `docs/articles/` + 文章索引 JSON
- **自动部署**：推送至 `main` 后由 Cloudflare Workers Builds 构建发布

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
├── wrangler.jsonc           # Cloudflare Workers 部署配置
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

站点通过 **Cloudflare Workers Builds** 从 GitHub 仓库自动构建并部署，生产域名为 **https://ai-classroom.qubitlab.cc**。

### 仓库内配置

| 文件 | 作用 |
|------|------|
| `wrangler.jsonc` | Workers 静态资源目录、404 处理、自定义域名 |
| `.node-version` | Cloudflare Builds 使用 Node.js 22 |
| `package.json` → `docs:build` | 构建命令（含内容同步 + VitePress） |
| `package.json` → `deploy` | 本地构建并部署 |

构建产物目录：`docs/.vitepress/dist`（由 `wrangler.jsonc` 的 `assets.directory` 指定）。

### 首次绑定 Cloudflare（一次性）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. 选择 **Import from Git**，连接 `GGquanta/ai-classroom` 仓库
3. 配置 **Workers Builds**：
   - **Production branch**：`main`
   - **Build command**：`npm run docs:build`
   - **Deploy command**：`npx wrangler deploy`（默认即可）
   - **Environment variables**：添加 `ARTICLE_ACCESS_PASSWORD`（Encrypt，受保护文章访问密码）
4. 保存后，推送至 `main` 将自动触发构建与部署

本地开发可复制 `.env.example` 为 `.env` 并填写密码。

自定义域名 `ai-classroom.qubitlab.cc` 已在 `wrangler.jsonc` 中声明；首次部署后 Cloudflare 会自动创建 DNS 记录（需 `qubitlab.cc`  zone 在同一账号下）。

### 从 GitHub Pages 迁移

若此前使用 GitHub Pages：

1. 在仓库 **Settings → Pages** 中关闭 GitHub Pages
2. 将 `ai-classroom.qubitlab.cc` 的 DNS 从 GitHub Pages CNAME 改为 Cloudflare Worker 自定义域名（部署后由 Cloudflare 自动管理）

### 本地手动部署

```bash
npm run deploy
```

需先执行 `npx wrangler login` 完成 Cloudflare 认证。

部署地址：https://ai-classroom.qubitlab.cc

## 相关文档

- [AGENTS.md](./AGENTS.md) — AI 编码助手协作上下文
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 贡献与投稿规范
- [content/README.md](./content/README.md) — 内容目录说明

## 许可证

[MIT License](./LICENSE)
