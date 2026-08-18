---
name: dsh-prose-standard
description: Use when writing, reviewing, restoring, trimming, or auditing prose in the lazeword repo — deciding where documentation or comments are required across Markdown, JSDoc, code and test comments, prompts, descriptions, diagnostics, and UI strings.
---

<!-- 来源：DeepSeek Harness 官方 .agents/skills/dsh-prose-standard（MIT © 2026 DeepSeek）。
     本地化适配：仓库专属引用（AGENTS.md / notes / change-scope / pnpm gates）替换为 lazeword 对应物。
     原版：https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills/dsh-prose-standard -->

# lazeword 写作标准（Prose Standard）

写够能保住契约的内容，然后删掉推理过程、重复和装饰。契约 = 调用方/被调用方/实现者/生产者/消费者所依赖的义务、不变量、前置条件、后置条件或兼容承诺。本 skill 负责编辑判断与必需覆盖；用 [dsh-doc-standards](../dsh-doc-standards/SKILL.md) 管文档层次、双语双份与审计，用 [dsh-trim-cot-leakage](../dsh-trim-cot-leakage/SKILL.md) 找推理转录泄漏。这是指导，不是脚本。

`contract`、`boundary`、`shape`、`surface`、`seam`、`gate`、`vocabulary` 这些词用前先核对，不是禁词——先问是否具体规则/API/字段集/类型/校验/时序点/组件切分/失败态说得更准。注释写代码表达不了的非显然契约或理由，不重述代码本身。

## 输入与排除

- 要求显式 `scope`（范围）。缺失时报告缺什么并停下，不要擅自推断全仓范围。
- `mode: automatic | interactive`，默认 automatic。review/audit 任务只报告不改文件；明确要求 write/fix/trim 才改。
- 排除 `node_modules/`、构建产物（`app/lazeword.html`、`lib/client.js` 由 `npm run build` 生成——改源头再重新生成，勿手改产物）。
- 双语双份（README.md / README.zh.md）改一边必须同步另一边。

## 保住完整命题

编辑前先枚举每句话里的命题，逐条保留：主体与动作；条件、时序与顺序；情态（必须/可以/绝不）；否定保证与例外；所有权、副作用、失败模式与后果。删形容词、重复与叙述，只当每个事实从句都存活且更清晰时。字数变少本身不是改进。

契约的完整局部版留在使用点（行为/失败/所有权/后果）；架构、算法、历史、长例证激进地链接到归属文档——一个解释只有一个家，关键契约事实可以局部重复。留下非显然理由，当删掉它可能被误用或误简化时。

## 各位置的必需覆盖

- **公开 JSDoc**：调用方可见的返回区分、throw/reject、副作用、所有权、时序、取消、持久性。
- **内部注释**：只写非局部结构与明显复杂的局部结构——不变量、竞态顺序、所有权、安全边界、意外失败行为。删控制流叙述与代码重述。
- **模块注释**：模块角色、依赖、职责、非显然架构选择，链接到归属解释。
- **测试**：只解释非显然的测试设计（为什么这个 fixture/断言/入口路径/间接观察是必要的）。删测试过程叙述。
- **README**：消费者契约——配置、语义、失败、限制、扩展点、模型可见效果。引用稳定的模型可见文本时逐字引用。
- **tasks/lessons.md（教训记录）**：保留唯一理由、机制、备选、后果、验证证据与具名覆盖缺口；陈述的是当下现实（现在时），删计划清单。
- **skills 与 agent 指令**：写明行为护栏与显式范围限制（"指导，不是脚本/清单"）。
- **提示词与可见字符串**：措辞即行为——改了要跑行为验证或说明为什么不适用快照。

## 工作流

1. 确认 scope、mode、当前分支与基线（`git status --short --branch`）。
2. 先读归属代码/文档（pack 内容读 [docs/pack-authoring.md](../../../docs/pack-authoring.md)，数据署名读 [ATTRIBUTIONS.md](../../../ATTRIBUTIONS.md)）再判断段落。
3. 用搜索与字数找候选，再语义判断——不要只看最大的文件。
4. 逐段分类 keep / add / trim / restore / restructure / defer；只有授权编辑时才改。
5. 改源头先于产物；学到新规则后复查同类段落。
6. 跑窄相关检查：`npm test`、`git diff --check`；可见字符串跑行为验证。
7. 报告：检查过的范围、做的修改、刻意保留、延后项、实际跑过的检查。

## 两难决策

只有当至少两个版本都满足完整命题规则、但权衡了公认原则、且本 skill 未覆盖时才叫两难。automatic 模式：授权时直接改清晰项，报告真正的两难而不提问；不要弱化命题换取进度。interactive 模式：把同类段落归到主导原则下，给出 2-3 个可行版本、推荐其一、说明事实/结构差异。
