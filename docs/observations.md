# 有趣观察与外部资料志

> 项目开发过程中的工程发现与外部资料存档。按时间倒序，2026-08 起。
> 观察部分记录「发现 → 根因 → 教训」；资料部分记录「核实事实 → 与项目的关系 → 处理结果」。

## 一、有趣观察（工程发现）

### 1. E2E 测试第一天抓到 2 个真 bug（2026-08-17）
- **发现**：Playwright 骨架上线当天，首轮运行即暴露：① URL 深链参数被 boot 过程的
  syncUrl（restoreUI 触发）用 replaceState 覆写——清空存储后 `?tab=quiz` 被改写为 learn；
  ② 场景运行先 startQuiz 再 switchTab，被 switchTab 里的 resetQuizSetup 重置隐藏。
- **根因**：① 参数读取时机晚于状态写入；② 动作顺序与副作用耦合。
- **教训**：关键流回归钉的价值在第一天兑现——「功能速度跑在验证速度前面」的债，
  用 4 条 E2E 全部止损（现为 7 条）。

### 2. 数学判分索引 bug 潜伏数月（2026-08-17）
- **发现**：考试引擎数学题 `chosen.i === q.answer` 比的是「选项索引 vs 答案值」——
  数学选择题永远判错；因客户端词典直连兜底，无人察觉。
- **教训**：类型/语义不一致（值 vs 索引）是最贵的 bug 类别；修复后立即补 E2E 回归钉。

### 3. dict 端点 synonyms 未声明 → 500 被兜底掩盖（2026-08-16）
- **发现**：worker /api/dict 引用未声明的 `synonyms` → ReferenceError → 500；
  客户端自动降级直连 dictionaryapi.dev，静默掩盖了服务端 bug。
- **教训**：**降级设计会掩盖上游缺陷**——降级路径本身需要偶发的「对照组」测试
  （服务端健康探针）；三层降级 ≠ 每层都有人盯着。

### 4. 「好的抽象不是加一层，是把三层合成一个文件」（memvid 印证，2026-08-17）
- **观察**：memvid（16.2k ⭐）把向量库+全文检索+元数据库压进一个 .mv2 文件；
  与 lazeword「轨迹+状态+词库合成一个 HTML」是同一个抽象。
- **结论**：单文件不是玩具选择，是被独立验证的架构方向；但 memvid 的用武之地是
  Agent 记忆规模，不是单词学习规模（20k 事件 + FSRS fold 就是我们的索引）——
  **压力不真实就不引**（KISS）。

### 5. 研究循环 = 学习循环（autoresearch 同构，2026-08-17）
- **观察**：autoresearch 五步（可度量目标→实验→评估→保留/回退→append-only 账本）
  与 lazeword 的（FSRS 保留率→练习→判定→know/wrong→轨迹）逐项同构。
- **结论**：孩子每天在用的程序本身就是一台 autoresearch 机器——「学习即仿真」的
  最直接具身证明；已做成参考页对照表。

### 6. 零开销原则与「注意力是最小的盒子」（Daisy Hollman，2026-08-17）
- **观察**：Anthropic 的上下文工程原则（用不到的东西不该占地方、反馈闭环收紧
  比换模型有效、人的注意力是系统最小盒子）与我们已有的设计逐条对应：
  单文件零依赖、三级降级、即时写回轨迹、躺平模式。
- **结论**：独立团队在独立问题上收敛到同一组原则——这是对架构选择最有力的外部验证。

### 7. 原始工具 + 紧闭环，两条线都被验证（2026-08-17）
- **观察**：Daisy 说 Claude Code 的编辑工具「相当于把 ed 当唯一编辑手段」，模型在
  原始工具上表现惊人；孩子同样用最原始的工具（词卡/游戏/轨迹）学最现代的技能
  （指挥 AI）。
- **结论**：不要过早给工具加复杂度——工具原始、反馈紧，反而是可复现的组合。

