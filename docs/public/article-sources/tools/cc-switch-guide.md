
# 用 CC Switch 统一管理多个 AI 编程工具

## 为什么会装这么个东西

我电脑上同时装着 Claude Code、Codex、OpenCode，平时会根据任务类型和额度情况切换不同的供应商：官方账号、某个中转渠道、偶尔切到 OpenRouter 聚合一下模型。麻烦的是这几个 CLI 的配置文件格式完全不一样——Claude Code 是 `~/.claude/settings.json`，Codex 是 TOML，其他工具又是各自的格式。每次换渠道都要翻出对应文件手改，Key 粘错一位或者地址多打一个字符，程序就直接连不上，排查起来很浪费时间。

**CC Switch** 是解决这个问题的一款开源桌面工具：把 Claude Code、Codex、Gemini CLI，以及 Claude Desktop、OpenCode、OpenClaw、Hermes 这几款工具的供应商配置统一收进一个可视化界面，切换的时候点一下就行，不需要再手动编辑配置文件。官网是 [ccswitch.io](https://ccswitch.io)，代码开源在 [farion1231/cc-switch](https://github.com/farion1231/cc-switch)。

![CC Switch 主界面](/assets/cc-switch-guide/cc-switch-main-ui.png)

用下来最直接的变化是：以前多个 API Key 靠备忘录记录，切换时来回复制粘贴，出错率不低；现在都保存在这个列表里，选中点"启用"即可，Claude Code 甚至不用重启终端就能生效。除了主界面这种点法，还可以直接在系统托盘图标上右键，从菜单里选供应商名字切换，不用把整个窗口打开，平时切换渠道基本就是这一下的事。

## 安装

| 系统 | 安装方式 |
| --- | --- |
| Windows | 从 [Releases](https://github.com/farion1231/cc-switch/releases) 下载 `.msi` 安装包，或 `Portable.zip` 免安装版 |
| macOS | `brew install --cask cc-switch`，或直接下载 `.dmg`（已通过 Apple 签名公证） |
| Linux | 提供 `.deb`、`.rpm`、`.AppImage`，Arch 用户可用 `paru -S cc-switch-bin` |

第一次打开时，建议先把手上已经能正常用的配置导入进去作为默认供应商，这样万一后面切换出问题，还有一条能用的退路。

## 添加供应商

添加供应商有两种方式：一种是从内置的预设列表里直接选（常见的官方渠道和一些社区中转服务都有现成模板），另一种是完全自定义。自定义的话本质是填一份表单：供应商名称、官网链接、API Key、请求地址、模型配置这几项，保存后回到列表选中它点"使用"即可切换。下面是我自己配置的一个 OpenRouter 供应商的编辑界面：

![编辑供应商表单（图中是我配的 OpenRouter）](/assets/cc-switch-guide/cc-switch-provider-form.png)

添加完之后，供应商会作为一张卡片出现在主界面列表里，卡片上能直接看到名字、官网地址，以及当前有没有在用；如果开了用量查询，还会显示已用额度和剩余多少（后面用量查询那一节会细说）。列表支持拖拽排序，常用的几个可以拖到最上面，不用每次都往下翻。

实际操作中容易踩的几个点：

| 场景 | 容易出的问题 | 处理方式 |
| --- | --- | --- |
| 粘贴 API Key | 从网页复制时带上多余空格或换行 | 保存前点一下输入框旁的"眼睛"图标核对一遍 |
| 填写请求地址 | 末尾多打一个斜杠导致格式不对 | 参照供应商官方文档给的地址原样填写，不额外增删字符 |
| 切换后未生效 | 大部分工具需要重启终端才应用新配置 | Claude Code 是例外，改完立即生效；其他工具切完记得重启一次 |
| 多个工具用同一个渠道 | 分别给 Claude Code、Codex、OpenCode 各配一遍，容易漏改 | 用"通用供应商"功能，一份配置同步写到多个工具，改一处全都生效 |

## MCP、Prompts、Skills 统一管理

这一块我觉得比单纯切模型更实用。因为我平时用的几个 AI 工具都装了不少 MCP 服务和自定义 Skill，以前每个工具的配置目录要分开维护，现在在 CC Switch 里一个面板就能看全。

新增 MCP 服务的界面内置了几个常用模板可以直接选，也支持自定义：

![新增 MCP 服务器](/assets/cc-switch-guide/cc-switch-mcp-panel.png)

Prompts 是一个 Markdown 编辑器，我用它管理给 Codex 单独写的提示词预设，激活后会同步到对应的 `AGENTS.md` 之类的文件里：

![添加 Codex 提示词](/assets/cc-switch-guide/cc-switch-prompts-editor.png)

Skills 面板可以看到当前装了哪些技能、分别启用给了哪个工具，也支持直接搜索安装，或者拿一个 GitHub 仓库链接、ZIP 文件手动导入：

![Skills 管理面板](/assets/cc-switch-guide/cc-switch-skills-panel.png)

这几项配置（供应商、MCP、Prompts、Skills）都存在本地，卸载或者误操作之前会自动生成一份备份，真出问题了可以从备份里恢复，不用担心一次手滑把攒了很久的配置全弄没。

## 用量查询

供应商编辑页里可以开启"用量查询"，选一个预设模板测试后，就能直接看到这个渠道已用额度和剩余额度，不用再单独跑去对应平台的后台页面查：

![配置用量查询](/assets/cc-switch-guide/cc-switch-usage-dashboard.png)

此外它还带一个本地代理功能，可以做请求格式转换、给多个供应商配置自动故障转移。这部分我自己用得不多，日常手动切换已经够用，重度自动化场景可以再单独研究。

## 使用中遇到的问题

| 现象 | 原因 | 解决办法 |
| --- | --- | --- |
| 切换供应商后感觉没生效 | 已经在运行的 CLI 进程不会自动重新读取配置 | 把当前的 CLI 进程（如 `claude`）关掉重新启动一次，不用重启 CC Switch |
| 换到某些中转渠道后个别高级功能失效 | 部分兼容渠道对 Anthropic 协议的支持不完整（如扩展思考、复杂 tool use） | 排查方向是渠道本身而非 CC Switch 配置，可以换一个协议透传更完整的渠道 |

## 小结

CC Switch 解决的核心问题是"少改配置文件、少记 Key"。如果平时只用一个官方账号，装不装区别不大；但只要你会在官方渠道、中转服务、不同模型供应商之间来回切换，或者同时维护好几套 MCP/Prompts/Skills 配置，这个工具能省下不少手动维护的时间和排查配置错误的精力。软件本身免费开源，GitHub 上更新比较频繁，功能也一直在补，装上试试基本没什么成本。

---

## 相关链接

[CC Switch 官网](https://ccswitch.io)

[CC Switch GitHub 仓库](https://github.com/farion1231/cc-switch)
