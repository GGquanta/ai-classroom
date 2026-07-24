---
title: 优秀 Agent Skills 集合：站点盘点与应用笔记
description: 按工程流程、设计品味、官方规范与专项工艺盘点高信号 Agent Skills 仓库，附选型组合与团队落地清单。
author: 朝阳
date: 2026-07-24
tags:
  - agent-skills
  - cursor
  - skills
category: tools
cover: /assets/agent-skills-collection/01-skills-as-sop.png
protected: true
---

# 优秀 Agent Skills 集合：站点盘点与应用笔记

数据口径：GitHub Star / Fork / Watcher / Open Issues，采集于 2026-07-17。Star 反映传播热度，不等于生产可用性；Fork 比例可粗略衡量「愿意拷走改」的工程倾向。

Agent Skills（智能体技能包）正在变成 AI 编程工作流里的「可版本化操作规程」：一段 `SKILL.md`、若干参考文档、偶尔附带脚本，装进 Cursor / Claude Code / Codex 后，模型在特定任务上会少踩坑、少出同质化界面。下面按「工程流程 → 设计品味 → 官方工程规范 → 专项工艺」梳理一批高信号仓库与站点，方便团队选型、沉淀和二次封装。

---

## 1. 一张表看清格局

| 仓库 / 站点 | Star | Fork | Watcher | Open Issues | 创建时间 | 定位一句话 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 174,611 | 14,977 | 991 | 181 | 2026-02 | 真工程流程：对齐、规格、TDD、架构 |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 64,351 | 4,419 | 203 | 46 | 2026-02 | 反同质化前端「品味」框架 |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) · [impeccable.style](https://impeccable.style) | 47,394 | 2,743 | 124 | 35 | 2025-11 | 设计词汇 + 23 命令 + 确定性检测 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 29,147 | 2,612 | 120 | 159 | 2025-12 | Vercel 官方：性能、部署、写作规范 |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | 14,844 | 810 | 56 | 4 | 2026-03 | 动效与 Design Engineering 细则 |
| [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | 4,420 | 186 | 12 | 9 | 2026-01 | CLI 路由的 UI 技能集 |
| [MengTo/Skills](https://github.com/MengTo/Skills) | 2,315 | 259 | 10 | 2 | 2026-02 | 约 77 个落地页 / WebGL / 提示词工作流 |
| [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | 534 | 11 | 4 | 0 | 2026-07 | 颜色 / 字体 / UI 细节三件套（新锐） |

读表时有三点值得单独记：

1. **mattpocock 一骑绝尘**：约 17.5 万 Star、近 1.5 万 Fork、约 991 Watcher，Fork/Star ≈ 8.6%。它解决的是「智能体能不能把软件做对」，不是「界面好不好看」。
2. **设计类形成第二梯队**：taste-skill（约 6.4 万）与 Impeccable（约 4.7 万）争夺「反 AI 味 UI」心智；前者偏可调旋钮的技能家族，后者偏命令语言 + 产品化 CLI。
3. **官方背书不等于最大声量**：vercel-labs 约 2.9 万 Star，但 Open Issues 约 159，说明社区在真用、真报问题；规则密度（React 40+ 条、Web UI 100+ 条、写作 80+ 条）是其硬通货。

统一安装入口多数兼容 [skills.sh](https://skills.sh) 的 `npx skills add <owner/repo>`；Impeccable 额外推荐 `npx impeccable install`（按 Cursor / Claude / Codex 等运行时分别编译）。

![技能包作为可版本化操作规程：SKILL.md 经安装进入编辑器，沉淀为检查清单](images/01-skills-as-sop.png)

---

## 2. mattpocock/skills：把「真工程」装进智能体

**站点特点**：作者 Matt Pocock（Total TypeScript / AI Hero）把自己日常 `.claude` 技能开源，口号是 *Skills for Real Engineers*——明确反对失控的 vibe coding。技能刻意做成小块、可组合、可改；支持 `npx skills add mattpocock/skills`，也提供 Claude Code 插件订阅更新。Newsletter 侧宣称约 6 万开发者关注相关更新。

**核心优点**：

- 对准智能体四大失败模式：理解错需求、术语啰嗦、代码不可靠、架构腐化成泥球。
- 区分 **用户触发**（如 `/grill-me`）与 **模型可自调**（如 `/tdd`）两类技能，避免编排互相打架。
- 强调共享领域语言（`CONTEXT.md` + ADR），用文档压缩后续会话的 token 与歧义。

### 重点 Skills

| Skill | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- |
| **grill-me / grill-with-docs** | 对齐需求 | 任何非琐碎改动前 | 对决策树穷尽追问；后者同步维护领域词表与 ADR |
| **tdd** | 红-绿-重构 | 新功能、修 bug 的垂直切片 | 先失败测试再实现，用反馈环替代「一次写完」 |
| **to-spec / to-tickets / implement** | 规格 → 工单 → 实现 | 中大型需求落地 | 会话沉淀规格，拆成 tracer-bullet 工单，实现时在约定缝隙调用 TDD 与 code-review |
| **improve-codebase-architecture** | 架构体检 | 智能体加速堆出的泥球代码 | 扫描「加深模块」机会，HTML 报告 + 对谈式选型 |
| **diagnosing-bugs** | 硬核排障 | 难复现 bug、性能回退 | 复现 → 最小化 → 假设 → 埋点 → 修复 → 回归 |
| **code-review** | 双轴评审 | PR / 实现收尾 | Standards（规范与 Fowler smell）与 Spec（是否兑现工单）并行子智能体，互不污染 |

**实践理解**：若团队只装一套「研发向」技能，优先这一仓库。它不教你选圆角，而是把 *Pragmatic Programmer* / DDD / 深度模块等原则编译成可调用流程。代价是要愿意跑 `/setup-matt-pocock-skills`，并接受「先被拷问再动手」的节奏——这正是它和「一句话生成整站」类技能的分水岭。

![真工程反馈环：对齐 → 规格 → TDD → 评审，拒绝一句话生成整站](images/02-real-engineering-loop.png)

---

## 3. Leonxlnx/taste-skill：反同质化前端的技能族

**站点特点**：[Taste Skill](https://github.com/Leonxlnx/taste-skill)（站点 [tasteskill.dev](https://tasteskill.dev)）自称 *Anti-Slop Frontend Framework for AI Agents*。约 6.4 万 Star、约 4400 Fork，是设计向仓库里传播最广的之一。默认技能 `design-taste-frontend` 已演进到 v2（实验性重写），可用 `--skill design-taste-frontend-v1` 钉住旧行为。

**核心优点**：

- **一族多专长**：实现向（taste / redesign / soft / minimalist / brutalist）与图像向（web/mobile comps、brandkit）分开，避免「一个 SKILL 包打天下却处处妥协」。
- **三旋钮可调**：`DESIGN_VARIANCE`（布局实验度）、`MOTION_INTENSITY`（动效深度）、`VISUAL_DENSITY`（信息密度），把品味从口号变成参数。
- **图像 → 分析 → 代码** 流水线（`image-to-code`），适配 ChatGPT Images / Codex 出参考帧再交给编码智能体。

### 重点 Skills

| Install name | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- |
| **design-taste-frontend**（v2） | 通用高品味前端 | 新页面、营销站、改版 | Brief 推断设计语言 → 调三旋钮 → 硬性禁破折号等 slop → GSAP 骨架与 redesign 审计 |
| **gpt-taste** | 更严的 GPT/Codex 变体 | Codex / GPT 系智能体 | 更高布局方差、更强 GSAP 导向、更激进的反模板规则 |
| **redesign-existing-projects** | 存量改造 | 已有代码库「看起来像 AI 生成」 | 先审计再改布局/间距/层级/样式，而非绿地上重画 |
| **image-to-code** | 图像优先交付 | 需要视觉共识再写码 | 生成参考 → 分析 → 实现，降低「口头描述界面」的信息损失 |
| **high-end-visual-design / minimalist-ui / industrial-brutalist-ui** | 方向锁定 | 已定调性时 | 软对比留白、Notion/Linear 编辑风、瑞士激进工业风等专用约束 |
| **imagegen-frontend-web / mobile / brandkit** | 只出图 | 评审板、品牌板、移动流程 | 产出 comps / flows / identity，再交给实现技能 |

**实践理解**：Star 高 partly 因为「痛点全民化」——所有人都能看出紫色渐变与卡片套卡片。真正落地时建议：绿场用默认 v2；存量用 redesign；出图评审走 imagegen，再 image-to-code。不要同时塞 soft + brutalist，旋钮会互相打架。

---

## 4. Impeccable：给智能体一套可调用的设计语言

**站点**：[impeccable.style](https://impeccable.style) · 仓库 [pbakaus/impeccable](https://github.com/pbakaus/impeccable)（Apache-2.0，约 4.7 万 Star、约 2700 Fork）。

**站点特点**：从 Anthropic 早期 `frontend-design` 思路出发做成产品化技能——**1 个 skill、23 条命令、Live 浏览器迭代（Beta）、46 条确定性反模式检测**（CLI / Chrome 扩展，无 LLM 也可跑）。`npx impeccable install` 会按 Cursor、Claude Code、Codex、Gemini 等「重新编译」规则，针对各模型的已知坏习惯加 ban 列表。

**核心优点**：

- **共享词汇**：`/typeset`、`/colorize`、`/animate`、`/layout`、`/polish`… 人与模型用同一套动词指挥，减少「帮我好看一点」的无效提示。
- **尊重设计系统**：先扫 tokens / 组件 / `DESIGN.md`，再改，而不是另起一套 Inter + 紫渐变。
- **Brand vs Product 双寄存器**：落地页与 Dashboard 规则分轨。
- **可进 CI**：`npx impeccable detect src/` 确定性规则、可读 exit code。

### 命令怎么当「Skills」用

不必背全部 23 条，按阶段记这几组即可：

| 阶段 | 命令 | 用途 |
| --- | --- | --- |
| 立项 | `init` / `document` / `shape` | 写 `PRODUCT.md` / `DESIGN.md`，先定受众与反例 |
| 构建 | `craft` / `typeset` / `colorize` / `layout` / `animate` | 从结构到排版、色彩、动效 |
| 收敛 | `critique` / `audit` / `polish` / `harden` | UX 评审、a11y/性能、上线前打磨、边界情况 |
| 调音 | `bolder` / `quieter` / `distill` / `delight` | 不够跳、太吵、该删、该加点惊喜 |
| 迭代 | `live` | 在跑着的应用上点选元素出多版本（HMR 写回源码） |

**实践理解**：Impeccable 的护城河是「命令语言 + 检测器 + 多运行时适配」，而不只是又一篇反 slop 散文。和 taste-skill 相比：taste 更像风格引擎与变体库；Impeccable 更像设计操作系统。团队若已有 Design Token，优先 Impeccable；若要从零找视觉方向，taste 或 imagegen 更合适。站点口碑里反复出现的评价是「卸载其他前端 skill，换成这个」——夸张，但说明命令化体验降低了使用摩擦。

---

## 5. vercel-labs/agent-skills：官方工程规范的可执行版

**站点特点**：Vercel 官方技能合集（约 2.9 万 Star、约 2600 Fork），遵循 [Agent Skills](https://agentskills.io/) 格式。内容偏 **性能、部署、无障碍、文档声音**，和「好看」仓库互补。

**核心优点**：规则带 **影响优先级**（Critical → Low）；很多条目可直接当 code review checklist；与 Vercel / Next.js 生态贴合（含可认领部署）。

### 重点 Skills

| Skill | 规则量级 | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- | --- |
| **react-best-practices** | 40+ / 8 类 | React/Next 性能 | 写组件、查 waterfall、砍包体 | 消除请求瀑布、优化 bundle、服务端与客户端取数分层 |
| **web-design-guidelines** | 100+ | UI 合规审计 | 「帮我 review UI / a11y」 | 无障碍、焦点、表单、动效、字体、图片、i18n、深色主题等 |
| **writing-guidelines** | 80+ | 文档与文案 | 产品文档、Handbook 对齐 | 禁 `easy/simple/quick`、句式标题、代码样例纪律、定价页细节 |
| **vercel-optimize** | 指标驱动 | 成本与性能 | 已部署 Vercel 项目 | 先拉平台指标，再只挖指标指向的路由与文件 |
| **react-view-transitions** | API 配方 | 原生感转场 | App Router 页面/共享元素动画 | View Transition API + `transitionTypes` + reduced-motion |
| **composition-patterns** | 模式库 | 组件 API 设计 | boolean props 爆炸 | 复合组件、状态上提、内部组合 |
| **vercel-deploy-claimable** | 一键部署 | 对话里上线 | Claude 等会话直接预览 | 打包 → 侦测框架 → 返回 Preview + Claim URL |

**实践理解**：做 Next.js / React 产品时，这套应与 mattpocock 并行——后者管「流程与设计」，前者管「运行时与平台」。`writing-guidelines` 对中文团队也有启发：把「声音」写成可审计规则，比口头说「别写得太 AI」有效。

---

## 6. emilkowalski/skills：动效品味的手术刀

**站点特点**：Emil Kowalski（animations.dev，前 Vercel / Linear 背景）的 Design Engineering 技能集，约 1.5 万 Star。体积小、意见硬：缓动选错、该不该动画、阴影 vs 描边这类「小决策」被写成可执行纪律。

**核心优点**：把「品味」拆成可检查的决策框架（例如按使用频率决定是否动画：键盘操作日用 100+ 次则永不动画）；`improve-animations` 采用 **强模型审计 → 弱模型执行** 的分工，只写 `plans/`，不直接改业务代码。

### 重点 Skills

| Skill | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- |
| **emil-design-eng** | 总技能：UI 抛光与动效哲学 | 日常做界面、评审细节 | 未见细节会复利；评审强制 Before/After/Why 表格 |
| **review-animations** | 严格审单个 diff 的动画 | PR / 局部改动 | 按作者规则挑 easing、时长、物理感、可打断性 |
| **improve-animations** | 全库动效审计与计划 | 「让整个应用手感更好」 | 八类审计（目的与频率、缓动时长、物理性、可打断、性能、a11y、一致性、遗漏机会）→ 优先表 → 自包含计划 |
| **find-animation-opportunities** | 找该动与不该动的位置 | 产品动效规划 | 同时告诉你什么不要动画 |
| **animation-vocabulary** | 用对词向 AI 要动画 | 提示词质量差时 | 精确词汇换精确曲线与意图 |
| **apple-design** | Apple / WWDC 原则转译到 Web | 追求「流体系统感」 | 从官方设计讲座提炼可落地的 Web 约束 |

**实践理解**：Star 不到 taste/Impeccable 的一半，但对「已经能看、只是手感差」的项目 ROI 极高。`improve-animations` 的「顾问不改码」边界很干净，适合塞进周末架构日：强模型出 `plans/001-….md`，便宜模型按文件与 cubic-bezier 执行。

---

## 7. ibelick/ui-skills：用 CLI 把任务路由到对的技能

**站点特点**：[ui-skills.com](https://www.ui-skills.com/) + 仓库约 4400 Star。提供 `npx ui-skills start`，按任务类别（如 motion）列出并拉取技能，而不是让人在目录里猜。

**核心优点**：技能粒度偏「一次清理 / 一次修复」；`baseline-ui` 用大量 MUST/NEVER 压 AI 默认坏习惯；配套 fixing-* 系列做无障碍、元数据、动效性能专项。

### 重点 Skills

| Skill | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- |
| **baseline-ui** | 快速去 slop | 新生成页面的第一轮清理 | Tailwind 默认、可访问原语、骨架屏、禁止手写焦点陷阱等硬约束 |
| **improve-ui** | 整体提升界面 | 需要比 baseline 更深的一轮 | 在基线之上继续抬层级与一致性 |
| **fixing-accessibility** | a11y 专项 | 键盘、ARIA、焦点问题 | 路由到无障碍修复清单 |
| **fixing-metadata** | SEO / 社交元数据 | 落地页上线前 | title、og、结构化信息补齐 |
| **fixing-motion-performance** | 动效性能 | 卡顿、layout thrash | compositor-friendly、reduced-motion 等 |

**实践理解**：适合「不想装全家桶、只要一条清理流水线」的个人项目。和 Impeccable detect 可串联：CLI 规则扫一遍 → baseline-ui 修结构 → Emil 技能修手感。

---

## 8. MengTo/Skills：提示词资产与落地页配方库

**站点特点**：Design+Code 的 Meng To 出品，约 2300 Star，库内约 **77** 个 `SKILL.md`（Codex 工作流 12 + Media 2 + UI 1 + Web design 约 62）。哲学很明确：**提示词是资产、规格胜过感觉、参考图胜过长段落、Skills 是操作规程**。

**核心优点**：覆盖从「视频转超级提示词」到 GSAP / Three.js / 各种视觉 mood 的可复用配方；结构约定清晰（`SKILL.md` + 可选 `REFERENCES.md` / `ARTICLE.md` / `scripts/`）。

### 重点 Skills（按工作流价值，而非 Star）

| Skill | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- |
| **video-to-superprompt** | 录屏 → 超细提示词 | 想一枪复刻参考站/动效 | 把运动、层级、字体写成 Fable/HTML 智能体可执行规格 |
| **html-to-interaction-prompts** | 整页 → 局部交互提示 | Aura Build 等已有 HTML | 拆成按钮/悬停/WebGL 等可复用提示文章 |
| **stitched-full-page-capture** | 整页截图 | 懒加载、动效、WebGL 页 | 可靠全页参考，避免只截到 hero |
| **daily-ui-inspiration-capture** | 灵感闭环 | 持续收集强落地页 | 浏览 → 截图 → 研究 → 提示词包 |
| **landing-page / pricing-page** | 转化页实现 | SaaS 营销页 | 约束 + 默认值 + 验收检查 |
| **gsap / cinematic-* / animation-on-scroll** | 滚动叙事与动效系统 | 品牌站、故事型落地页 | 可复制的时间轴与 ScrollTrigger 配方 |
| **design-first-ui-prompting** | 设计优先提示模板 | 任何 UI 生成前 | goal → format → layout → type → color → constraints；变体优先于重掷 |

**实践理解**：Star 不高，但作为「内部提示词图书馆」价值大。团队做营销站、活动页时，比再写一遍「高级感科技风」有用得多。注意：mood 类技能（如某种蓝色玻璃风）一次只用一个，当作 stylecard，而不是叠buff。

---

## 9. jakubkrehel/skills：小而硬的工艺三件套

**站点特点**：2026-07 才公开，约 534 Star，关联 [interfaces.dev](https://interfaces.dev/)。只有三个技能：**better-colors / better-typography / better-ui**——刻意不做大而全。

**核心优点**：每个技能都是可检索的参考手册（OKLCH 色板、字体尺度、同心圆角、可打断动画），Trigger 描述写得很细，方便模型「对症加载」。

### 三个 Skills

| Skill | 主要用途 | 适用场景 | 解决思路 |
| --- | --- | --- | --- |
| **better-colors** | OKLCH 色彩工程 | 色板、暗色、对比度、Tailwind v4 `@theme` | 感知均匀空间替代 HSL；配套转换、APCA/WCAG、P3 gamut |
| **better-typography** | Web 字体与排版 | 选字、字阶、截断、下划线、表单文字 | 克制优先；属性优于裸 `font-variation-settings`；禁止合成粗体 |
| **better-ui** | 界面微观工艺 | 「差点意思」的组件抛光 | 同心圆角、光学对齐、阴影优于实线边框、可打断动画 |

**实践理解**：体量小、冲突少，很适合作为 **永远打开的底层技能**，上面再叠 Impeccable 或 Emil。新仓库 Star 低不代表质量低——更像垂直工艺文档刚进入 Agent Skills 分发渠道。

---

## 10. 横向对比：你该装哪几套？

按角色给一个「最小有效集合」，避免技能互相覆盖：

| 你的工作 | 建议组合 | 原因 |
| --- | --- | --- |
| 全栈 / 平台工程 | mattpocock + vercel `react-best-practices` | 流程正确 + 运行时性能 |
| 营销站 / 品牌站 | taste-skill 或 Impeccable + MengTo landing/gsap | 方向 + 命令或配方 |
| 产品 App UI | Impeccable（product 模式）+ Emil + jakub 三件套 | 系统感 + 手感 + 颜色字体底盘 |
| 存量「AI 味」改造 | taste `redesign` → Impeccable `detect/polish` → Emil `improve-animations` | 先结构后检测再动效 |
| 文档站 | vercel `writing-guidelines` + `web-design-guidelines` | 声音与 UI 合规一起审 |
| 个人学习 / 低负担 | ibelick `baseline-ui` + jakub | CLI 路由 + 三本手册 |

![技能叠加原则：工程底座可叠，两个总设计技能双开会冲突](images/03-skill-stack-conflict.png)

安装与冲突上的经验：

1. **同类只留一个「总设计技能」**：taste-skill 默认与 Impeccable 主技能不要双开，细分子技能（Emil、jakub）可以叠加。
2. **工程与设计正交**：mattpocock 几乎不与设计技能冲突，应作为研发默认底座。
3. **用触发词管理加载**：好的 `description` / trigger 比「全装进仓库」更重要；技能太多会稀释模型注意力。
4. **把优秀 SKILL 当教材**：写团队内部技能时，抄结构（When to use → Workflow → Hard rules → Acceptance），不必抄审美结论。

---

## 11. 流行度之外：我怎么判断一个 Skill「值得沉淀」

Star 是注意力市场，不是质量分数。筛选时我更看：

1. **有没有可证伪的规则**：例如「键盘触发永不动画」「外圆角 = 内圆角 + padding」「禁止 `transition: all`」。能写成检测器或 Before/After 表的，才可传承。
2. **边界清不清晰**：`improve-animations` 明确只写 plans、不改源码；Impeccable detect 明确不跑 LLM。边界清的技能更安全地交给便宜模型。
3. **是否尊重现有系统**：会先读 tokens / 组件库的，优于每次发明新设计系统。
4. **安装路径是否可复现**：`npx skills add` / 官方 plugin / 按 harness 编译——团队才能统一版本。
5. **作者是否持续踩坑**：有 Changelog、v1/v2 分轨（taste）、多运行时适配（Impeccable）的，维护预期更稳。

反过来，对「77 个 mood 技能」类仓库，沉淀方式应是 **编目 + 选用**，而不是全部装进每个项目。

---

## 12. 给团队的落地清单

1. **研发默认**：在样板仓库执行 `npx skills add mattpocock/skills`，跑通 `/setup-matt-pocock-skills`，固定 issue tracker 与文档目录。
2. **前端默认**：二选一主技能（Impeccable **或** taste-skill），再加 `emilkowalski/skills` 与 `jakubkrehel/skills`。
3. **平台默认**：Vercel/Next 项目加 `vercel-labs/agent-skills` 的 `react-best-practices` 与 `web-design-guidelines`；文档仓加 `writing-guidelines`。
4. **营销专项**：MengTo 的 `landing-page`、`video-to-superprompt`、`stitched-full-page-capture` 放进「活动页」子仓或提示词库，不要全局污染。
5. **知识沉淀格式**：每引入一个外部 Skill，在内部记三行——用途、禁用场景、与现有 Design Token / AGENTS.md 的冲突点。三个月后淘汰没用过的。

---

## 13. 参考链接

- [mattpocock/skills](https://github.com/mattpocock/skills)
- [emilkowalski/skills](https://github.com/emilkowalski/skills)
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) · [tasteskill.dev](https://tasteskill.dev)
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- [ibelick/ui-skills](https://github.com/ibelick/ui-skills) · [ui-skills.com](https://www.ui-skills.com/)
- [jakubkrehel/skills](https://github.com/jakubkrehel/skills)
- [MengTo/Skills](https://github.com/MengTo/Skills)
- [Impeccable](https://impeccable.style) · [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- 分发与发现：[skills.sh](https://skills.sh) · 格式说明：[agentskills.io](https://agentskills.io/)

指标会随时间变化；选型时以仓库 README、CHANGELOG 与你方技术栈匹配度为准，Star 只作热度参考。