### 8. 跨包去重暴露数据模型缺口 → cs 多场景引用（2026-08-17）
- **发现**：hobby pack 的 wing 等词因跨包去重被丢弃，航模场景只剩 15/24 词。
- **解法**：词条增加 `cs` 引用字段——重复词并入多场景引用而非复制；
  check-packs 预扫描全场景 key 校验引用合法性。家务/CS pack 同样受益。

### 9. 基础模式门控把家务词藏起来了（2026-08-17）
- **发现**：家务 tab 在基础模式（默认）下词表为空——E2E 抓出：chores 词 b=0 被
  activeWords 过滤。
- **教训**：**日常功能不应受「高级内容」门控**——家务是行动词不是进阶词；
  choreWords 改为直接读全库。

### 10. 移动端是二等公民的代价（连续 4 个窄屏 bug，2026-08-17）
- tab 文字拥挤（≤400px 图标化）→ ref 子导航 8+ 不换行（flex-wrap）→ 私教练习
  内联 2 列不响应（改用 .quiz-choices）→ 家务门控。全部由 320/375px 回归修复。
- **教训**：内联样式逃逸响应式体系是最常见的移动端 bug 源；新增 UI 必须过窄屏回归。

## 二、外部资料志（2026-08，均已核实）

| 资料 | 事实（核实） | 与项目的关系 | 处理结果 |
|---|---|---|---|
| deepseek-harness 官方 `.agents/skills`（11 个） | MIT（© 2026 DeepSeek） | 仓库专属引用需本地化 | 6 个适配版安装于 `.agents/skills/` + symlink `.claude/skills/`；5 个不适用已说明 |
| memvid | 16,245 ⭐ / Rust / Apache-2.0 / `@memvid/sdk` | 单文件哲学的行业印证；dsh AI 老师记忆库候选 | 生态推荐「工具」类目 + learning-as-simulation 参考文献 #16 |
| 人人都能用英语 / Enjoy（ZuodaoTech） | 36,562 ⭐ / GPL-3.0 / TS；书+1000h 训练+Enjoy 应用 | 对标：用 AI 学英语 vs 通过背单词学 AI 编程创造 | docs/benchmark-enjoy.md + roadmap 想法池（输出型训练/字幕导入） |
| awesome-autoresearch（webfuse-com） | 2,458 ⭐ / **CC0-1.0** | autoresearch 循环与学习循环同构 | cs pack「自主研究」参考页 + ATTRIBUTIONS 署名 |
| Karpathy《AI Engineering》（Stanford 讲座） | 公开讲座 | 10%→100% 阶梯映射表（我们已在 70% Loop 向 100% Graph 走） | ai pack「工程實踐」组 + laze-json.md storyboard v0.2 图化设计 |
| Ng《The AI Engineering Skills Map》 | DeepLearning.AI 文章（2025） | AI 工程能力地图 | ai pack「工程實踐」组（url 待核留空，诚实标注） |
| Daisy Hollman《Agentic Software Engineering at Scale》（老李墨问笔记） | NDC Conferences 2026-08 演讲 | 零开销原则/注意力最小盒子/紧反馈闭环——与躺平+FSRS 同构 | ai pack「工程實踐」组第 3 条 + cs 参考页零开销卡片 |
| zip0.com（视频聚合站）/ zip0.com/tv | 第三方聚合站 | 版权与接口双风险——不绑定；启发「字幕导入」方案（SRT/VTT 粘贴→生词提取→场景） | roadmap 想法池 |
| 知乎仿真文章 + 自动驾驶/机器人行业调研 | 已核实归档 | 场景驱动+数据驱动引擎的行业依据 | docs/research-physics-simulation.md |

## 三、资料处理的惯例（给自己定下的规矩）

1. **先核实再入库**：stars/license/内容结构用 GitHub API + README 原文核实（可验证的怀疑）；
2. **url 待核就留空**：不写编造的链接（Ng/Karpathy/Daisy 三条按此惯例）；
3. **署名跟着数据走**：引用词表/概念/清单一律进 ATTRIBUTIONS.md（善意=署名，机器可查）；
4. **GPL 内容只对标不引用**：Enjoy 的对标声明已写入 benchmark 文档。
