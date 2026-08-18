# AI 治理、开源史与「可验证的怀疑」

> lazeword 的立场文档：一场关于 Frontier Regime 的争论、一段开源的历史、一种教给孩子的方法。
> 第一节为本文作者 2026-08 的完整论述；第二至四节综合项目讨论与公开材料。
> 姊妹篇：[learning-as-simulation.md](./learning-as-simulation.md)（学习即仿真）、
> [research-physics-simulation.md](./research-physics-simulation.md)（仿真行业调研）、
> [lightrope/vision](https://github.com/lightrope/vision)（向善的最终章：太空 AI，已迁出 lazeword）。

---

## 一、为什么反对 Frontier Regime：一场争论的复盘

> 本节为本文作者的原文论述（2026-08，略有结构整理）。

对 Dario Amodei 路线的反对，不来自对监管的一般怀疑，而来自一个非常强的前提：

**他整个论证依赖一个假设——我们能够设计出一套足够中立、足够专业、足够公正的制度，去约束最强的 AI 公司。**

问题是谁来定义这套制度。谁定义什么叫 Frontier Model？什么叫危险能力？谁来设计 Eval？谁告诉政府哪些风险值得管？最后拥有最多专业知识、最多数据、最多 Policy 团队、最有能力参与规则制定的人，依然是 Anthropic、OpenAI、Google 这些前沿实验室。

监管被俘获最危险的版本，从来不需要哪个公司偷偷贿赂政府。它完全可能发生在所有人都善意的情况下：政府确实想把事情管好，但全世界最懂这个问题的人，刚好都来自被监管的那几家公司。于是整个监管体系开始使用他们的语言、他们的评测方式、他们对风险的定义。

而技术本身又天然趋向集中：Scaling Law、算力、芯片、资本，都在把能力推向极少数玩家。既然技术已经这么容易集中，「减少进一步的权力集中」就应该放在第一优先级——而不是再建立一套 Frontier Regime，让已经位于前沿的公司成为最熟悉规则、最有能力承担合规成本、也最有能力影响规则的人。

Jensen Huang 当年那句评价现在看还是很狠：「**别在暗房里搞，然后告诉我它是安全的。**」（转述）Baker、Jensen、Zuckerberg 真正担心的东西，Dario 其实没有完全回答。

当然也认同 Dario 说得对的部分：不要靠营销告诉大家 AI 能治癌症。他讲到父亲死于丙肝、几年后才出现能治愈绝大多数患者的药物——这解释了他为什么执着于用 AI 加速生物医学。但把今天公众对 AI 的反感主要归结为一个几十年积累的「信任危机」并不成立：一边喊「这栋楼可能爆炸」，等居民开始反对在旁边建新楼之后，又说他们主要是不信任房地产商——恐惧话语的政治后果，喊的人推卸不掉。

所以这场争论真正清楚了。双方其实都同意：AI 会非常强大、AI 可能非常危险、AI 也可能造成史无前例的权力集中。真正的分歧只有一个：

- **Dario 相信，可以通过好的制度去约束集中起来的权力；**
- **Baker、Jensen、Zuckerberg 更担心，权力一旦集中，本身就是最大的风险之一。**

本文站后者。Dario 不是坏人——恰恰因为他很可能是善意的，这个问题才更值得讨论。因为制度最不应该依赖的假设就是：只要掌握巨大权力的人足够聪明、足够理性、足够善意，一切就会没事。人类试过很多次了。从过往结果来看，实在不值得在 AGI 上再试一次。

**补一刀钢人（本文对上述立场的自我审视）**：权力分散本身不解决灾难外部性——开源模型被用来做坏事时，受害者找谁？答案不是「不要制度」，而是**制度的合法性不能来自对掌权者的信任**：让安全主张**可检验**，而不是可被权威背书。这正是第三节开源史给出的路径，也是 lazeword 用工程实践回答的方式。

## 二、关于立场的说明

> 本项目的立场源于一个朴素的工程信念：善意应当被审计——安全主张应当可检验，
> 而不是可被权威背书。这一信念本身，是开源四十年「可检验性高于权威」传统的一部分。

（教孩子面对分歧的方式不是选边站，而是自己思考——争论双方的论文、引文与立场
都摆在「人與詞」和「AI 論文」里，这是 AI 素养 pack 的最后一课。）

## 三、开源的历史：制度不依赖信任的工程传统

「可检验性高于权威」不是新发明，它有一条超过四十年的谱系：

| 年份 | 事件 | 意义 |
|---|---|---|
| 1983–85 | Richard Stallman 发起 GNU 项目、成立 FSF、写下 GNU Manifesto | 「自由软件」概念诞生：用户拥有检查、修改、分发代码的自由 |
| 1991 | Linus Torvalds 发布 Linux（「just a hobby, won't be big」） | 一个大学生用公开代码库对抗商业操作系统的垄断——最终赢了 |
| 1997 | Eric S. Raymond《The Cathedral and the Bazaar》 | 开源方法论宣言：**「given enough eyeballs, all bugs are shallow」**——质量来自可检验，不来自权威 |
| 1998 | 「Open Source」一词确立（Christine Peterson 命名）、OSI 成立 | 把自由软件的价值主张翻译成企业听得懂的语言 |
| 2008 | GitHub 上线 | 「看代码」变成一键动作：可检验性的大规模基础设施 |
| 2016 | Amodei et al.《Concrete Problems in AI Safety》 | AI 安全从口号变成可研究的具体问题——安全领域自己的「开源时刻」 |
| 2019 | Mitchell et al.《Model Cards for Model Reporting》 | 模型说明书：用途、限制、偏见必须可查 |
| 2023– | Meta 开放 Llama 权重、DeepSeek 开源模型与 Harness（一切皆插件）、antirez 的纯 C 本地推理系列（ds4 / iris.c / h3.c / voxtral） | **AI 时代的开源史第三幕**：从「代码可查」到「权重可用」再到「推理可在自己机器上跑」 |

这条谱系的共同假设只有一句：**不要问我信不信你，把你的东西公开，让我自己看。** 它不承诺任何人的善意，也不依赖任何人的善意——这是它四十年不衰的原因，也是它成为 AGI 时代对抗权力集中唯一经过验证的工程传统的理由。

## 四、把治理教给孩子：lazeword 的 AI 素养 pack

背单词是入口，治理是终点。`data/packs/ai/` 把上一节的立场翻译成孩子能用的四层：

1. **词汇层（52 词）**：alignment / bias / hallucination / interpretability / verifiability / deepfake / red teaming / dual-use / digital divide——孩子先拥有讨论 AI 的语言，才有怀疑的能力；
2. **论文层（12 篇）**：从《Attention Is All You Need》到《Stochastic Parrots》，每篇一句「为什么重要」+ 原文链接——**读原典**，而不是读转述；
3. **人物层（10 位 AI 科学家）**：Turing、Hinton、LeCun、李飛飛、何愷明、吳恩達、Amodei……善意的人走向不同结论，本身就是一课；
4. **守则层（AI 安全與向善）**：保护自己四条（隱私/辨別真假/不沉迷/查證）+ 向善途径四条（開源/署名/教別人/提問）+ 争论课（兩邊都是善意的人）；
5. **对话层（与 AI 交流，词汇的去处）**：describe / specify / clarify / verify / iterate / brainstorm——学单词的终极目的不是囤积，而是**用语言与 AI 对话与共创**。词汇量决定你能和 AI 谈多深，提问质量决定 AI 帮你能帮多好；「The hottest new programming language is English」不是玩笑，是新时代读写能力的定义。

贯穿全部四层的教学法只有一个词：**「可验证的怀疑」**——对任何结论先问四个问题：

> 谁说的？· 可以检查吗？· 两边都是善意的人怎么办？· 我能做什么？

## 五、立场总结

1. **权力集中是第一风险**，制度不依赖信任——安全的合法性来自可检验，不来自权威背书；
2. **开源与本地推理**是这条原则的工程实现：权重可查、代码可读、推理可以在自己家里跑；
3. **善意必须被审计**：开源、署名、不夸大——不是美德修辞，是可验证的行为；
4. **教育是最终的解**：教会下一代「可验证的怀疑」，比教会他们任何单一立场都重要。

lazeword 是这套立场的一个最小验证：一个离线的单文件、一条可重放的学习轨迹、一份全量署名的数据清单。它不解决 AGI 治理，但它证明：**不依赖信任的技术，是每个普通人都可以参与建造的。**

## 参考文献（2026-08）

1. Amodei, D., Olah, C., Steinhardt, J., et al. (2016). Concrete problems in AI safety. arXiv:1606.06565.
2. Mitchell, M., Wu, S., Zaldivar, A., et al. (2019). Model cards for model reporting. FAT* '19. arXiv:1810.03993.
3. Bender, E. M., Gebru, T., McMillan-Major, A., & Shmitchell, S. (2021). On the dangers of stochastic parrots: Can language models be too big? FAccT '21. DOI:10.1145/3442188.3445922.
4. Raymond, E. S. (1997). The Cathedral and the Bazaar. O'Reilly Media.
5. Stallman, R. (1985). The GNU Manifesto. GNU Project.
6. Vaswani, A., Shazeer, N., Parmar, N., et al. (2017). Attention is all you need. NeurIPS. arXiv:1706.03762.
7. Silver, D., Huang, A., Maddison, C. J., et al. (2016). Mastering the game of Go with deep neural networks and tree search. Nature, 529, 484–489.
8. LeCun, Y. (2022). A path towards autonomous machine intelligence. OpenReview.
9. Fowler, M. (2005). Event sourcing. martinfowler.com.
10. Buckheit, J. B., & Donoho, D. L. (1995). WaveLab and reproducible research. In Wavelets and Statistics, 55–81. Springer.
11. Huang, J. 关于「别在暗房里搞，然后告诉我它是安全的」的公开评论（转述，见第一节）。

---

署名：第一节为本文作者原创论述，第二节为立场说明；数据与代码的完整许可见 [ATTRIBUTIONS.md](../ATTRIBUTIONS.md)。
