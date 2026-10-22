
# 用 Opus 写代码做 MG 动画

Vincent（[@VincentWei93](https://x.com/VincentWei93)）用一期教程，把 Opus 5.5 做动态设计的流程讲完，并把 15 种风格的提示词和源码放到了 [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)。教程按复杂度讲了三支片子，最后留下两条他觉得真正抬质感的写法。成片可以在[展示页](https://vincentwei1021.github.io/mg-styles-15/?lang=zh)里带声音看。

这些片子的画面、动画、配乐和音效，都是模型写代码渲染出来的。网页按时间画出任意一帧，无头 Chrome 逐帧截图，ffmpeg 再把画面和音轨合成。用到的是 SVG、Canvas、WebGL 和 Three.js；只有 3D 那支的画面由 Blender 渲染，网页负责叠文字和颗粒。

![一段提示词进去：写代码、逐帧渲染、配乐，再用 ffmpeg 合成，然后换一个 AI 评审两轮](/assets/opus-mg-styles/02-pipeline.jpg)

## 三支片子，一次比一次多条件

他用的是 Claude Code 里的 Opus 5.5。三支片子共用几句要求：用你觉得合适的工具和技术，做出最好、最惊艳的效果，不要靠已经写好的 skill。

### 《火种》：一句话，并禁止抄旧办法

最简单的一支是讲 Anthropic 理念和发家史的《火种》，3 分 44 秒，1920×1080、30 fps。提示词一共 97 个字：

> 帮我制作一个动画，主题描绘Anthropic的理念和发家史；包括音效和音乐；你可以使用任何你觉得合适的工具和技术，做出最好最惊艳的效果，不要使用已有的skill，不要参考以前做过的视频或者文案。

这支没有用 Remotion，也没有用现成的视频素材。渲染器是模型自己用 WebGL 写的。它先写完全片时间表，再分出一个分身去做音乐：钢琴、弦乐、合唱，再加上约 30 种音效，都由 Python 算出来。

后两句是一次测试。他想看模型在不调用已有技能、不参考以前成片和文案时，自己能做到哪一步。

### P5R：第一轮形式不对，就补一句

第二支是《女神异闻录 5 皇家版》的 MAD。素材是歌曲《星と僕らと》的副歌（108 BPM）和一份歌词，后面仍是那几句：用合适的工具，做出最惊艳的效果，不要参考已有的 skill。

这一支走了三轮。

1. 第一轮是一支纯代码 MV。他的评价是效果比较一般，形式也不对。
2. 他补了一句：做成动画 MAD，去下载官方宣传片当素材。模型下载了 18 支官方 PV。
3. 第三轮从这些素材里剪出成片。画面上标着 936 个镜头。

这一支吃的是剪辑和现成画面。下面 15 种风格不走这条路。仓库里的提示词要求素材可以商用，品牌名用虚构的，不要用真实商标。

### 从 22 种风格里留下 15 支

第三支是 15 种风格的合集，也是评论里要提示词最多的一支。他先让 Claude 整理一份风格谱系：国际 MG 17 种，加上抖音、B 站、小红书上常见的 5 种，一共 22 种。每种都要求用这种风格最经典、也最惊艳的样子，做一支 10 秒 demo。

国际的 17 种分成四组：

| 组 | 风格 |
| --- | --- |
| 平面与图形 | 扁平矢量、线条动画、几何构成、形变动画 |
| 三维与质感 | 3D 渲染、等轴 2.5D、液态流动、颗粒质感、弥散玻璃 |
| 手作与拼贴 | 逐帧手绘、拼贴剪贴 |
| 复古与数字 | 复古 Synthwave、蒸汽波、像素风、故障风、酸性设计、赛博 HUD |

中文平台的 5 种是：图文快闪、贴纸手账、国潮新中式、综艺花字、回形针科普。

公开成片、提示词和源码的是其中 15 种。颗粒质感、蒸汽波、故障风、酸性设计、图文快闪、贴纸手账、国潮新中式留在调研里，仓库中没有对应的成片。

## 风格靠可核对的特征

每份提示词分成通用部分和风格专属部分。通用部分所有风格一样：你是这支 10 秒片子的导演、动效、工程和声音；先出关键帧再做运动；画面和声音读同一张节拍表；渲染必须由时间决定，同一时刻每次画出同一帧。风格专属的是四段，写一种新风格只填这四段，模板在 [template.md](https://github.com/Vincentwei1021/mg-styles-15/blob/main/template.md)。

| 段 | 写什么 | 自己用时 |
| --- | --- | --- |
| Style | 风格的中文名和英文名 | 保留 |
| Output | 尺寸、帧率、正好 10 秒、带立体声、响度大约 −14 LUFS | 可以改成竖屏 1080×1920，或改时长 |
| Creative seed | 片名、分秒节拍、3 到 6 个色值、字体气质、音乐和关键音效 | 换成自己的故事、品牌、文案和配色 |
| Signature features | 来源、视觉特征、能执行的技法 | 保留。删了它，风格就认不出来 |

Creative seed 要有节拍，不然会做成一条平的模板。前 0.5 秒要有钩子，开场空画面不超过 0.3 秒；大约 60% 到 75% 的位置有一个记得住的高潮；结尾定住 0.8 到 1.2 秒，画面里还留着很小的动。

Signature features 要能核对。模板里的例子是：弹性用 `cubic-bezier(0.34, 1.56, 0.64, 1)`，元素错开 2 到 4 帧。写成「动效要有弹性」，评审时无从打分。品牌名和文案用虚构的。

15 支成片都是 10 秒。除综艺花字是 1080×1920 竖屏，其余是 1920×1080。逐帧手绘和 3D 是 24 fps，其余 30 fps。下面每张是仓库公开封面里的一帧。成片名后面，先是认得出这种风格的地方，再是这支片实际用的做法。

- **逐帧手绘**，成片「手作 HAND MADE」。线条每隔两帧微抖，快动作有一帧被拉长的拖影，烟和火花是手绘的。Canvas 笔刷，纸纹叠在上面。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/05-cel-boil.md)

![逐帧手绘的一帧：纸纹上，火焰精灵趴在安全火柴盒上](/assets/opus-mg-styles/05-cel-boil.jpg)

- **等轴 2.5D**，成片「ISOPOLIS · 让城市自己生长」。30° 等轴、没有灭点，楼从地面长起来，镜头只平移。Three.js 正交相机，模型和材质用代码生成。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/03-isometric.md)

