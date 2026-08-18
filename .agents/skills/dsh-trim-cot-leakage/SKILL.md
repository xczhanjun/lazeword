---
name: dsh-trim-cot-leakage
description: Use when auditing or fixing prose that reads like a leaked reasoning transcript — dead design-session citations such as (decision N) or §N of uncommitted drafts; change narration such as "used to", "no longer", "this cut"; review vantage ("rejected in review"); reviewer-addressed justifications; control-flow narration; or hedged planning residue in comments, JSDoc, docs, or tasks/lessons.md.
---

<!-- 来源：DeepSeek Harness 官方 .agents/skills/dsh-trim-cot-leakage（MIT © 2026 DeepSeek）。
     本地化适配：notes/ 引用替换为 tasks/lessons.md；dsh-translate-docs 引用替换为 gen-i18n.py 说明。
     原版：https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills/dsh-trim-cot-leakage -->

# 清理推理转录泄漏（CoT Leakage）

推理转录泄漏 = 视角停在「写作会话」而不是「仓库」的散文：引用只有那次会话能看到的工件、叙述变更而非状态、与已离开的评审者争论。修复从来不是只删——段落带有事实从句时，把每条从句改写为站在 HEAD 也能成立的状态陈述，再删周围的转录；什么都不带（审计编号、控制流叙述）的整段删掉。**必要背景**：完整命题规则由 [dsh-prose-standard](../dsh-prose-standard/SKILL.md) 拥有。这是指导，不是脚本。

## 唯一测试

对每段可疑文字问：**一个站在 HEAD 的读者，接触不到任何会话转录、PR 讨论或未提交草稿，能否解析每个引用、验证每个断言？** 不能 → 从仓库视角重述幸存事实并删其余。能 → 不是泄漏——但可解析只过本 skill 的关：在当前状态表面（README/docs/JSDoc）上的可解析变更故事仍是变更叙述，改写为现在时状态。

## 分类

1. **死设计会话引用** — `(decision 7)`、`(audit C2)`、`design §4.7`、阶段标签。有已提交归属的改引名字与路径；否则删引用、重述事实从句使其独立成立。
2. **栈与 PR 视角** — "本 PR 新增"、"上一个 commit"。陈述已发布的机制或扩展点；延后工作移入 `TODO` 或 issue 引用。
3. **变更叙述与版本戳** — "used to"、"no longer"、"旧的 X"、"v1"、"this cut"。陈述当下行为；已修复的回归写成现在时反事实（"没有 X 时 Y 会发生"），从不写仓库历史（"曾经 Y"）。
4. **评审编排** — "Rejected in review:"、草稿序号（"note 的 v5"）、回合归属。保留幸存的决策与理由为平实事实；删掉谁说、何时说。
5. **面向评审者的自辩** — "这是安全的，因为…"。注释在为自己的正确性辩护——面向的是评审者而非维护者。陈述使代码安全的不变量，或代码已自明时删注释。
6. **重述与推导转录** — 控制流叙述（"先 X 再 Y"）、测试走查、显然分支的证明。删；只留非显然契约或不变量。
7. **hedge 与规划残留** — "可能够用"、"以后再说"、无标记的延后。升级为 `TODO`/`FIXME` 或重述为实际边界；删 hedge。
8. **写作语言串味** — 英文散文里的未翻译中文片段（或反之）。翻译或删。

## 什么不是泄漏（保留规则）

- **Issue 引用** — `#1470`、`TODO(name):` 在 HEAD 可解析，任何表面都保留。
- **合并 PR/issue 引用在 tasks/lessons.md 内** — 被认可的变更史证据。
- **抑制理由** — lint-disable 原因、空 catch 解释是必需散文；修错误理由，从不删除。
- **反事实现在时回归钉** — "没有 X 时 Y 会发生"。
- **实测边界** — "（实测：2 万事件 < 2s）" 校准常量时，provenance 词 "实测" 承重。
- **运行时旧/新状态** — "旧连接排空后新连接才接受" 是运行时生命周期，不是变更史。
- **外部可解析引用** — RFC §10.1.5 等外部标准条款；§ 禁令只针对未提交的内部草稿。
- **项目声音** — "我们" 作为项目声音。

## 工作流

1. Scope 与排除同 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)：排除 node_modules/ 与构建产物；tasks/lessons.md 的「为什么」段落保留原始教训声音（教训记录允许有会话语境，但现状表述要现在时）。
2. 先只读审计：用 grep 电池（`rg -n --hidden "used to|no longer|this PR|决策 [0-9]|\(decision|（决策|previous commit|v[0-9]+ of"`），再语义判断每一条命中。电池是探针不是定义——再不带模式地通读范围里最密的散文（模块注释、README、lessons.md）。
3. 属主优先：构建产物 → 改源头再 `npm run build`；双语双份 → 同步另一边。
4. 删任何东西前，先枚举命题（prose-standard）并检查过度修正陷阱：把义务翻转成背书、把假设提升为已发布功能、删真事实、丢 provenance。
5. 验证：重跑电池只剩被认可的保留；确认每个剩余引用在 HEAD 可解析；跑 `npm test`（有测试改动时）。
