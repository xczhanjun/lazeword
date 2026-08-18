# 署名与许可（Attributions & Licensing）

本项目抱着善意开源：**代码**与**数据**采用不同的许可约定。任何引用、改编、再分发请遵守下表。

## 代码

| 组件 | 出处 | 许可 |
|---|---|---|
| lazeword 全部源码（`src/`、`app/`、`scripts/`、`worker/`、`lib/`、`tests/`） | 本仓库作者原创 | [MIT](./LICENSE) |
| FSRS-5 算法（`src/core.mjs` 的「FSRS-5 记忆模拟器」区块） | 算法规范：[fsrs4anki wiki《The Algorithm》](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)（文档 CC BY-SA 4.0）；公式逐式对照参考实现 [ts-fsrs v5.4](https://github.com/open-spaced-repetition/ts-fsrs)（MIT）移植，代码内署名 | MIT（ts-fsrs） |
| FSRS 测试 golden 向量（`tests/core.test.mjs`） | 由 ts-fsrs@5.4.1 生成（`generatorParameters({w: FSRS_W, version:"FSRS-5", enable_short_term:false, enable_fuzz:false, request_retention:0.9, maximum_interval:36500})`），测试文件内注明生成来源 | MIT（ts-fsrs） |
| `.agents/skills/` 6 个 skill（dsh-prose-standard / dsh-trim-cot-leakage / dsh-doc-standards / dsh-code-review / dsh-pre-push-checks / dsh-find-simplifications） | 源自 [deepseek-harness 官方 .agents/skills](https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills)，已本地化适配（仓库专属引用替换为 lazeword 对应物），每个 SKILL.md 头部注明来源与改动 | MIT（© 2026 DeepSeek） |
| `data/tokenizer/vocab.bpe`（GPT-2 词表，构建时 gzip+base64 内联） | [openai/gpt-2 官方仓库](https://github.com/openai/gpt-2) 的 vocab.bpe（镜像：openaipublic blob 存储） | MIT（OpenAI）；BPE 运行时代码（`bpeMerge`/`piecesToDisplay`）为本项目原创实现 |

## 词库数据（`data/`）

数据文件的许可与代码**不同**：各词表保留原始出处的版权与用途限制。教育用途 + 署名转载；商用或大规模再分发前请自行核对原始条款。

| 数据文件 | 来源 | 版权与用途 |
|---|---|---|
| `data/vocabineer_947_words.json`（947 词） | Vocabineer 网站《947 Most Common English Words》整理（经知乎问题 [284736104](https://www.zhihu.com/question/284736104) 传播） | Vocabineer 原文版权；此处为学习目的整理，保留原出处 |
| `data/hk_subject_words.json`（香港数学/科学词条） | 香港教育局数学教育/科学教育课程词汇整理 | 香港政府版权（education use + attribution） |
| `data/hk_campus.json`（校园课堂用语） | 香港学校课堂常用语整理 | 本项目整理（原创编选） |
| `data/oxford5000.json` / `data/oxford_exam.json` | Oxford 5000 词表（Oxford University Press 公开学习资源）；中文释义由 DeepSeek 批量翻译生成（`scripts/build-oxford.py`） | OUP 版权；教育用途标注来源，AI 翻译部分为本项目生成 |
| `data/packs/math/words.json` | 香港教育局《數學科常用英漢辭匯（二零二零年七月八日版）》[Glossary20200708.pdf](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/ma/res/Glossary20200708.pdf)（[页面](https://www.edb.gov.hk/tc/curriculum-development/kla/ma/res/glossary-notes.html)） | 香港政府版权（教育用途 + 署名） |
| `data/packs/science/words.json` | 香港教育局：科學科 S.1-S.3 [SciGlossary_2017.pdf](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/SciGlossary_2017.pdf)、生物 [Biology_Glossary_2020.pdf](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/Biology_Glossary_2020.pdf)、物理 [PhyGlossary_2020.pdf](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/PhyGlossary_2020.pdf)、化學 [glossary_chem2007.pdf](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/glossary_chem2007.pdf)（[页面](https://www.edb.gov.hk/tc/curriculum-development/kla/science-edu/ref-and-resources/glossary.html)） | 香港政府版权（教育用途 + 署名） |
| `data/packs/geography/words.json` | 香港教育局《中學地理科常用英漢辭彙（二零二五）》[Geography_Glossary_Final_Version_July_2025.pdf](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/pshe/references-and-resources/geography/glossaries/Geography_Glossary_Final_Version_July_2025.pdf)（[页面](https://www.edb.gov.hk/tc/curriculum-development/kla/pshe/references-and-resources/glossaries.html)） | 香港政府版权（教育用途 + 署名） |
| `data/packs/math/formulas.json`、`data/packs/math/modules/*.mjs`（公式表与算术/公式生成器） | 香港中学数学课程标准公式的独立整理与原创实现 | 本项目原创（MIT） |
| `data/raw/`（各官方 PDF 原始件） | 见上 | 仅构建用 vendor 副本，不随应用分发 |
| `data/packs/autodrive/words.json`（自动驾驶术语） | 本项目原创编选（取材自公开行业术语体系，与 docs/research-physics-simulation.md 调研一致） | 本项目原创（MIT） |
| `data/packs/culture/words.json`（三字经/千字文/唐诗/论语/老子经典词句与传统文化概念） | 公版经典文本（公有领域）；选编基于作者清华文科实验班 + 近七年国学工作经历，英文释义为本项目原创 | 本项目原创（MIT） |
| `data/packs/ai/`（AI 素養：52 词 + 10 位 AI 人物 + 12 篇论文卡片 + 安全守则） | 词汇为通用技术术语；人物简介与短引文（≤1 句）取自公开文档/访谈（注明出处）；论文元数据（标题/作者/年份/会议/链接）为公开学术记录；守则为本项目原创编选 | 引文属原作者（合理引用/教育用途），编选为 MIT |
| `data/packs/industry/`（工業製造：60 词） | 通用工业/汽车/机械术语的原创编选（选编基于作者在潍柴动力重卡/柴油机行业七年的工作经验） | 本项目原创（MIT） |
| `data/packs/people/`（人與詞：56 词 + 11 位开源人物卡片） | 词汇为通用技术术语；人物简介与短引文（≤1 句）取自公开的 README/文档/采访（每张卡片注明出处与 repo 链接），选编为本项目原创 | 引文属原作者（合理引用/教育用途），选编为 MIT |
| `data/packs/hobby/`（航模/船模/業餘無線電：67 词） | 通用模型飞行/航海/无线电爱好的术语原创编选（航模 24 + 船模 21 + 无线电 22） | 本项目原创（MIT） |
| `data/packs/chores/`（家務：32 词） | 通用家务动作/责任概念的术语原创编选 | 本项目原创（MIT） |
| `data/packs/cs/`（計算機與軟件工程：68 词 + 自主研究参考页） | 通用计算机/AI/软件工程与研究方法的术语原创编选；参考页方法论取材于 karpathy/autoresearch 谱系（概念为通用知识），资源入口链接 [webfuse-com/awesome-autoresearch](https://github.com/webfuse-com/awesome-autoresearch)（CC0-1.0） | 本项目原创（MIT）；CC0 资源仅作链接指引 |
| `data/packs/maker/`（3D 建模/PCB 製造/生物醫藥：80 词） | 通用建模/电子制造/生物医药术语的原创编选 | 本项目原创（MIT） |
| `data/packs/space/`（太空：32 词） | 通用航天/天文术语的原创编选（含小说《躺着背单词》用词清单中标注待入库的 orbit/rover/habitat/starlight） | 本项目原创（MIT） |
| 太空 tab 的开源软件清单（NASA cFS / F´ / Open MCT / GMAT / Orekit / Poliastro / SatNOGS / OpenSpace / Stellarium / Celestia） | 项目名/许可证/仓库链接为公开事实数据（2026-08 整理），各项目许可证见其仓库 | 事实性数据；链接仅作指引 |
| ISS 实时位置 | [open-notify.org](http://open-notify.org/) 免费公开接口（无需密钥）；离线时界面诚实降级 | 数据属 open-notify 及其来源（NASA） |
| 生态推荐「工具」类目的 DashPlayer 条目 | [solidSpoon/DashPlayer](https://github.com/solidSpoon/DashPlayer)（4,286 ⭐，AGPL-3.0）——名称/许可/功能为公开事实数据（2026-08 核实）；交互设计仅作对标（AGPL 只对标不引用，见 docs/benchmark-enjoy.md） | 事实性数据；链接仅作指引 |
| `data/packs/prompts/`（Prompt 測試：40 词 + 10 个 UI/前端生成 prompt） | 词汇为通用前端/UI 技术术语；10 个 prompt 为本项目自拟的任务规格（通用应用描述，非某基准集复制），风格对标公开 benchmark | 本项目原创（MIT） |
| DSE 大纲目录（`app/template.html` 的 DSE_OUTLINE 常量） | 香港课程发展议会《数学教育学习领域课程指引》与 HKEAA《数学科课程及评估指引》公开目录结构的事实性重新表述（目录为事实数据，非原文复制） | 香港政府版权（教育用途 + 署名） |
| `data/packs/ai/papers.json`「工程實踐」组（The AI Engineering Skills Map） | Andrew Ng, DeepLearning.AI（2025）——标题/作者/年份为公开书目数据，一句话评述为本项目原创；官方链接待核（url 留空，读者自行检索） | 书目数据（教育用途），评述为 MIT |

## 学术引用（README 与概念文档）

概念文档 [docs/learning-as-simulation.md](./docs/learning-as-simulation.md) 的理论引用均经逐条核实（2026-08），包括：
Rao & Ballard 1999（Nat. Neurosci. 2(1):79–87）、Friston 2010（Nat. Rev. Neurosci. 11(2):127–138）、Clark 2013（BBS 36(3):181–204）、Nation 2006（Can. Mod. Lang. Rev. 63(1):59–82）、Brysbaert et al. 2016（Front. Psychol. 7:1116）、Zipf 1949、Ebbinghaus 1885、Ye et al. 2022（KDD '22, pp. 4381–4390）、Ha & Schmidhuber 2018（arXiv:1803.10122 / NeurIPS 2018 pp. 2455–2467）、LeCun 2022（OpenReview）、Krashen 1982/1985、Fowler 2005、Buckheit & Donoho 1995。完整格式与 DOI 见概念文档文末。

## 特别说明

- **AI 生成内容**：Oxford 词表中文释义、AI 故事/讲解功能输出、`data/raw/` 之外的一切 DeepSeek 生成物均标注生成方式，不冒充人工来源。
- **香港教育局资料**：本仓库对 EDB 资料的整理是独立第三方整理，**未经教育局背书**；仅用于家庭/学校教育用途。
- 如发现署名遗漏或错误，请提 issue，我们会立即更正。
