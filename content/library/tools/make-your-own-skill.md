---
title: 定制自己的 Agent Skill
description: 从何时该编写 Skill、目录与 SKILL.md 结构、description 触发写法，到做一个可验证的小例子，学会把团队经验沉淀成可复用技能。
author: wh
date: 2026-08-06
tags:
  - agent-skills
  - cursor
  - workflow
category: tools
cover: /assets/make-your-own-skill/cover.png
---

![定制自己的 Agent Skill 封面](images/cover.png)

## 1. Skill 是什么，和 AGENTS.md 差在哪

![AGENTS.md 始终生效 vs Skill 按需加载](images/skill-vs-agents.png)

- **AGENTS.md**（或等价项目约定）：Agent **几乎每次任务都会看到**的全局背景——目录职责、禁令、常用命令。适合「这个仓库永远要遵守的事」。
- **Skill**：专项流程或领域知识，Agent **认为相关时才读完整说明**。适合「某类任务才需要的长步骤、模板、检查清单」。

也就是说：全局规矩进 AGENTS.md；可复用的专项打法做成 Skill。

---

## 2. 什么时候值得写

**值得写 Skill 的场景：**

- 同一套步骤每周重复（发版检查、写 PR、导入数据）
- 输出格式固定（commit 前缀、评审清单、报告结构）
- 领域里一堆易踩坑细节，口头每次说不清

**不适用场景：**

- 一次性提示、只在这一次对话用
- 「禁止提交密钥」这类全局禁令 → 放进 AGENTS.md
- 还没跑通一遍就想写成通用技能（先跑通，再抽象）

---

## 3. 目录与最小结构

![Skill 目录结构示意](images/skill-directory.png)

最小可用形态：

```text
skill-name/
├── SKILL.md          # 必填：说明 + 触发描述
├── reference.md      # 可选：长参考资料
└── scripts/          # 可选：辅助脚本
```

**Cursor 存放位置：**

- **个人**：`~/.cursor/skills/<skill-name>/` — 本机所有项目可用
- **项目**：`.cursor/skills/<skill-name>/` — 跟仓库走，适合团队共享

不要把自制 Skill 塞进 `~/.cursor/skills-cursor/`：那是 Cursor 内置技能目录，应由产品维护。

**和其他工具对照：** Cline 等环境里常见路径是项目下的 `.agent/skills/`（见工具指南截图示例）。**文件核心仍是** `SKILL.md`，换的是「放哪」；写内容的方法通用。

---

## 4. SKILL.md 怎么写

每个 Skill 至少包含带 YAML frontmatter 的 `SKILL.md`：

````markdown
---
name: your-skill-name
description: 做什么 + 在什么情况下应该用（触发靠这段）
---

# 标题

具体步骤、约束、输出模板……
````

### description 比正文更关键

Agent 是否「想起」这个 Skill，很大程度上看 description。要同时写清 **能力** 和 **触发场景**。

- **差**：`帮助写 git 相关内容`
- **好**：`按 Conventional Commits 中文规范根据 git diff 撰写 commit message；在用户要求提交、写 commit、总结暂存区变更时使用`

### 正文保持短、可执行

- 分步骤写清「先做什么、再做什么」
- 写明边界：「不要改无关文件」「不要推送」
- 需要固定格式时，直接给模板
- 细节特别多再拆到 `reference.md`，避免把 SKILL.md 写成小说

![自制 Skill 四步流程](images/skill-authoring-flow.png)

推荐节奏：**选题 → 写 description → 写步骤 → 开新对话验证是否触发**。

---

## 5. 示例：中文 Commit / PR 摘要 Skill

贴合本站投稿约定（中文说明、`feat:` / `fix:` / `docs:` 等前缀），做一个迷你项目 Skill。

### 5.1 建目录

在仓库根目录：

```bash
mkdir -p .cursor/skills/zh-commit-pr
```

### 5.2 写入 SKILL.md

将下面内容保存为 `.cursor/skills/zh-commit-pr/SKILL.md`：

````markdown
---
name: zh-commit-pr
description: >-
  根据 git status / git diff 用中文撰写符合 Conventional Commits 的
  commit message，以及含 Summary 与 Test plan 的 PR 描述。
  在用户要求提交、写 commit、写 PR、总结变更时使用。
---

# 中文 Commit / PR 摘要

## 何时使用

用户要提交代码、撰写 commit message，或起草 Pull Request 说明时。

## 步骤

1. 查看 `git status` 与相关 diff（优先已暂存变更；若无暂存则看工作区）。
2. 判断变更类型，选用前缀：`feat` / `fix` / `docs` / `chore` / `refactor` / `test` 等。
3. 输出一行 commit 标题：中文说明「为什么」，避免只堆文件名。
4. 若用户要 PR：再输出 Markdown，包含 Summary（1～3 条）与 Test plan（检查清单）。

## 约束

- 不要把密钥、Token、内网地址写进文案。
- 未经用户明确要求，不要执行 `git commit` / `git push`。
- 若 diff 过大或主题混杂，先建议拆分提交，再分别写 message。

## 输出模板

### Commit

```text
feat: 用一句话说明动机
```

### PR

```markdown
## Summary
- …

## Test plan
- [ ] …
```
````

### 5.3 验证

1. 保存文件后，**新开**一条 Agent 对话（避免旧上下文干扰）。
2. 做一点小改动并 `git add`，然后说：「根据当前暂存区写一条中文 commit message」。
3. 观察 Agent 是否加载 `zh-commit-pr`；若没有自动加载，可在对话里明确提到该 Skill 名称或「按 zh-commit-pr 技能来写」。
4. 核对输出是否带正确前缀、是否在讲「为什么」、是否遵守「先别擅自 commit」。

跑通后，再按团队习惯改 description 与模板即可。

---

## 6. 和「安装别人的 Skill」怎么衔接

不必从零发明所有技能：

- 可从社区合集浏览现成 Skill，例如 [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- 也可用 find-skills 一类能力让 Agent 帮你发现并安装（见 [工具指南](/articles/tools/ai-coding-tools-guide)）

建议流程：**先装一个接近的 → 改 description 与步骤贴合本团队 → 放进项目** `.cursor/skills/` **共享**。自制与安装是同一条路上的两段。

---

## 7. 常见坑

- **description 太空**：从不自动触发；补上「做什么 + 何时用」的关键词。
- **和 AGENTS.md 抢活**：全局禁令、仓库地图留在 AGENTS.md；Skill 只放专项流程。
- **Skill 过长**：主文件只留步骤与模板，长文档放到 `reference.md`。
- **路径放错**：个人技能进 `~/.cursor/skills/`，团队共享进仓库 `.cursor/skills/`；别写到 `skills-cursor`。
- **改完不验证**：务必新开对话用真实任务测一次触发与输出。

---

## 小结

写 Agent Skill，本质是把「你会反复教 Agent 的那段话」收成带触发条件的说明书：选对范围、写清 description、步骤可执行、用一次真实任务验证。从上面的 `zh-commit-pr` 改一版适合你们仓库的规范，就是很好的第一个自制 Skill。
