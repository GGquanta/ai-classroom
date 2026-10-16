---
title: 用 Horizon 做一份每天寄到邮箱的个人新闻日报
description: 从安装 Horizon、按自己的兴趣接信息源，到每天定时把中文日报发到企业邮箱。含评分门槛、定时任务，以及把安装和排错交给 Cursor 的提示词。
author: niuqq
date: 2026-10-16
tags:
  - horizon
  - rss
  - deepseek
  - 日报
category: tools
cover: /assets/horizon-daily-briefing/cover-v2.jpg
---

# 用 Horizon 做一份每天寄到邮箱的个人新闻日报

[Horizon](https://github.com/Thysrael/Horizon) 是一个开源的个人新闻雷达。它从你指定的源抓最近一天的内容，按你设的读法打 0–10 分，丢掉低分和重复报道，再给留下来的条目补背景，生成一份中文 Markdown 日报。官方每天都在跑一份公开演示：[thysrael.github.io/Horizon](https://thysrael.github.io/Horizon/)。

这份日报可以停在本机文件里，也可以每天定时发到自己的邮箱。下面按这个顺序做：**装好并跑出第一份 → 换成你关心的源 → 定时发信**。安装、改配置、排错都可以交给 Cursor 一类的 AI 助手，密钥和邮箱授权码自己写进文件，不要贴进对话。

---

## 1. 它实际做了什么

一条流水线，没有单独的「兴趣开关」：

1. 抓取。RSS、Hacker News、Reddit、Telegram、GitHub Release、Twitter/X 等，默认看最近 24 小时。
2. 路由。每条内容进一个 Profile。`tech-news` 看事件和背景，`tech-blog` 看方案和可借鉴的点。
3. 打分。模型按这套规则打 0–10 分。新闻门槛常见是 7 分，长文可以低到 4 分。
4. 去重和限量。同一件事并成一条，再用分类配额避免某一类占满整份日报。
5. 补充。给留下来的条目补背景、影响和社区讨论。
6. 投递。写成 `data/summaries/horizon-日期-zh.md`。配了邮件的话，同一次运行结束就寄出。

源决定候选池，门槛决定留下多少。模型不会自己猜你喜欢什么。

---

## 2. 先准备这三样

- [uv](https://github.com/astral-sh/uv)。Horizon 要求 Python ≥ 3.11。macOS 自带的往往是 3.9，用 `uv sync --python 3.12` 即可，不必改系统 Python。
- 一个模型 API Key。本文用 DeepSeek，项目里的 provider 名就是 `deepseek`，默认模型 `deepseek-chat`，地址 `https://api.deepseek.com`。
- 一个邮箱，后面发日报再用。腾讯企业邮的发信服务器是 `smtp.exmail.qq.com`，端口 465。

GitHub Token 可以后补。没有它，未登录接口每小时大约 60 次，盯几个仓库 Release 时很容易 403。

Twitter/X 要另外的 Apify Token，微信推送有回复条数限制。刚开始先不接这两项。

---

## 3. 装好并跑出第一份日报

```bash
git clone https://github.com/Thysrael/Horizon.git ~/Horizon
cd ~/Horizon
uv sync --python 3.12
cp .env.example .env
```

在 `.env` 里写上 Key。这个文件已被 Git 忽略：

```bash
DEEPSEEK_API_KEY=sk-你的key
```

复制示例配置再改，比手写一份空 JSON 不容易漏字段：

```bash
cp data/config.example.json data/config.json
```

把 `data/config.json` 收成最小的一套。第一轮只留 RSS、Hacker News 和一个仓库 Release，语言只出中文：

```json
{
  "ai": {
    "provider": "deepseek",
    "model": "deepseek-chat",
    "api_key_env": "DEEPSEEK_API_KEY",
    "languages": ["zh"]
  },
  "sources": {
    "rss": [
      {
        "name": "Simon Willison",
        "url": "https://simonwillison.net/atom/everything/",
        "enabled": true,
        "category": "ai-tools",
        "profile": "tech-blog"
      }
    ],
    "hackernews": {
      "enabled": true,
      "fetch_top_stories": 20,
      "min_score": 100,
      "category": "tech",
      "profile": "tech-news"
    },
    "github": [
      {
        "type": "repo_releases",
        "owner": "astral-sh",
        "repo": "uv",
        "enabled": true,
        "category": "oss",
        "profile": "tech-news"
      }
    ]
  },
  "processing": {
    "profiles_dir": "profiles",
    "default_profile": "tech-news",
    "profile_settings": {
      "tech-news": { "threshold": 7.0, "topic_dedup": true },
      "tech-blog": { "threshold": 4.0, "topic_dedup": false }
    }
  },
  "digest": { "max_items": 12 }
}
```

示例配置里还有 Reddit、Telegram、邮件。邮件那段如果只写 `{"enabled": false}`，启动会报缺 `smtp_server`。刚开始先删掉 `email` 字段，需要发信时再按第 5 节整段补上。

然后：

```bash
uv run horizon --hours 24
```

日报在 `data/summaries/horizon-日期-zh.md`。打开看三件事：源有没有抓到、留下的条数是不是你真的想读的量、背景补充是不是在复述标题。这三件对了，再加源。

一次 16 条左右的抓取，DeepSeek 大约用掉 5 万 token，一两分钟能跑完。

---

## 4. 把日报改成你关心的主题

Hacker News 热帖是综合科技。你关心的主题只有写进 `sources` 才会稳定出现。兴趣预设在 `data/presets.json`，按领域列了现成的 RSS、Reddit 和 GitHub。先选定一个领域，把对应源抄进 `config.json`，再给这些源标上同一个 `category`。

假如兴趣是人工智能，预设里的「人工智能 / 机器学习」可以这样用：

| 源 | 抓什么 |
| --- | --- |
| Reddit `MachineLearning`、`LocalLLaMA` | 论文讨论和本地模型 |
| 量子位、新智元 | 中文资讯，微信公众号转成的 RSS |
| GitHub `karpathy` | 这个用户的公开动态 |
| `vllm-project/vllm` 的 Release | 推理引擎版本 |

换一个兴趣就换一批源。看安全，就改用预设里的 `netsec`、Krebs on Security；看系统，就改用 LWN、Brendan Gregg。配法相同：源上的 `category` 写你的主题名，`digest.category_groups` 给这个主题留配额，其余来源用 `default_group_limit` 封顶。下面仍用人工智能当例子，主题栏最多 8 条，综合科技最多 4 条，Hacker News 再热也占不满：

```json
"digest": {
  "max_items": 12,
  "profile_order": ["tech-news", "tech-blog"],
  "category_groups": {
    "ai": {
      "name": "AI",
      "limit": 8,
      "categories": ["ai-news", "ai-tools", "llm-inference", "machine-learning", "llm"]
    }
  },
  "default_group": "other",
  "default_group_limit": 4
}
```

配额发生在打分之后。源抓到了，不代表会写进日报。下面几件是实跑时会碰到的：

- **时间窗口。** `--hours 24` 只看最近一天。有些源一天只发一批，比如上面的量子位，发布时间只要早于窗口起点，抓取结果就是 0。想先看到它们，用 `uv run horizon --hours 48` 跑一次。每天定时发的那次仍用 24 小时，避免同一批内容连寄两天。
- **门槛。** 新闻默认 7 分。博客和日更资讯经常被打到 7 分以下，日志里会看到「抓到了 9 条」，日报里却没有。把 `tech-news` 的 `threshold` 调到 5，主题配额仍是 8 条，其他来源仍被 `default_group_limit` 卡住。
- **GitHub 403。** 未登录额度用完后，用户动态和 Release 全部失败。把 Personal Access Token 写进 `.env` 的 `GITHUB_TOKEN`。
- **Reddit 限流。** `LocalLLaMA` 经常 429 或 403，`MachineLearning` 有时还能回来几条。这是源站限制，多跑一次不一定更好。

终端里这两行用来判断配额有没有生效。沿用上面的例子时，`AI: 2/8` 表示主题栏只过线 2 条，`other: 4/4` 表示其他来源已经顶满。分组名字就是你在 `category_groups` 里起的键。

---

## 5. 每天定时发到邮箱

发信挂在同一次 `uv run horizon` 上。日报写完就会寄给 `data/subscribers.json` 里的地址。

腾讯企业邮先在网页里打开客户端协议：设置 → 收发信设置，勾选「开启 IMAP/SMTP 服务」。只勾选不会生效，页面最下面要点「保存更改」。

然后在企业邮里生成**客户端专用密码**，写进 `.env`，不要用网页登录密码：

```bash
EMAIL_PASSWORD=客户端专用密码
```

`data/subscribers.json` 是收件人名单，不是发信账号。文件内容是一个 JSON 数组，每项是一个邮箱地址。日报生成后会逐个寄给这里的地址。只发给自己时，写自己的邮箱；要同时给同事，就再加几项：

```json
["you@your-company.com", "teammate@your-company.com"]
```

`data/config.json` 补上整段邮件配置。只发给自己时关掉 IMAP，不用做「回复 SUBSCRIBE 才订阅」：

```json
"email": {
  "enabled": true,
  "smtp_server": "smtp.exmail.qq.com",
  "smtp_port": 465,
  "smtp_username": "you@your-company.com",
  "imap_enabled": false,
  "imap_server": "imap.exmail.qq.com",
  "imap_port": 993,
  "email_address": "you@your-company.com",
  "password_env": "EMAIL_PASSWORD",
  "sender_name": "Horizon Daily"
}
```

登录失败时，服务器常返回 `535 authentication failed, system busy`。先确认 SMTP 已经保存成功，再确认 `.env` 里是专用密码。连续失败多次后先停一两分钟，避免账号被临时锁住。

macOS 用 launchd 每天固定跑一次。几点发由 `Hour` 和 `Minute` 决定，下面示例是 16:10，改成你自己的时间即可。把文件存成 `~/Library/LaunchAgents/com.niuqq.horizon-daily.plist`，路径和 uv 位置按自己的机器改：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.niuqq.horizon-daily</string>
  <key>WorkingDirectory</key>
  <string>/Users/you/Horizon</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/you/.local/bin/uv</string>
    <string>run</string>
    <string>horizon</string>
    <string>--hours</string>
    <string>24</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>16</integer>
    <key>Minute</key>
    <integer>10</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/Users/you/Horizon/logs/horizon-daily.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/you/Horizon/logs/horizon-daily.err</string>
</dict>
</plist>
```

加载：

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.niuqq.horizon-daily.plist
```

改过时间之后要先 `bootout` 再 `bootstrap` 一次。到点时 Mac 要醒着，合盖睡眠会拖到下次唤醒。日志在项目的 `logs/horizon-daily.err`，里面能看到抓了多少条、邮件有没有发出去。

电脑要经常合盖的话，可以用仓库里的 GitHub Actions 模板 `.github/workflows/daily-summary.yml.disabled`。去掉 `.disabled`、把仓库推到自己的 GitHub，并把 `DEEPSEEK_API_KEY` 放进仓库 Secrets。注意工作流复制的是 `data/config.github.json`，不是你本机那份被 Git 忽略的 `data/config.json`。云端要盯同一批源，得把源配置写进 `config.github.json` 再提交，Key 不要进文件。

---

## 6. 邮件里要看到标题，而不是 Markdown 符号

Horizon 发信时会带纯文本和 HTML 两份正文，邮箱优先显示 HTML。如果收到的信里全是 `#`、`**` 和 `>`，有两种情况。

一种是发送时只附了纯文本。定时任务走 `EmailManager.send_daily_summary` 时会两份都带。

另一种是源码里先做了 `html.escape`，再交给 Markdown 转换。`>` 被转成普通字符之后，引用、加粗和标题都会坏掉。`src/services/email.py` 的 `send_daily_summary` 里应先转换 Markdown：

```python
cleaned_summary = clean_app_summary_markdown(summary_md)
if markdown:
    html_content = markdown.markdown(
        cleaned_summary,
        extensions=["extra", "sane_lists"],
    )
else:
    html_content = f"<pre>{html.escape(cleaned_summary)}</pre>"
```

改完再跑一次 `uv run horizon --hours 24`，新邮件里应能看到标题、列表和链接。企业邮网页有时会丢掉 `<style>`，标签本身还在，标题和加粗仍然成立。

---

## 7. 每天怎么用

定时任务跑起来之后，到点之前什么都不用做。想提前看，在项目目录执行：

```bash
uv run horizon --hours 24
```

信没到时，先看 `logs/horizon-daily.err` 末尾是 `Sent summary to` 还是 `SMTP Error`。日报文件始终在 `data/summaries/`，邮件只是同一份内容的另一种出口。

微信可以后加：`uv run horizon-wechat login`，扫码后再给机器人发一条消息。一次上下文大约只能回 10 条，一份带背景的日报很容易把额度用完，所以它不适合无人值守。每天稳定看，用邮件。

---

## 8. 让 AI 助手帮你做

上面的安装、换源、定时发信和排错，都可以交给 Cursor。你自己做两件事：Key 和邮箱授权码写进 `.env`，以及企业邮网页上那一次「保存更改」。助手改完配置后，打开 `data/summaries/` 里的 Markdown，看留下的标题是不是你想读的。

在已经打开终端的对话里，可以直接说：

```text
请把 https://github.com/Thysrael/Horizon 克隆到 ~/Horizon 并跑通第一份中文日报。
用 uv 安装 Python 3.12。模型用 DeepSeek，provider 填 deepseek，模型名 deepseek-chat。
DEEPSEEK_API_KEY 我写在项目 .env 里，不要在对话里复述这把 Key。
第一轮只接一个 RSS、Hacker News，以及一个 GitHub Release。
跑完告诉我日报路径、抓了多少条、留下了哪几条。
```

第一份文件能打开之后，再说第二句：

```text
我的兴趣是：人工智能。
请按 data/presets.json 里对应领域，把源加进 data/config.json，标上 category。
digest 里这个主题最多 8 条，其他来源最多 4 条。
然后用 --hours 48 再跑一次，告诉我哪些源是 0 条，哪些是抓到了但没过 7 分。
```

兴趣换成安全、系统或别的领域时，只改提示词里的「我的兴趣是」那一句，配法不变。

日报看着顺眼之后，把发信和定时也交给它：

```text
请给这个 Horizon 配上每天定时发信。
收件人是 you@your-company.com，写进 data/subscribers.json。
发信账号用同一地址，SMTP 为 smtp.exmail.qq.com，端口 465。
EMAIL_PASSWORD 我写在 .env 里，不要在对话里复述。
用 launchd 每天固定跑 uv run horizon --hours 24，时刻我来定。
配完告诉我 plist 路径，以及怎样确认邮件已经发出。
```
