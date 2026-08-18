# 学习即仿真：以词汇为锚点的双语世界模型

> lazeword 的概念文档。所有学术引用均于 2026-08 逐条核实，完整格式见文末参考文献。
> 姊妹篇：[research-physics-simulation.md](./research-physics-simulation.md)（物理仿真引擎 × 自动驾驶 × 机器人行业调研）、
> [scenario-engine.md](./scenario-engine.md)（核心引擎：词=实体、句=场景、电影=场景序列）。

---

## 一、一句话使命

**以词汇为锚点，帮孩子构建双语的世界模型 —— 学习即仿真，轨迹即日志。**

## 一·五、为什么还要学英语（AI 时代）

> 大模型把翻译做得又快又好，为什么还要花这么多时间学英语？
> 因为语言不只是知识的容器，还塑造思维方式——transformer 的发明者来自英语世界，
> AI 的竞争主要发生在中美之间，而香港的教育恰好站在这个交叉点上。
> 所以学的不只是单词，而是 **token**——和 AI 交流的最基本单位。
>
> 还有一件事：为什么这个项目里，有这么多自动驾驶和仿真的内容？
> 因为本质上，**单词、语言，就是对真实世界的仿真**。人的眼睛和耳朵，就像自动驾驶汽车
> 的摄像头与雷达——传感器。大脑从来不能直接看到真实世界，它看到的，是对接收到的数据
> 加工、预测、仿真出来的结果（科学家管这叫「预测加工」：Rao & Ballard 1999；Friston 2010；
> Clark 2013）。词汇，就是这个世界模型里的一个个锚点——学单词，就是在给自己的世界模型
> 装传感器、标地标。
>
> 很多科幻小说都写过：也许世界本身就是一场仿真。这个问题的科学版还没有答案。
> 但无论答案是真是假，值得学会一件事：对自己看到的、听到的、学到的，
> 保持「可验证的怀疑」——像工程师验证传感器数据一样，去验证接收到的每一个世界。
> 这比相信任何结论都重要。

> 这个程序本身，就是一台 **autoresearch 机器**——这是「学习即仿真」最直接的具身证明。

lazeword 不是又一个背单词工具，而是一个**确定性的学习仿真系统**：
单词是锚点，间隔重复是记忆的模拟器，学习轨迹是可重放的仿真日志，
学科 packs 是可组合的仿真组件。它开源、署名、善意，面向香港「两文三语」教育的真实家庭场景。

## 二、理论基础（四条已核实的研究线索）

### 1. 大脑是预测机器，学习是修正预测模型

预测加工理论（predictive processing）是当代认知科学最活跃的框架之一：
视觉皮层以「预测—误差修正」方式工作（Rao & Ballard, 1999）；自由能原理把预测加工
推广为统一的大脑理论（Friston, 2010）；认知科学界对其权威综述见 Clark (2013)。
对学习产品的直接推论：**学习不是存储，而是持续修正对世界的预测模型** ——
孩子每一次「记得 / 忘了」都是在更新一个预测：下次见到这个词，我认得的概率是多少？

### 2. word 是人类可操作的知识锚点

词频服从幂律（Zipf, 1949）：极少数高频词覆盖大部分文本。
Nation (2006) 的实证数据：**2,000 词族覆盖小说文本约 87.8%、口语约 89.4%**；
98% 覆盖需要 6,000–9,000 词族（视媒介）。
而英语母语青年平均词汇量约 4 万–4.2 万词族（Brysbaert et al., 2016）——
学习者必须取舍。结论：**1,000–5,000 个精选词 + 学科术语，是最优投入产出比的"世界模型接口层"**。
词是接口，不是全部知识 —— 配套文章、例句与练习，才是理解本身。

### 3. 遗忘有规律，复习调度是可计算的

遗忘曲线的开创性实验来自 Ebbinghaus (1885)。一百多年后，
Ye et al. (2022, KDD) 用随机最短路径优化把「何时复习」变成可解的最优化问题
（FSRS 算法，现为 Anki 新一代调度器同族）。
FSRS 的核心是把记忆状态建模为可计算的量：**稳定性 S、难度 D、保留率 R(t,S)**
—— 一段记忆何时会忘，是一个确定性的预测。

### 4. 世界模型：从机器学习到人类学习