![等轴 2.5D 的一帧：浅紫微缩城市，中心是一栋发光的高塔](/assets/opus-mg-styles/03-isometric.jpg)

- **扁平矢量**，成片「popwise · One Dot」。纯色几何人物，少描边，元素错峰弹入。一个 HTML 页，SVG 加手写缓动。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/01-flat-vector.md)

![扁平矢量的一帧：四块纯色格子，分别是柱状图、对勾和一颗心](/assets/opus-mg-styles/01-flat-vector.jpg)

- **线条动画**，成片「ATELIER LINEA · 一笔画」。等宽细线一笔连完全片，描完再填成面。一条 SVG 路径，用描边进度驱动。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/02-line-art.md)

![线条动画的一帧：一根金线连成天际线和一轮太阳](/assets/opus-mg-styles/02-line-art.jpg)

- **3D 渲染**，成片「soft. · 柔软着陆」。软胶、玻璃、金属，浅景深，棚拍光。Blender 出序列帧，网页叠字和颗粒。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/04-3d-render.md)

![3D 渲染的一帧：粉色软胶字母 soft 落在一地小球上，旁边是一颗金属球](/assets/opus-mg-styles/04-3d-render.jpg)

- **形变动画**，成片「morphe. · 一形万象」。一个轮廓连成下一个，复杂形状先收成圆再展开。SVG 逐点插值，字标从字体提出轮廓。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/08-morph.md)

![形变动画的一帧：纸纹上一个大红太阳，角标写着日出](/assets/opus-mg-styles/08-morph.jpg)

