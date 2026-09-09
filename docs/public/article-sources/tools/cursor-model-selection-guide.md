
# Cursor 常用模型怎么选：模型档位、Effort 与 Context

Cursor 的模型列表里经常同时出现 `Opus`、`Sonnet`、`Sol`、`Flash`、`High`、`Fast` 和 `1M Context`。这些词并不属于同一个维度：

- **模型档位**决定基础能力、速度与价格；
- **Effort** 决定模型愿意投入多少推理；
- **Fast** 决定服务响应速度；
- **Context** 决定这一轮最多能看到多少信息。

先分清这四件事，再按任务选择，比追逐某个排行榜第一名更实用。

> 本文依据 2026 年 9 月 9 日可查到的 Cursor、OpenAI、Anthropic 与 Google 官方资料整理。模型名称、套餐和价格变化很快，请以 Cursor 当前模型选择器为准。

## 先看结论

| 任务 | 推荐起点 |
| --- | --- |
| 解释代码、改文案、简单 CSS | 快速模型 + Low |
| 日常功能开发 | 中档模型 + Medium |
| 多文件重构、复杂调试 | 中高档模型 + Medium，失败后升 High |
| 架构设计、高风险审查 | 高档模型 + High |
| 截图转 UI、视觉理解 | 支持图像的多模态模型 |
| 生成封面、插图或海报 | Cursor 内置 Generate Image 工具 |
| 大仓库或长文档分析 | 先精准检索，确有需要再开长 Context |
| 大批量重复修改 | 低成本快速模型 + Low |

一个实用默认策略是：

1. 日常任务从 **Composer、Claude Sonnet 或 GPT Terra + Medium** 开始；
2. 简单任务切到 **Gemini Flash、GPT Luna 或 Composer**；
3. 复杂问题再升级到 **Claude Opus、GPT Sol 或 Grok + High**；
4. 模型答错前，先判断问题是「推理不够」还是「上下文没给够」。

## 四个容易混淆的概念

### 1. 模型档位

模型档位是模型本身的能力定位。同一家模型通常会分成高、中、低几档：

| 模型家族 | 高档 | 中档 | 快速 / 低成本档 |
| --- | --- | --- | --- |
| Claude | Opus | Sonnet | Haiku |
| GPT-5.6 | Sol | Terra | Luna |
| Gemini | Pro | — | Flash |

高档模型通常更适合复杂推理和长任务，但更慢、更贵。简单任务使用高档模型，不一定产生更好的结果，只会增加等待和消耗。

### 2. High / Medium / Low

`High`、`Medium`、`Low` 通常指 **reasoning effort（推理投入）**。它控制同一个模型在回答前投入多少计算和推理时间。

| Effort | 特点 | 适合 |
| --- | --- | --- |
| Low | 延迟低、消耗少、推理较浅 | 明确的小改动、文案、格式调整 |
| Medium | 速度与可靠性平衡 | 日常编码、工具调用、多文件小功能 |
| High | 思考更充分，延迟和消耗更高 | 复杂 Bug、深度规划、跨模块重构 |
| XHigh / Max | 模型支持时使用最大推理投入 | 高难度、高价值且不追求速度的任务 |

需要注意：

- Effort 越高，通常代表模型拥有更多推理预算，**不等于答案一定正确**；
- 不同厂商的 `High` 没有统一标准，不能直接横向比较；
- 支持的等级因模型而异，例如 Grok 4.6 支持 `low / medium / high / xhigh`，Gemini 3.8 Flash 支持 `low / medium / high`；
- Claude 在 Cursor 中常以 Thinking 变体提供深入推理，具体选项以模型选择器为准。

如果错误来自缺少代码、日志或业务规则，把 Effort 从 Medium 调到 High 通常没有用，应先补充上下文。

### 3. Fast

`Fast` 是速度档，不是推理等级。

- Fast 通常使用更高优先级的推理服务，返回更快；
- 它可能与 High 同时出现，即「投入较多推理，但由快速服务执行」；
- Fast 往往按更高单价计费；
- 时间不敏感的后台任务通常没必要开 Fast。

因此，`High` 回答「要想多久」，`Fast` 回答「服务跑得多快」。