机器学习界的「世界模型」思想（Ha & Schmidhuber, 2018；LeCun, 2022）主张
智能体在预测世界的模型中学习与规划。lazeword 取这一洞见的**弱版本**而非强版本：
不宣称 transformer 证明了什么，只承认一个朴素事实 ——
**学科 = 术语集 + 交互方式，词汇是概念的锚点**（见第五节 packs）。
习得性输入理论（Krashen, 1982/1985）提示内容难度略高于当前水平（i+1）
最利于习得，这是「可理解输入」的经典表述；学界的批评集中在它的强断言，
故本处仅作为"有影响力的经典理论"引用。

## 三、三大工程支柱

### 支柱一：轨迹 = 确定性仿真日志

每次学习行为（认识、答错、记得、忘了、考试、游戏、Anki 复习）追加一条**不可变事件**
（事件溯源，Fowler, 2005）：`{seq, source, type, t, ...}`，上限 20,000 条 + 确定性压缩。

- **状态 = fold(事件)**：任何当前状态（含 FSRS 调度状态）都是轨迹的物化视图，
  同一事件序列 + 同一时钟 ⇒ 同一状态（时空确定性）。
- 可复现研究的经典原则（Buckheit & Donoho, 1995）：论文只是学问的广告，
  可重放的计算才是学问本身。学习日志同理 —— 热力图、统计、复习队列全部可从日志重算。
- 与仿真行业的呼应：确定性回放是 Jolt/Chaos Cache 的卖点，
  也是 physics-simulation 调研中"确定性是稀缺资产"结论的落地。

### 支柱二：FSRS = 记忆模拟器

调度器从固定间隔（1→3→7→15→30 天）升级为 **FSRS-5**（与 Anki 同参数体系）：

- `R(t,S) = (1 + FACTOR·t/S)^DECAY` —— 对"多久会忘"的确定性预测；
- 每次复习按评级更新 `(S, D)`，间隔 = 保留率目标的函数；
- 儿童两按钮 UI 只发评级 1（忘了）/ 3（记得）；2/4 由 Anki 导入事件带入；
- 忘词 = 回炉（错题本立即 / 复习 10 分钟后），这是产品语义对 due 的覆盖，公式不变。

**参数即物理常数**：默认 FSRS-5 参数是"记忆物理"的公开常数，
同一事件流在 Anki 与 lazeword 中给出同一调度 —— 这就是"学习仿真"的保真度来源。

### 支柱三：packs = 可组合组件（学科即场景）

「科学就是按科分类」的产品化：每个学科 pack = manifest + 词表 + 可选题型代码，
构建时静态组合进单文件（零运行时插件加载，保持离线单文件形态）。

| pack | 内容 | 词数 |
|---|---|---|
| english（内置） | Vocabineer 947 + 校园 + Oxford 5000（KET/PET/FCE） | 4,014 |
| math | EDB《數學科常用英漢辭匯》2020 + 算术练习/公式填空题型 + 公式参考页 | +1,600+ |
| science | EDB 科学 S.1-S.3 / 生物 / 物理 / 化学辞汇表 | +5,800+ |
| geography | EDB《中學地理科常用英漢辭彙》2025 | +3,500+ |
| autodrive（规划） | 取材自 physics-simulation 调研的自动驾驶术语（sensor fusion / LIDAR / world model / sim2real…） | 规划 |
| culture（规划） | 公版经典（三字经/千字文/唐诗）反向词条：中文词 → 英文释义，粤普发音 | 规划 |

## 三·五、与 dsh 的契约：时空可组合性

lazeword 的「时空确定性」不是自造概念——它的上游理论是 Cordis 框架的设计论文
《A Programming Paradigm for Spatiotemporal Composability》（Shi, Zhang & Cui，预印本）：
把插件树视为具有时空独立性的可组合单元，声明式组合、生命周期可逆。
我们对照 dsh 的工程约定（参考 antinomie-lab/dsh-explore 的逐行考证）逐条落地：