- **贴纸科普**，成片「一部手机里藏着多少种元素」。照片加粗白边变成贴纸，镜头在大画布上平移，图表跟着长。超大画布加运镜，D3 画图表。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/19-paperclip.md)

![贴纸科普的一帧：手机屏幕上是元素周期表，电池、芯片和磁铁做成白边贴纸](/assets/opus-mg-styles/19-paperclip.jpg)

- **赛博 HUD**，成片「隼眼-9 · 目标锁定」。青橙线框、锁定框、雷达扫描、等宽小字。Three.js 线框地球，Canvas 画界面。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/22-hud.md)

![赛博 HUD 的一帧：青色锁定框套在地球上，中间写着目标锁定](/assets/opus-mg-styles/22-hud.jpg)

- **拼贴剪贴**，成片「NOGGIN 脑洞季刊」。老照片白边、半调网点、头身比例失衡，动作降到 12 fps。公有领域图片剪成素材，按格拼贴。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/06-collage.md)

![拼贴的一帧：报纸底上，半调肖像的头顶翻开，飞出地球、火箭和鸟](/assets/opus-mg-styles/06-collage.jpg)

- **弥散玻璃**，成片「Aurora · 思考，自有光」。大色斑慢慢漂，磨砂玻璃卡片浮在上面，动作很慢。WebGL 着色器画极光和折射。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/12-aurora-glass.md)

![弥散玻璃的一帧：紫蓝光斑上浮着几张磨砂卡片，中间一颗玻璃水滴](/assets/opus-mg-styles/12-aurora-glass.jpg)

- **几何构成**，成片「二十拍构成 KONSTRUKTION」。圆、三角、矩形卡在网格上，红黄蓝黑，一拍一个动作。120 px 网格，按 120 BPM 逐拍搭。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/09-bauhaus.md)

![几何构成的一帧：网格上的红圆、黄三角和蓝块，角标写着第 13 拍](/assets/opus-mg-styles/09-bauhaus.jpg)

- **复古 Synthwave**，成片「NEON DRIVE · 霓虹夜驰 1986」。透视网格、日落、镀铬字，再加上扫描线和色偏。Three.js 场景，自写 VHS 后期。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/10-synthwave.md)

![Synthwave 的一帧：洋红网格路通向落日，镀铬字写着 NEON DRIVE](/assets/opus-mg-styles/10-synthwave.jpg)

- **像素风**，成片「PIXEL QUEST」。大颗粒、有限色、阶梯帧，放大时不抗锯齿。在 320×180 上画，再最近邻放大。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/20-pixel.md)

![像素风的一帧：像素骑士站在石台上，背后是宝箱和 PIXEL QUEST 标题](/assets/opus-mg-styles/20-pixel.jpg)

- **液态流动**，成片「drop. · 万物始于一滴」。拉丝、滴落，两滴靠近会粘在一起。片元着色器里的距离场融球。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/07-liquid.md)

![液态的一帧：四个玻璃字母拼成 drop，底下还挂着水滴](/assets/opus-mg-styles/07-liquid.jpg)

