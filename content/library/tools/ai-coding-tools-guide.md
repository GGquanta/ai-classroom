---
title: AI 编程工具快速指南
description: 从 VS Code、Cline 到 Agent Skills 的完整上手路径，涵盖环境配置、MCP 接入与 AGENTS.md 实践。
author: 朝阳
date: 2026-06-28
tags:
  - vscode
  - cline
  - cursor
  - agent-skills
category: tools
cover: /assets/ai-coding-tools-guide/vscode-main-ui.png
---

## 安装VS Code - 全能研发工具

> 为什么是VS Code？

> 因为目前大部分拥有图形界面的AI编程工具都是基于VS Code深度定制的，市场占用率和社区活跃度无可比拟。另外VS Code拥有海量的扩展库，可以支援几乎所有编程语言的开发工作。

首先前往下面的链接下载VS Code安装包并进行安装：

[Download Visual Studio Code - Mac, Linux, Windows](https://code.visualstudio.com/Download)

![VS Code 下载页面](images/vscode-download.png)

安装好之后即可以看到VS Code的主界面。

![VS Code 主界面](images/vscode-main-ui.png)

## 安装Cline扩展 - 更好的本地编程Agent

> 为什么是Cline？

> 因为Cline支持多种安装模式（插件、本地CLI程序等），不仅支持VS Code、Cursor等软件，也支持JetBrains IDE，通用性比较好，而且支持自定义API，使用无需注册，拥有良好的自由性。

接下来我们安装Cline扩展，点击VS Code窗口左侧的扩展按钮，然后搜索Cline扩展并安装。

![搜索并安装 Cline 扩展](images/cline-extension-search.png)

安装好之后会自动打开Cline对话窗口（这里将对话框移动到了右侧）。

![Cline 对话窗口](images/cline-chat-panel.png)

接下来我们来修改Cline的配置。

## 修改Cline配置 - 使用更快、更好的大模型

> 为什么要自定义API和模型参数？

> 大模型本身在不断进化，我们不可能一直依赖一个模型完成所有工作。另外我们需要使用统一的API规则进行管理，因此需要自定义API。

这里我们选择API提供商为OpenAI兼容，然后填入阿里云百炼平台的URL。

- **北京地域**：`https://dashscope.aliyuncs.com/compatible-mode/v1`
- **新加坡地域**：`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- **弗吉尼亚地域**：`https://dashscope-us.aliyuncs.com/compatible-mode/v1`

然后在API Key中填入获得的大模型Key（一般以sk-开头，切记保密）。

![Cline API 配置](images/cline-api-config.png)

关于模型ID，可以选择下面这个页面中公布的所有模型，目前推荐开发工作中使用kimi-k2.6。

[模型列表](https://help.aliyun.com/zh/model-studio/models)

想综合比较不同模型之间的能力差别，可以参考下面这个网站。

[SWE-Bench Pro Leaderboard](https://llm-stats.com/benchmarks/swe-bench-pro)

配置完成之后，即可以保存配置项目返回对话页面开启对话（注意必须在VS Code中打开一个文件夹才能启动对话）。

![保存配置后返回对话页面](images/cline-chat-ready.png)

## 添加MCP Server - 为AI搭配武器库

> 什么是MCP Server？

> AI Agents有主动使用工具的能力，为了便于管理，我们会把工作中常用的一些工具提供给AI，让它在工作中根据自己的判断进行使用。MCP Server就是这样对一系列工具进行管理的一种集合方法。

为了更好地让AI完成工作，我们需要让AI拥有各类好用的工具，下面用一个例子来说明。

常见的一种工作内容是，我们可以让AI帮我们完成内容收集和调研任务，比如下面的工作：

![内容收集与调研任务示例](images/cline-research-task.png)

在默认情况下，Agent会尝试调用命令行（curl程序）来完成工作，这种工作模式下效率和质量都一般。

我们可以修改Agent配置，添加MCP Server来优化这个过程，让AI拥有访问特定工作的能力。

这里我们安装一个用于获取网络数据的工具，它本质上就是一个Python库，可以访问下面的链接查看详情：

[mcp-server-fetch](https://pypi.org/project/mcp-server-fetch/)

点击Cline上方的MCP Servers按钮，然后点击Configure，手动编辑配置文档，然后修改为如下内容：

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {
        "PYTHONIOENCODING": "utf-8"
      }
    }
  }
}
```

![MCP Server 配置](images/cline-mcp-config.png)

此时返回对话窗口，即可以允许Agent调用工具完成具体任务，如下所示：

![Agent 调用 MCP 工具完成任务](images/cline-mcp-fetch-result.png)

## 编辑AGENTS.md - 给AI一本《指导手册》

> 什么是AGENTS.md

> 我们不希望每次和AI对话时都反复输入一堆约束和限定规则，因此我们可以把最常用的一些文本放在项目文件夹中，每次开启新对话时AI会自动读取这些内容。一般用来存放这些文本的文件就是AGENTS.md。

接下来我们对收集到的资料进行汇总和报告撰写，我们可以直接向AI提出工作需求。

![向 AI 提出报告撰写需求](images/agents-md-task-request.png)

通常而言，在没有进行良好提示词优化的情况下，AI输出的文本内容会比较刻板，也就是有「AI味」。我们为了增加文稿的流畅度和吸引力，往往会在描述任务时向AI提供很多额外的工作要求。而每次都输入一大堆文本很影响工作效率，这时候我们就可以使用AGENTS.md来存储一些常用的提示词文本。如下所示。

![AGENTS.md 提示词内容](images/agents-md-content.png)

编写好AGENTS.md后再完成相同的工作，我们可以看到AI输出的内容有了明显的不同。右侧（添加AGENTS.md后的输出内容）的文本更贴近于人类的表达习惯。

![添加 AGENTS.md 前后输出对比](images/agents-md-comparison.png)

我们一般会把最重要的工作约定、项目背景、开发指南等内容放到AGENTS.md中，让Agent始终遵守任务指南，或是了解当前现状。

## 安装SKILLS - 让AI学会更多的技能

> 什么是SKILLS？

> 简而言之就是技能库，技能库中的技能概要对Agent始终可见，如果在工作中Agent认为可以使用某些技能来更好地完成工作，则会读取技能的完整说明（一般是工具调用规则、行为指南、环境说明等）。

接下来我们来完成编码任务，我们希望根据我们上面的调研和总结成果，完成一个可互动展示的HTML页面。我们可以直接下达工作命令：

![下达 HTML 页面开发任务](images/skill-html-task.png)

![HTML 页面开发任务进行中](images/skill-html-task-progress.png)

下面是得到的结果。

![未使用 Skill 时的页面效果](images/skill-html-result-before.png)

看上去不错，但是和我们见过的很多AI生成的页面非常雷同——同样的渐变色、斜体文字等。

我们怎么能优化这类工作呢？当然我们可以进一步修改AGENTS.md。或者，我们可以有更好的办法，那就是让AI学会「技能」。

我们在项目文件夹中创建一个用于编写前端页面的SKILL.md文件，如下所示：

![SKILL.md 技能文件](images/skill-md-file.png)

这个文件可以让Agent了解和学习某些特定工作技能。注意，为了能够让Agent正确读取，这个文件的存放位置有明确要求（如当前示例会放在.agent/skills目录下）。

你可以在互联网上找到各种各样的Skills，比如如下的汇总页面。

[##VoltAgent / ##awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

此时，我们再让Agent执行相同的工作任务，可以看到Agent在工作时主动加载了对应技能。

![Agent 主动加载技能](images/skill-loaded.png)

然后观察输出成果，我们可以很容易地观察到Agent编写的页面质量有了显著的提高。

![使用 Skill 后的页面效果](images/skill-html-result-after.png)

为了更加便捷地安装和管理SKILLS，我们甚至可以直接要求Agent自己寻找合适的SKILLS进行安装（依赖于find skills这个技能）。

[SKILL.md](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md)

![使用 find-skills 安装技能](images/skill-find-skills.png)

需要注意的是，与AGENTS.md不同，SKILL在实际工作中是按需加载的。当然你可以手动制定让Agents加载某个SKILL。

---

## 相关链接和资料

[Visual Studio Code - The open source AI code editor | Your home for multi-agent development](https://code.visualstudio.com/)

[Cline - AI Coding, Open Source and Uncompromised](https://cline.bot/)

[Cline](https://help.aliyun.com/zh/model-studio/cline)

[模型列表](https://help.aliyun.com/zh/model-studio/models)

[SWE-Bench Pro Leaderboard](https://llm-stats.com/benchmarks/swe-bench-pro)

[##VoltAgent / ##awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)