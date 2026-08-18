---
name: dsh-find-simplifications
description: 'Use when working in the lazeword repo to find non-obvious simplification candidates, write lessons into tasks/lessons.md or inline TODO/FIXME/XXX notes, audit or coalesce superseded lessons, or fold worthwhile simplification ideas from another PR; especially for dead, duplicated, speculative, over-built, added-then-removed, or hand-rolled-where-a-dependency-exists surfaces.'
---

<!-- 来源：DeepSeek Harness 官方 .agents/skills/dsh-find-simplifications（MIT © 2026 DeepSeek）。
     本地化适配：Agent Notes 机制 → tasks/lessons.md（本项目教训记录）；dsh-archive-agent-notes → 不适用。
     原版：https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills/dsh-find-simplifications -->

# 在 lazeword 找简化机会

把宽泛的「找可简化的东西」变成有证据的教训条目或内联 TODO，删掉或折叠真实的表面积。这是指导，不是清单：跟着代码走、保持判断、宁要少数实证候选也不要一堆薄猜测。

## 先读仓库上下文

- `docs/learning-as-simulation.md`（轨迹/FSRS/确定性设计）与 `docs/scenario-engine.md`（场景引擎）——与有意设计对着干的简化需要更强证据。
- `tasks/lessons.md`——踩过的坑是有意保留的理由。最相关的已实现示例：性能缓存（ZH_MAP_CACHE 等）——「为性能有意加缓存」不构成简化目标。
- 有意保留的默认值：双语双份（README.md/README.zh.md）、繁/简映射表、轨迹 20k 上限 + compactTrajectory、游戏 demo 模式不写轨迹——除非用户明确推翻，不当作「低垂果实」提议删除。

## 强候选长什么样

一个强简化移除/折叠/降级了真实的东西，且证据表明当前设计成本大于收益：

- 公开函数、事件类型、配置项、辅助、包、测试工件没有生产消费者（`rg -n "函数名|事件类型" app/ src/ worker/` 找调用点；template.html 与构建产物是同一个生产面）。
- 测试/文档是唯一消费者，且它们钉住的行为不承重。
- 两处表示镜像同一个事实（尤其轨迹事件与物化视图字段之间）。
- 手写代码重实现了一个维护良好的外部包或 Node 内建已提供的东西，且替换会删除实现 + 专属测试（本项目哲学：单文件零依赖优先——引依赖是简化提案，需净删除为正）。
- 投机泛化：没有产品属主的功能。

薄候选通常不成立：删一个拼写错误、跑一次 knip、删掉有意记录的设计、没有调用点证据的「这看起来复杂」。

## 广泛排查

用户要广度时用并行子代理，每代理一个域、要求证据而非猜测。有用域：轨迹/FSRS 折叠与压缩；游戏引擎（race/mine/letter/memory）；quiz/私教流程；packs 数据与模块；构建管线与 worker；UI 状态与缓存。

先看最大的生产代码增量——停在明显未用符号的审计会漏掉重复的生命周期/防御机制成本最重的文件。

## 依赖 vs 手写

引入依赖是合法的简化动作，但本项目默认「单文件零依赖」，提案必须证明：

- 通读手写实现，指出包恰好覆盖的表面；包不覆盖的残余语义算作反对并留在教训里。
- 诚实评估包健康度（维护、采用、传递足迹）；引擎地板有内建时优先内建。
- 先查 lessons.md：已记录的既定设计——替换必须胜过记录的理由，不只是引用政策。
- 权衡净删除：实现 + 专属测试 + 文档，减去剩余胶水。只搬家的包装不是胜利。

## 证明或否决每个候选

- 生产语料：`src/core.mjs`、`app/template.html`、`worker/index.js`、`scripts/`、`data/packs/`。非生产：tests/、docs/、README。先用 `rg` 精确搜符号/事件名/配置键（`.name(` 与 `name(` 两种形态都搜），再读调用点。
- 否决/降级当：存在生产调用者且简化会成为功能决策；API 被 lessons.md 或既有防御模式显式论证且新证据不胜出；移除迫使无关 churn 却没减少公开 API 或必需行为；想法对但太小 → 加定向 TODO/FIXME/XXX（稳定标签如 `TODO(double-default)`，说明为什么安全、什么动作能简化）。

## 合并被取代的教训

当实现的简化使某条 lessons.md 记录过时时：把幸存理由/备选/后果/验证证据移入当前属主（代码注释或所属文档），修复所有引用后删旧条目。**教训记录本身也是散文**——用 [dsh-trim-cot-leakage](../dsh-trim-cot-leakage/SKILL.md) 保证现状表述是现在时。

## 写教训条目

每个持久提案在 `tasks/lessons.md` 追加一条：`- **模式名**：现象 → 根因 → 防复发规则`。具体到可实现：说清删/折叠/降级什么、接受标准、风险（公开行为变化、未来产品需求）。当提案与既有条目重叠时，合并进既有条目而非新建。

## 验证与提交卫生

代码/注释改动：`npm test` + `npm run build`（产物同 diff 提交）+ `git diff --check`。总结：加/合并/删了多少条教训与内联注记、排查了哪些域、刻意排除什么、跑过哪些检查。
