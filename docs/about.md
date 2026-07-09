# 关于 AI 课堂

**AI 课堂**是团队内部的知识分享站点，用于沉淀大家在 AI 协同办公、AI 赋能开发以及 AI 工具使用方面的经验与资料。

## 目标

- 降低 AI 工具上手门槛，让经验可复用、可检索
- 统一团队对 AI 协同开发的最佳实践认知
- 通过自动化流程，将分散的文档资料汇聚为可访问的公开站点

## 技术栈

- **内容源**：`content/` 目录下的 Markdown 文件
- **站点生成**：[VitePress](https://vitepress.dev/) 静态站点
- **同步脚本**：`scripts/sync-content.mjs`
- **部署**：[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) + Workers Builds（Git 推送自动部署），自定义域名 [ai-classroom.qubitlab.cc](https://ai-classroom.qubitlab.cc)

## 参与贡献

欢迎通过 Pull Request 投稿或改进内容，详见 [投稿指南](/guide/contributing)。

## 许可证

本项目采用 [MIT License](https://github.com/GGquanta/ai-classroom/blob/main/LICENSE) 开源。