| dsh 约定 | lazeword 的对应 |
|---|---|
| 三段式分包（Definition/Provider/Consumer） | lazeword = 消费方插件（inject 6 个 client 包，消费 slots/locale 服务）；宿主 apply 为空 = 合规（纯 UI 插件无注册、无 dispose 面） |
| 注册表式 vs 独占式服务 | packs = **构建期注册表**：新学科/题型以 manifest 登记，构建时静态组合——高频变动停在 pack 层，不惊动核心 |
| 声明式组合（cordis.yml/patch 层叠/preset） | cordis.patch.yml 一行 insert 进入编排层；构建管线 = 声明式的数据组合（marker 注入 + pack 合并） |
| 一切注册走 ctx.effect（可逆生命周期） | 单文件内的一切动态注册走事件溯源轨迹（append-only + 确定性折叠）——同样无中间态、可精确回滚 |

发布前可用 `dsh --profile web --dump-config` 验证插件树层叠正确（见 README 发布检查清单）。

## 四、跨平台统一：Anki 是同一世界的另一扇门

- 推送：词表一键同步进 Anki（createDeck + addNotes）；
- 拉取：Anki 复习记录导入为 `source:"anki"` 事件，**并入同一条轨迹时间线**，
  FSRS 状态由合并后的完整事件流折叠得出 —— 单一事实源，双平台不打架；
- 幂等：按 revlog id 游标去重；迁移快照（seed）是确定性 checkpoint。

## 五、产品决策记录（为什么这样做）

1. **考试正确不产生调度事件** —— 考试是检验，不是复习；改期复习日程会惊吓用户。
   首错仍入错题本（评级 1 + 立即到期）。
2. **两按钮评级** —— 儿童用户只需要「記得 / 忘了」；Hard/Easy 留给 Anki 生态。
3. **迁移不删旧数据** —— 旧 `{stage,due}` 保留 + 合成 seed 事件，
   旧版本代码回滚仍可读。
4. **数学题型不入词库错题本** —— 算术题的错不指向某个单词。
5. **选项恒为正整数** —— 负数是另一个认知阶段的知识，不混入算术练习。

## 六、AI 学习队友：进化的诚实定义

lazeword 的 AI 能力（AI 故事、AI 讲解、dsh 集成）是**工具**，不是自封的"会进化的老师"。
可靠的"学习队友"建立在不自欺的地基上：

- 事件溯源轨迹 = 队友的**记忆**（它读的是完整时间线，不是拍脑袋）；
- FSRS = 队友的**遗忘模型**（它预测你何时会忘，而不是猜）；
- dsh 插件化 = 队友的**生长方式**（新能力以插件加入，版本可审计、可回滚）。

"不断进化"的真实含义是：社区贡献 + 版本迭代 + 数据驱动调参 —— 而不是一个
不可验证的自进化承诺。善意 = 开源 + 署名 + 不夸大。

## 参考文献（2026-08 核实）