### 4. Context

Context（上下文）是模型在当前请求中能够看到的信息。它不只是你输入的那句话，还可能包括：

- Cursor 的系统指令与工具说明；
- 项目中的 Rules、`AGENTS.md` 和 Skills 描述；
- MCP 工具说明；
- 当前对话、历史摘要和工具执行结果；
- 通过 `@file`、`@folder`、终端、Git diff 等附加的内容；
- Agent 搜索代码后返回的相关片段。

Context Window（上下文窗口）是这些内容的总容量，单位是 Token。Token 不是固定数量的汉字或单词，不同模型使用的分词方式也不同。

Cursor 会在对话接近窗口上限时，将较早内容压缩成摘要。官方没有公布固定触发比例或具体截断算法。

## 大 Context 不代表效果一定更好

`1M Context` 表示模型支持更大的输入容量，不代表 Cursor 会自动把整个仓库完整放进去，也不代表模型能对窗口里的每个细节保持同等关注。

过多上下文可能带来：

- 无关信息干扰判断；
- 首次响应变慢；
- 输入 Token 和费用增加；
- 关键约束被埋在大量日志或代码中；
- 部分模型进入长上下文后提高计费倍率。

更稳妥的顺序是：

1. 先说明目标、约束和验收条件；
2. 已知相关文件时使用精确的 `@file` 或目录；
3. 不知道相关文件时让 Agent 搜索，不要直接附加整个仓库；
4. 大量检索交给 Explore 子 Agent，主对话只保留结论；
5. 只有任务确实跨越大量代码或长文档时，再选择 1M Context。

截至本文整理时，Cursor 官方列出的部分默认 / 最大上下文如下：

| 模型 | 默认 Context | 最大 Context |
| --- | ---: | ---: |
| Composer 2.5 | 200k | 200k |
| Grok 4.6 | 256k | 256k |
| Claude Sonnet 5 | 200k | 1M |
| Claude Opus 5 | 300k | 1M |
| Gemini 3.8 Flash | 200k | 1M |
| GPT-5.6 Sol | 272k | 1M |

这些数值会随模型版本和 Cursor 套餐变化。选择长上下文前还应查看费用说明：不同模型的长上下文计费规则并不相同。

## Cursor 中常见模型的定位

### Composer 2.5：Cursor 日常 Agent

Composer 2.5 是 Cursor 自有的 Agent 模型，针对文件编辑、终端操作、工具选择和长流程任务优化。

适合：

- 需求明确的日常功能开发；
- 连续修改多个文件并运行测试；
- 交互式编码；
- 希望优先使用 Cursor Models 套餐额度。

它是一个稳妥的日常默认项，但遇到复杂架构或高难度推理时，可以升级到更高档模型。

### Grok 4.6：长流程编码与知识工作

Cursor 将 Grok 4.6 定位为复杂编码和知识工作模型，强调长时间工具调用、检查结果并调整方案。

适合：

- 长时间 Agent 任务；
- 代码、文档、表格和 PDF 混合处理；
- 需要多轮搜索、执行和修正的任务；
- 希望灵活调整 Low 到 XHigh 推理等级。

### Claude Sonnet 5：均衡型主力

Sonnet 处于 Claude 的中档定位，兼顾能力、速度与价格。Cursor 官方将 Sonnet 5 描述为接近 Opus 质量的日常编码选择，并支持 Thinking 与扩展上下文。

适合：

- 日常功能开发；
- 多文件修改和重构；
- 调试、代码审查和技术文档；
- 希望工具调用和指令遵循较稳定的任务。

### Claude Opus 5：复杂规划与高价值任务

Opus 是 Claude 的高档模型，适合困难、多步骤和长时间任务。Cursor 官方推荐在最困难的工作中使用 High Thinking。

适合：

- 架构设计；
- 核心模块重构；
- 棘手 Bug；
- 高风险代码审查；
- Sonnet 多次无法解决的问题。

代价是更高的消耗和等待时间，不适合批量处理简单任务。

### GPT-5.6 Sol / Terra / Luna：按任务难度分档