- **综艺花字**，成片「喵呜日记 EP.07」。多层描边的圆字弹入，跟着情绪变，对齐音效。9:16 竖屏，照片加 SVG 花字。[提示词](https://github.com/Vincentwei1021/mg-styles-15/blob/main/prompts/18-hanazi.md)

![综艺花字的一帧：竖屏里一只猫的贴纸，下面弹着一个多层描边的「绝」](/assets/opus-mg-styles/18-hanazi.jpg)

每份提示词正文是英文，用法说明和风格特征是中文。完整技法（缓动曲线、帧数、层结构）写在对应文件的 Signature features 里，上面只留认得出这种风格的那一点。

## 两条能把分数抬上去的写法

22 支 demo 的第一轮平均分是 6.95。各自改了两轮之后，平均分到 7.81。他把这个区间放在业余里很高、刚挨到商业片的位置，并说和自己看片的感觉一致。仓库里最终公开的 15 支，终评在 7.57 到 8.21 之间（满分 10）。

### 把质量尺写死

每份提示词开头都有同一句：目标是这种风格最经典、也最惊艳的样子，达到获奖入围、高端商片的质量；干净、看起来像模板的结果算失败。

这句话会让模型自己定一把尺子。它定出来的刻度是：6 分是模板、剪映水平，8 分是高端广告公司，9 分是获奖入围。提示词里只写「做得好看一点」，它对标的往往就是 6 分。

### 换一个没有制作上下文的会话来打分

第二步是让一个独立的子代理审查。独立指的是：评审会话里没有制作过程的上下文。制作的那个会话不给自己打分。

评审按 7 项打分，单项不低于 7.5 才算过线：风格还原、创意与惊艳、动效工艺、设计与排版、质感与细节、声音与同步、技术规格。等轴那支第三轮的评审卡上，这 7 项分别是 8.5、8.0、7.5、8.0、8.0、7.5、8.5。

仓库里的 [rubric.md](https://github.com/Vincentwei1021/mg-styles-15/blob/main/rubric.md) 就是这段评审提示词，外加一份「把评审贴回制作会话」的修改提示词。用法是：成片出来后另开一个会话，让它抽帧看片、核对时长和响度，按影响从大到小列出改法；再把评审贴回原来的会话改一轮。原片就是制作、评审、修改，走了两轮。

## 换成自己的片子

1. 在空文件夹里打开一个能写代码、能执行命令的助手。本机需要 Node.js 22.12 或更新、Google Chrome、ffmpeg；配乐脚本需要 Python 3.11 或更新。3D 那支还要 Blender。
2. 打开上面任意一份提示词，把「提示词」整段发出去。
3. 只改 Creative seed 里的故事、品牌、文案和配色。要竖屏或改时长，改 Output。Signature features 留下。
4. 成片出来后，用 rubric.md 另开一轮评审，把意见贴回去再改。
5. 想少写渲染和配乐，可以让它直接用仓库里的 `harness/render.mjs` 和 `lib/audio`。

仓库根目录可以这样跑一支现成的片子：

```bash
npm install
pip install -r requirements.txt
python3 demos/01-flat-vector/audio.py
node harness/render.mjs demos/01-flat-vector
python3 -m http.server 8000
```

预览地址是 `http://localhost:8000/harness/preview.html?demo=01-flat-vector`。页面要从仓库根目录起服务。macOS 上 Chrome 会在默认位置被找到，其他系统用环境变量 `MG_CHROME` 指向可执行文件。

写一种仓库里没有的风格时，通用部分从任意一份提示词抄走，只填 template.md 的四段。

几件使用时会碰到的事：

- 同一份提示词每次做出的片子都不一样。原片都经过多轮，跑一次通常到不了那个完成度。
- 字体文件不在仓库里，清单在 `assets/fonts/README.md`。缺字体时，字形会和成片不一样。
- 配乐脚本在同一环境下重跑，结果是确定的。按 `requirements.txt` 的版本重跑，15 支里有 4 支和成片音轨一致，另外 11 支有局部差别，多半是数值库版本变了。
- 自己的片子只用允许商用的素材。代码、提示词、文档和这些成片是 MIT；采样、贴图、字形轮廓各自保留原来的许可。

## 来源

- 教程（流程和两条技巧）：[Opus 5.5 做视频流程和提示词分享](https://x.com/vincentwei93/status/2111798272776179741)
- 15 种风格成片（教程里引用的上一条）：[达到商业制作水准的 15 种风格](https://x.com/VincentWei93/status/2104957548797604116)
- 仓库与中文说明：[Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)、[README.zh-CN.md](https://github.com/Vincentwei1021/mg-styles-15/blob/main/README.zh-CN.md)
- 在线看片：[15 Motion Design Styles](https://vincentwei1021.github.io/mg-styles-15/?lang=zh)
- 评审与新风格模板：[rubric.md](https://github.com/Vincentwei1021/mg-styles-15/blob/main/rubric.md)、[template.md](https://github.com/Vincentwei1021/mg-styles-15/blob/main/template.md)
