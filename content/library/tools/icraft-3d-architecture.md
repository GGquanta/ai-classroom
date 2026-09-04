---
title: iCraft 3D 架构图：把一次翻车收成 Agent Skill
description: 在 iCraft 里画企业 3D 架构图，可靠交付物是场景元素 JSON 而非加密 .icraft。本文记录混合云作业翻车、评审规则，以及如何写成可复用 Agent Skill。
author: 朝阳
date: 2026-09-01
tags:
  - agent-skills
  - icraft
  - 架构图
  - 3d
category: tools
cover: /assets/icraft-3d-architecture/cover.png
coverTone: light
---

# iCraft 3D 架构图：把一次翻车收成 Agent Skill

![iCraft 3D 架构图与 Agent Skill：浅色扁平企业插画](images/cover.png)

资料快照：2026 年 9 月 1 日。  
线上技能：[GGquanta/Skills · icraft-3d-architecture](https://github.com/GGquanta/Skills/tree/main/skills/icraft-3d-architecture)。  
编辑器：[iCraft Editor](https://icraft.gantcloud.com/app/editor)；开源仓库：[gantFDT/icraft](https://github.com/gantFDT/icraft)。

## 一、先给结论

让智能体在 [iCraft](https://icraft.gantcloud.com/app/editor) 里画企业 3D 架构图，可靠路径不是“打开编辑器慢慢点”，也不是把 `.icraft` 当文本改。可版本化、可复查的交付物是 **场景元素 JSON**：一份与运行时 `getAllSceneElementsData()` 同构的数组，用汉堡菜单里的“JSON 导入与导出”读写。

[Mermaid](https://icraft.gantcloud.com/blog/mermaid) 的 `architecture-beta` 只适合起稿。组名不能有空格，图标名对不上图库会变成带问号的立方体，混合网关还可能被画成和 Internet 一样的地球仪。真正能改布局、换模型、改走线的，是 Python 生成的 JSON。

这次作业把上述约束写进了 Skill。仓库结构与常见 Agent Skill 一样：`SKILL.md` 管触发条件和流程，`references/` 管字段与模型目录，`scripts/icraft_scene.py` 负责拼元素并校验连线闭合。人看这篇文章知道为什么；智能体读 Skill 知道怎么做。

## 二、iCraft 能提供什么

iCraft 是一套面向系统架构的 3D 编辑器。左侧是模型库，单击即可落到画布；分区用半透明台面（`area`）；设备是 GLB 模型；关系是三维折线。官方网络模板已经把“该用什么外形、标签怎么挂、箭头怎么走”示范清楚了。

![官方网络架构模板：Internet、防火墙、交换机与终端分层展开](images/01-official-network.png)

图 1：官方模板 `NetworkArchitecture` 的观感。防火墙是带盾牌的立方体，标签用竖直虚线悬在模型上方，走线带方向。后续混合云图按这个标准对齐，而不是按智能体第一次生成的样子交差。

画布快捷键在设置里可以查到，作业中实际用到的是：`V` 俯视核对走线，`C` 透视看立体，`R` 复位相机，`G` 网格吸附。

## 三、两种文件，只能改一种

智能体第一次接触工程文件时，很容易把 `.icraft` 当成可编辑的场景描述。实测不是。官方模板（例如仓库里的 `templates/NetworkArchitecture.icraft`）是 **AES 加密的 ZIP**。改扩展名、当 JSON 打开、在对话里“修补几个坐标”，都会失败。

编辑器对外暴露的明文，是元素数组。常见类型只有五种：`directionallight`、`area`、`text`、`model`、`line`。每条记录带稳定 `key`；模型和线通过 `linkLineKeys`、`startElementKey`、`endElementKey` 互指。修订已有图时必须保住这些 `key`，否则导入后连线会挂到旧节点上。

这决定了工作分层：

- 人在编辑器里微调相机、换一张贴图、截图给评审。
- 智能体用脚本改拓扑和布局，输出 JSON，再请人导入。
- `.icraft` 只作为编辑器自己的存档，不进入 Git 当源文件。

语雀手册（`gant.yuque.com/fdt/qgzed0`）在这次抓取中多次返回空白页。字段约定以用户导出的 JSON、官方模板观感和 Skill 参考文档为准，不要假设手册随时可检索。

## 四、一次混合云作业里实际翻了哪些车

需求是一张企业混合云图：Internet 进入本地数据中心，经路由器、防火墙、核心交换机，再分到 Web / 应用 / 数据库；分支终端上联交换机；公有云侧是混合网关、K8s、云数据库和对象存储。

用 Mermaid 3D 可视化先生成一版，看起来“有分区、有模型、有线”，评审却过不了。

![混合云初稿：分区同色、网关与 Internet 同为地球仪、终端互连](images/02-hybrid-first-draft.png)

图 2：初稿。四个台面都是浅蓝；`HybridGW` 用了和 Internet 相同的地球仪；K8s 是一团云，OSS 和机柜几乎分不清；PC 与笔记本互相连了一刀；防火墙是砖墙模型；本地库和云库都是圆柱体，标签还容易写成 CloudDB。拓扑能猜，角色靠读字。

问题可以分成三类，后面写进 Skill 的评审清单就是对着这张图列的。

**外形即语义。** `model/v1/network/scene.glb` 是地球仪，只给公网入口。网关继续用它，读者会以为云侧还有一个 Internet。防火墙要用 `firewall1`（立方体加盾），`firewall` 在图里就是一堵砖墙。本地库用 `database-server`（机架），云库用 `database`（圆柱）。对象存储必须走 `storage`。图库路径编造或 Mermaid 图标未命中，都会变成带 `?` 的立方体。

**禁边比连边更重要。** 分支里的 PC 和笔记本不应当互连，应当各自上联核心交换机。出云不应当从某台应用服务器“顺便”连出去，应当防火墙到混合网关。云上的 K8s、CloudDB、OSS 从网关并联，不要串成糖葫芦。

**版式是拓扑的一部分。** 全图一种台面色时，分区只存在于标题文字里。斜线穿过机柜时，关系在几何上成立、在阅读上失败。终端和机柜一个大小，分支区会抢视觉。官方模板用悬浮标签；初稿只有贴地文字，俯视还能读，透视就挤在台面上。

按上述规则用脚本重生成 JSON、导入空画布之后，场景变成下面这样。

![修订后导入编辑器：本地蓝、云区橙、分支绿，网关改为路由器](images/03-hybrid-revised-editor.png)

图 3：修订稿在编辑器中的状态。本地数据中心保持浅蓝；公有云改为浅橙；分支改为浅灰绿。VPN 网关换成路由器并改橙色材质；K8s 用应用服务器外形，OSS 用存储柜；终端缩小并分别上联；跨区链路用虚线。右侧“场景元素”树与 JSON 数组一一对应，改哪一个节点，就改哪一条记录。

JSON 导入会覆盖当前场景。习惯是先导出备份，或在“创建新绘图”后的空画布里导入。导入后按 `R` 看全景，再切 `V` 查折线是否轴对齐。

## 五、Mermaid 只起稿，还要防编辑器自动化

入口是 `https://icraft.gantcloud.com/app/editor?defaultOpen=mermaid`。`architecture-beta` 的组名、服务 id、括号里的图标名都不能有空格。`On-Prem DC`、`Web Server` 会直接解析失败，写成 `OnPremDC`、`WebServer` 才能过。

图标名对上图库是另一件事。不要假设 `Gateway` 或 `Cloud` 会得到独立网关或 Kubernetes 模型。这次 `HybridGW` 就被映射成地球仪，和 Internet 撞车。起稿成功后，仍要在 JSON 阶段按已验证路径替换模型。

如果智能体用浏览器代填 Mermaid：Chrome DevTools 的 `fill` 对 Monaco 会 **逐行递增缩进**，代码会在写入过程中坏掉。正确做法是取出 webpack 里的 `monaco.editor.getEditors()[0]`，一次 `setValue(code)`。首次打开编辑器还有更新日志和“创建新绘图”弹窗，无障碍快照点不准时，按按钮文案用脚本 `click()`。

这些都是编辑器实现细节，不应当每次会话重新探索。写进 Skill 的“已知陷阱”，就是为了让下一轮作业从 JSON 生成开始，而不是从找菜单开始。

## 六、Skill 把什么变成可执行规则

线上目录与本地副本结构相同：

| 路径 | 职责 |
|------|------|
| [`SKILL.md`](https://github.com/GGquanta/Skills/blob/main/skills/icraft-3d-architecture/SKILL.md) | 触发词、交付优先级、六步清单、给用户的回复模板 |
| [`references/element-schema.md`](https://github.com/GGquanta/Skills/blob/main/skills/icraft-3d-architecture/references/element-schema.md) | 元素字段、高度约定、`points` 扁平坐标 |
| [`references/model-catalog.md`](https://github.com/GGquanta/Skills/blob/main/skills/icraft-3d-architecture/references/model-catalog.md) | 已在图库验证的 GLB 路径和分区色 |
| [`references/review-checklist.md`](https://github.com/GGquanta/Skills/blob/main/skills/icraft-3d-architecture/references/review-checklist.md) | 模型、拓扑、版式、数据完整性 |
| [`scripts/icraft_scene.py`](https://github.com/GGquanta/Skills/blob/main/skills/icraft-3d-architecture/scripts/icraft_scene.py) | `area` / `model` / `line` 工厂，以及 `linkLineKeys` 三向闭合校验 |

智能体被要求先抽出四张表：分区、节点、边、**禁连**。混合云的默认拓扑写在 Skill 里，可按项目裁剪，但禁连默认生效：终端不互连，云资源不串联。

坐标约定固定：`x` 左右，`z` 前后，`y` 向上。台面 `y = 0`，连线 `y = 0.22`，地面文字 `y = 0.21`。折线每次只改 `x` 或只改 `z`。专线、VPN 用虚线；访问方向用单箭头，不要照抄导出里常见的 `doubleArrow: true`。

材质 `color` 是按 GLB 槽位排列的数组。换模型时必须整组替换，长度不匹配时颜色会错位。路由器改成网关时，槽位可以不变，把主色从蓝换成橙，标签写成“VPN Gateway”。

生成后先跑校验：`key` 唯一，每条线的两端都是 `model`，每个模型列出的线都能在数组里找到。校验通过再交给人导入。对话里不要贴整份 JSON，只给路径和“相对原稿改了模型 / 拓扑 / 版式”三条。

本仓库若已安装该技能，目录在 `.agents/skills/icraft-3d-architecture/`。对外分发以 GitHub 上的 [GGquanta/Skills](https://github.com/GGquanta/Skills/tree/main/skills/icraft-3d-architecture) 为准。

## 七、适用边界

这套做法适合网络、混合云、机房和云产品拓扑，也就是“分区 + 设备 + 连线”能说清的图。它不替代方案正文，也不保证图库以后新增的 Kubernetes 专用模型一定出现在 catalog 里。catalog 只收录作业中验证过的路径；新资产要先在编辑器里单击落盘，确认 `options.type` 后再写入参考文档。

iCraft 的产品界面、快捷键和 JSON 字段可能随版本变化。Skill 里的 webpack / Monaco 写法属于当前 Web 编辑器的实现，上游打包方式一变就会失效。失效时回到汉堡菜单的 JSON 导入导出，不要在加密 `.icraft` 上加补丁。

人仍然负责最后一眼：相机角度、投影是否挡字、客户是否接受英文标签。Skill 保证的是智能体不再把网关画成地球仪、不再让笔记本经台式机中转、不再交出一份无法二次导入的二进制。