1. Rao, R. P. N., & Ballard, D. H. (1999). Predictive coding in the visual cortex: A functional interpretation of some extra-classical receptive-field effects. *Nature Neuroscience*, 2(1), 79–87. [DOI:10.1038/4580](https://doi.org/10.1038/4580)
2. Friston, K. (2010). The free-energy principle: A unified brain theory? *Nature Reviews Neuroscience*, 11(2), 127–138. [DOI:10.1038/nrn2787](https://doi.org/10.1038/nrn2787)
3. Clark, A. (2013). Whatever next? Predictive brains, situated agents, and the future of cognitive science. *Behavioral and Brain Sciences*, 36(3), 181–204. [DOI:10.1017/S0140525X12000477](https://doi.org/10.1017/S0140525X12000477)
4. Nation, I. S. P. (2006). How large a vocabulary is needed for reading and listening? *The Canadian Modern Language Review*, 63(1), 59–82. [DOI:10.3138/cmlr.63.1.59](https://doi.org/10.3138/cmlr.63.1.59)（2,000 词族 ≈ 87.8% 小说 / 89.4% 口语；98% 需 6,000–9,000 词族）
5. Brysbaert, M., Stevens, M., Mandera, P., & Keuleers, E. (2016). How many words do we know? Practical estimates of vocabulary size dependent on word definition, the degree of language input and the participant's age. *Frontiers in Psychology*, 7, 1116. [DOI:10.3389/fpsyg.2016.01116](https://doi.org/10.3389/fpsyg.2016.01116)
6. Zipf, G. K. (1949). *Human Behavior and the Principle of Least Effort*. Addison-Wesley Press.
7. Ebbinghaus, H. (1885). *Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie*. Duncker & Humblot.（英译 1913: *Memory*, trans. Ruger & Bussenius）
8. Ye, J., Su, J., & Cao, Y. (2022). A stochastic shortest path algorithm for optimizing spaced repetition scheduling. *Proceedings of KDD '22*, 4381–4390. [DOI:10.1145/3534678.3539081](https://doi.org/10.1145/3534678.3539081)
9. Ha, D., & Schmidhuber, J. (2018). World models. arXiv:1803.10122；NeurIPS 2018 版：Recurrent world models facilitate policy evolution. *NeurIPS 31*, 2455–2467.
10. LeCun, Y. (2022). A path towards autonomous machine intelligence (Version 0.9.2). OpenReview. https://openreview.net/pdf?id=BZ5a1r-kVsf
11. Krashen, S. D. (1982). *Principles and Practice in Second Language Acquisition*. Pergamon Press；Krashen, S. D. (1985). *The Input Hypothesis: Issues and Implications*. Longman.
12. Fowler, M. (2005, December 12). Event sourcing. https://martinfowler.com/eaaDev/EventSourcing.html
13. Buckheit, J. B., & Donoho, D. L. (1995). WaveLab and reproducible research. In *Wavelets and Statistics* (Lecture Notes in Statistics, vol. 103), 55–81. Springer. [DOI:10.1007/978-1-4612-2544-7_5](https://doi.org/10.1007/978-1-4612-2544-7_5)
14. 香港教育局辖下语文教育及研究常务委员会（SCOLAR）：Biliteracy and Trilingualism Campaign. https://scolarhk.edb.hkedcity.net/en/Biliteracy_and_Trilingualism_Campaign/index.html
15. Shi, Y., Zhang, W., & Cui, T. A Programming Paradigm for Spatiotemporal Composability. 预印本（草稿 2026-08-13，持续修订）[github.com/cordiverse/paper](https://github.com/cordiverse/paper)。（dsh 时空可组合性的理论根基；机制考证见 antinomie-lab/dsh-explore《Cordis 在做什么：从 DeepSeek Harness 看》）
16. memvid（2026，Apache-2.0，Rust）：AI 记忆库——全文/向量/时间三层索引合成一个 `.mv2` 文件（WAL + 数据段 + 索引段）。「好的抽象不是加一层，是把三层合成一个文件」：lazeword 的单文件哲学（轨迹 + 状态 + 词库合一）的行业印证；亦是 dsh AI 老师记忆库的候选基础设施（见应用内生態推薦）。https://github.com/memvid/memvid

## 路线图：世界模型 × 教育内容（近 / 中 / 远期）

学科融合游戏与本地 AI 内容生成是两条主线。诚实标注硬件依赖：

| 阶段 | 内容 | 依赖 |
|---|---|---|
| 近期 | 单词五子棋已上线；3D 单词赛车（学科场景：数学/地理/自动驾驶/文化主题赛道）；AI 故事配图 | Web 技术即可（canvas/WebGPU） |
| 中期 | **本地 LLM**（如 antirez 的 [ds4](https://github.com/antirez/ds4)：DeepSeek 4 纯 C + Metal 本地推理，21k+★）→ AI 故事/讲解零 API 成本、完全离线；**本地语音**（voxtral.c / qwen-asr）→ 可靠的跟读打分与语音控制（替代不可靠的浏览器语音识别） | Apple Silicon + 16GB+ 统一内存 |
| 远期 | **本地世界模型生成学习视频**（antirez 的 [h3.c](https://github.com/antirez/h3.c)：MiniMax-H3 视频生成；[iris.c](https://github.com/antirez/iris.c)：Flux 2 图像生成）→ 单词场景短片（"red fox walks through snow" 学 forest/fox/snow）、科学演示动画 | M3 Max/M5 Max 级硬件 |

与 antirez 系列的哲学共鸣：vertical slices、**deterministic first**、纯 C 零依赖、本地离线 ——
与 lazeword 的「时空确定性 + 单文件零依赖 + 离线优先」同一 DNA。
这也正是「AI 学习队友」的本地化终局：世界模型在家庭设备上运行，不依赖任何云。

## 署名

数据与代码的完整来源、许可与用途限制见 [ATTRIBUTIONS.md](../ATTRIBUTIONS.md)。