| 型号 | 定位 | 典型场景 |
| --- | --- | --- |
| Sol | 家族最高能力，长任务持续性强 | 复杂调试、架构、长期 Agent |
| Terra | 能力、速度和成本平衡 | 日常功能、多文件编码 |
| Luna | 低成本、低延迟 | 简单修改、批量任务、子 Agent |

Sol 更适合困难任务；Terra 可以作为日常主力；Luna 适合高频、低风险的明确任务。

### Gemini Pro / Flash：视觉与长上下文

Gemini 3.1 Pro 能同时处理图像和代码，适合根据截图或设计稿完成前端工作。Gemini 3.8 Flash 更强调速度、低成本、高吞吐和 1M 上下文。

适合：

- 截图、设计稿和代码联合分析：Gemini Pro；
- 大量搜索、批处理和快速修改：Gemini Flash；
- 长文档或大型代码范围的初步分析；
- 对速度和成本更敏感的任务。

### Kimi K3：开放模型选项

Cursor 将 Kimi K3 定位为适合长流程 Agent 工作的开放权重模型，强调前置推理和一次性持续执行能力。

它可作为 Claude、GPT、Gemini 之外的选择，但在 Cursor 中仍由推理服务商托管，不等同于本地运行。

## 在 Cursor 中生成图片

Gemini Pro、Claude Sonnet 等多模态 Agent 模型可以读取截图、分析设计稿并编写代码，但生成图片应使用 Cursor 内置的 Generate Image 工具。

| 任务 | Cursor 中的选择 |
| --- | --- |
| 分析截图、设计稿或报错图片 | 支持图像输入的 Agent 模型，如 Gemini Pro、Claude Sonnet |
| 根据设计稿编写前端代码 | 多模态 Agent 模型 + 相关组件代码 |
| 生成封面、插图或海报 | Cursor 内置 Generate Image 工具 |
| 修改已有图片 | 将原图作为参考交给 Generate Image 工具，并说明需要保留和修改的部分 |

Cursor 当前使用 **Gemini 3 Pro Image Preview** 作为该工具的专用模型，它不能作为普通 Chat / Agent 模型选择。

生图时，Prompt 至少应写清：

- 图片用途，如文章封面、流程插图或海报；
- 画面比例和分辨率；
- 主体、构图、配色与风格；
- 必须出现或禁止出现的文字和元素；
- 用于卡片裁剪时的安全边距。

如果图片包含大量准确文字、数据图表或品牌规范，生成后仍需人工检查。

## 按实际场景选择

| 场景 | 推荐模型 | Effort | Context 建议 |
| --- | --- | --- | --- |
| 解释一个函数 | Composer、Luna、Gemini Flash | Low | 当前文件和调用处 |
| 改文案、命名、样式 | Composer、Luna、Gemini Flash | Low | 当前文件 |
| 日常功能开发 | Composer、Terra、Claude Sonnet | Medium | 相关目录、Rules、需求 |
| 多文件重构 | Claude Sonnet、Grok、Terra | Medium → High | 相关模块，不要整个仓库 |
| 并发、状态或性能 Bug | Sol、Claude Opus、Grok | High | 日志、调用链、复现步骤 |
| 架构与技术方案 | Claude Opus、Sol | High | 需求、约束、现有架构 |
| 根据截图实现 UI | Gemini Pro、Claude Sonnet | Medium | 截图和相关组件 |
| 生成封面、插图或海报 | Cursor Generate Image 工具 | — | 用途、比例、风格、参考图和安全边距 |
| 大仓库检索 | Gemini Flash / Pro、Claude Sonnet | Medium | 优先搜索或 Explore 子 Agent |
| 长时间自动执行 | Composer、Grok、Sol、Claude Opus | Medium → High | 拆阶段，及时压缩总结 |
| 批量重复修改 | Luna、Gemini Flash、Composer | Low | 分批提供文件 |
| 合并前重点审查 | Claude Opus、Sol、Claude Sonnet | High | Branch diff、Rules、验收条件 |

## 模型答不好时，先判断问题类型

