---
title: DeepSeek Harness 使用指南
description: 讲清「一切皆插件」的 Cordis 架构，再按截图完成 npx 启动 Web UI、申请 API Key、模型配置与第一次会话。
author: wh
date: 2026-09-08
tags:
  - deepseek
  - dsh
  - agent
  - harness
category: tools
cover: /assets/deepseek-harness/cover.jpg
---

![DeepSeek Harness 封面：鲸标与插件模块](images/cover.jpg)

DeepSeek Harness（命令行入口是 `dsh`）是 DeepSeek 开源的 Agent 运行框架，目前处于**开发者预览版**。官方介绍页在 [https://www.deepseek.com/harness/](https://www.deepseek.com/harness/)，口号是「一切皆插件，运行有迹可循」。

日常使用不必先读源码。装好 [Node.js](https://nodejs.org/)（官方要求 `^22.19.0` 或 `>=24.0.0`）后，一条命令就能打开本地 Web UI。本文先讲清楚插件架构，再按截图走完：**启动 → 拿 Key → 认界面 → 配模型 → 开会话**。

相关入口：

- 官方网站：[www.deepseek.com/harness](https://www.deepseek.com/harness/)
- 源码：[github.com/deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
- API 开放平台：[platform.deepseek.com](https://platform.deepseek.com)

---

## 1. 一切皆插件

Harness 不是「再包一层聊天窗口」，而是一套可拆开的 Agent 运行时。官方把它写进产品页标题：**一切皆插件，运行有迹可循**。完整说明见 [DeepSeek Harness 官网](https://www.deepseek.com/harness/)。

![产品页：一切皆插件，以及设置里的插件列表](images/everything-is-plugin.png)

### 能力都是插件

DeepSeek Harness 基于 **Cordis** 插件系统。模型、工具、技能、会话、沙箱、存储、循环、调度、UI——Agent 要用到的能力，都由插件提供，再通过 Cordis 的服务和事件互相协作。

开发者**不用改 Harness 源码**，在配置层就能选择、替换或扩展某一块。Web UI 左下角 **设置 → 插件** 能看到当前挂载的插件列表（预览版里已经有一百多个，例如 `llm`、`session`、`api-gateway`、`hmr`），绿灯表示已启用。右上角 **打开配置文件** 可以直接改本机配置。

可以把它理解成：模型负责「想」，Harness 负责「在真实环境里持续干活」——读文件、跑命令、调工具、开子 Agent。这些干活的零件都可以换。

### 每一次运行都有迹可循

模型看到的内容会写入**仅追加**的会话日志，包括系统提示词、思维链、工具调用与结果、子 Agent 调度，以及每一次上下文注入。在 **Trajectory** 视图里可以按来源查看。恢复、分叉、检索、回放共用同一份事件流，所以一次跑崩了也能回头看「当时模型到底看见了什么」。

上手阶段先会用默认插件组合即可。等 Web UI 跑通之后，再从设置里的插件列表往下挖。

---

## 2. 一键启动 Web UI

先把本地界面跑起来，模型密钥下一节再申请。打开 [Harness 官网](https://www.deepseek.com/harness/)，右侧「一键使用」里就是启动命令。点 **复制**，或自己在终端输入：

```bash
npx @deepseek-ai/dsh web
```

![官网落地页：一键使用命令](images/harness-landing.png)

官方页面里这条命令长这样：

![产品页上的启动命令](images/npx-command.png)

`npx` 会临时下载包再运行，不必全局安装。第一次执行时，终端会询问是否安装，例如 `@deepseek-ai/dsh@0.1.2-rc.1`。输入 `y` 回车即可。

![npx 首次运行确认安装](images/npx-confirm.png)

启动成功后，终端会打印本地地址（默认端口 **3080**），并尝试打开系统默认浏览器。不想自动开浏览器时，加上 `--no-open`。

![确认安装后服务启动，地址中的 token 已打码](images/web-started.png)

几点注意：

- 地址形如 `http://127.0.0.1:3080/?token=...`。`token` 用来保护本机页面，**不要把完整链接发到群里或贴到文章里**。
- 浏览器没自动打开时，复制终端里的**完整启动链接**（含 token）再访问。
- 端口被占用可以换端口：`npx @deepseek-ai/dsh web --port 8080`。
- 想跟官方源码一起改：克隆仓库后按 README 用 `pnpm` 安装、构建，再执行 `pnpm dsh web`。

预览版迭代很快，`npx` 可能用到缓存。要最新包可以用 `npx @deepseek-ai/dsh@latest web`。升级后以仓库 Release / 文档为准，接口可能不兼容。

---

## 3. 申请 DeepSeek API Key

界面能打开之后，再去开放平台拿密钥。Harness 要调模型，需要开放平台的 API Key。打开 [DeepSeek 官网](https://www.deepseek.com/)，点 **API 开放平台**（会跳到 `https://platform.deepseek.com`）。

![DeepSeek 官网，入口是 API 开放平台](images/official-home.png)

登录后，左侧进入 **API keys**。同一栏还能看用量、充值和账单。

![开放平台侧栏选中 API keys](images/platform-api-keys.png)

点 **创建 API key**，按提示生成密钥。密钥通常只完整显示一次，复制后放到密码管理器里，不要写进仓库、聊天记录或截图。

![创建 API key 按钮](images/create-api-key.png)

---

## 4. 认识 Web 界面

密钥拿到后，回到刚才打开的 Web UI。界面是中文，顶部有「预览版」标记。

![Harness Web UI：侧栏、工作区和输入框](images/web-ui.png)

对照图里这几块：

| 位置 | 作用 |
| --- | --- |
| 左上 **新会话** | 开一条新对话 |
| **工作区** | 会话按工作区归类；可搜索、筛选、新建 |
| 左下 **设置** | 配模型、插件、Agent 预设 |
| 中间 **选择工作区** | 必须先选一个本地目录，输入框才会真正可用 |
| **标准模式** | 当前 Agent 运行模式（还可换成其他模式） |
| 底部输入框 | 占位是「选择一个工作区开始」；左侧 `+` 附加内容，右侧箭头发送 |

第一次进来侧栏往往是「暂无会话」，这是正常空状态。先选工作区，再发消息。

---

## 5. 在设置里填写模型密钥

点左下角 **设置**，打开后选 **模型**。说明文字是：填入各提供方的 API 密钥即可使用其模型。

找到 **DeepSeek**（标识 `deepseek-official`，绿灯表示可用），把刚才申请的 Key 贴进 **API 密钥**。已经配过时，输入框会显示「已配置——输入新值可替换」。

![设置 → 模型：DeepSeek 官方适配器](images/model-settings.png)

同页还可以：

- 展开 **自定义设置**，确认 **API 地址** 为 `https://api.deepseek.com`（用官方接口时一般不用改）。
- 查看 **模型目录**。默认会带上适配器提供的模型，例如：
  - `deepseek-v4-flash`（DeepSeek-V4-Flash）
  - `deepseek-v4-pro`（DeepSeek-V4-Pro）
  - `deepseek-v4-flash-vision-exp`（带视觉的实验模型）
- 需要时点 **添加模型**，不需要的条目可以删。
- 改完点右下角 **保存**。也可以 **打开配置文件** 直接改本地配置。

设置侧栏里还有 **通用设置**、**插件**、**Agent 预设**。插件页在上一节已经看过；密钥只应出现在本机配置里，不要提交到 Git。

---

## 6. 选工作区，发第一条消息

回到主界面：

1. 点 **选择工作区**，选一个你允许 Agent 读写的本地目录（建议用独立练习目录，不要一上来就指向整盘）。
2. 模式先保持 **标准模式**：完整编码 Agent，含文件编辑、Shell、检索、Skills、计划、子代理等。
3. 点 **新会话**，在输入框里发一条会碰到工具的问题，例如：「列出当前目录前 10 个文件」。

能看到模型回复，并且出现工具调用，就说明链路已经通了。

产品页还介绍了其他模式，可按任务切换：

| 模式 | 适合什么 |
| --- | --- |
| **标准模式** | 日常编码、改文件、跑命令 |
| **PTC 模式** | 标准能力之外，让模型用一段代码把多步工具调用组合起来 |
| **极简模式** | 几乎只留 shell 和文件编辑，适合做最小化评测 |
| **创造模式** | 检查运行时、试验插件，并据此做自定义 Agent 预设 |

---

## 7. 本地数据在哪

默认主目录是 `~/.dsh/`（配置、会话、插件都在这附近）。Web UI 关掉后，会话还可以从侧栏继续。具体文件布局会随预览版变动，以当时文档和「打开配置文件」看到的路径为准。

---

## 8. 常见问题

**页面打不开或一片空白。** 确认终端进程还在；用终端打印的完整 `http://127.0.0.1:3080/?token=...` 访问，不要只用光秃秃的主机名或局域网 IP。

**模型没反应。** 回到设置检查 Key 是否保存成功、API 地址是否为官方地址，以及当前会话选中的模型是否在目录里。

**不想自动弹浏览器。**

```bash
npx @deepseek-ai/dsh web --no-open
```

**预览版会不会突然不能用？** 会。官方写明核心插件和 API 仍在迭代。遇到破坏性变更，以 [GitHub 仓库](https://github.com/deepseek-ai/deepseek-harness) 和 [官方网站](https://www.deepseek.com/harness/) 上的开发者文档为准。

想继续往下挖插件、Cordis 内核或社区插件，从官网的 **开发者文档**、**社区插件**、**Cordis 论文** 进去即可。本文覆盖的是「先理解一切皆插件，再把 Web UI 跑起来」。