| 现象 | 更可能的原因 | 处理方式 |
| --- | --- | --- |
| 找不到类、函数或配置 | Context 不足 | 引用相关文件或让 Agent 搜索 |
| 理解错业务规则 | 缺少需求和约束 | 补充规格、Rules 或 `AGENTS.md` |
| 简单任务响应太慢 | 模型过强或 Effort 太高 | 换快速模型或降低到 Low |
| 复杂逻辑反复出错 | 推理投入或模型能力不足 | 切 High，再升级模型档位 |
| 长对话开始忘记早期结论 | Context 接近上限 | 总结、新开对话或拆子任务 |
| 输出风格不符合预期 | 模型风格或提示不清 | 明确格式，必要时换模型家族 |
| 放入大量代码后仍答错 | 上下文噪声太多 | 删除无关内容，只保留相关模块 |

推荐的升级顺序：

1. 中档模型 + Medium；
2. 补齐上下文；
3. 将 Effort 调到 High；
4. 升级到高档模型；
5. 仍然不稳定时，拆小任务并增加验证步骤。

这能避免把所有问题都归因于「模型不够强」。

## Auto 与 Max Mode

### Auto

Auto 不是一个固定模型，而是 Cursor 的自动路由机制。新版 Cursor Router 提供：

- **Cost**：优先控制 Token 支出；
- **Balance**：平衡能力、速度和成本；
- **Intelligence**：复杂请求优先路由到高能力模型。

每次请求可能使用不同模型，模型池也会随版本变化。需要稳定复现、严格控制成本或对比模型时，应手动选择具体模型。

Cursor Router 的 Balance 和 Intelligence 当前面向 Teams 与 Enterprise，个人套餐实际可见选项以模型选择器为准。

### Max Mode

Max Mode 仅适用于旧版 request-based 套餐，用于将支持模型的上下文扩展到默认限制以上。

- 当前 usage-based 套餐不是通过 Max Mode 扩展上下文；
- 旧套餐启用后按模型 API 费率加收 20%；
- 上下文上限仍由具体模型决定；
- 默认 Context 已足够时，没有必要启用更大的窗口。

## 一套可直接采用的团队规则

```markdown
# 模型选择

- 默认使用中档模型 + Medium
- 单文件简单修改使用快速模型 + Low
- 复杂 Bug、架构和合并前重点审查使用高档模型 + High
- 回答缺少事实时先补 Context，不直接提高 Effort
- 大仓库先搜索和拆分，确有需要再使用 1M Context
- 敏感材料进入模型前确认团队的数据与合规策略
```

模型更新很快，但这套选择逻辑不会频繁变化：**简单任务用快模型，日常任务用均衡模型，困难任务再提高模型档位和 Effort；Context 只放与目标有关的信息。**

## 参考资料

- [Cursor：Models & Pricing](https://cursor.com/docs/models-and-pricing)
- [Cursor：Prompting Agents 与 Context Usage](https://cursor.com/docs/agent/prompting)
- [Cursor：Cursor Router](https://cursor.com/docs/cursor-router)
- [Cursor：Composer 2.5](https://cursor.com/docs/models/cursor-composer-2-5)
- [Cursor：Grok 4.6](https://cursor.com/docs/models/grok-4-6)
- [Cursor：Claude Sonnet 5](https://cursor.com/docs/models/claude-sonnet-5)
- [Cursor：Claude Opus 5](https://cursor.com/docs/models/claude-opus-5)
- [Cursor：GPT-5.6 Sol](https://cursor.com/docs/models/gpt-5-6-sol)
- [Cursor：Gemini 3.8 Flash](https://cursor.com/docs/models/gemini-3-8-flash)
- [Cursor：Gemini 3 Pro Image Preview](https://cursor.com/docs/models/gemini-3-pro-image-preview)
- [OpenAI：Reasoning Models](https://developers.openai.com/api/docs/guides/reasoning)
- [Google：Gemini Thinking](https://ai.google.dev/gemini-api/docs/generate-content/thinking)

## 延伸阅读

- [Cursor 三种模式怎么选：Ask / Plan / Agent](/articles/tools/cursor-ask-plan-agent-decision)
- [Cursor 上下文引用实战](/articles/tools/cursor-at-context-guide)
- [Cursor Rules：给 Agent 的持久化项目约定](/articles/tools/cursor-rules)
