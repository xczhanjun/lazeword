---
name: dsh-code-review
description: Use when reviewing a pull request or diff in the lazeword repo — orients the reviewer to this codebase's standards (packs contract, trajectory/FSRS invariants, attributions, quality gates) and the review-specific checks that code alone can't show
---

<!-- 来源：DeepSeek Harness 官方 .agents/skills/dsh-code-review（MIT © 2026 DeepSeek）。
     本地化适配：change-scope/ADRs/invariant 机制等仓库专属物替换为 lazeword 对应物。
     原版：https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills/dsh-code-review -->

# 审查 lazeword 的 PR / diff

**这是指导，不是完整清单。** 先核实 diff 的真实基线（`git status --short --branch`，必要时 fetch），再读 diff 与足够多的周边代码。优先正确性、生命周期、安全、破坏的必需行为——一条有实证的 blocker 胜过一页 nits。

## 事实来源（读，不要复述）

- [docs/pack-authoring.md](../../../docs/pack-authoring.md)：pack 数据/模块契约；[ATTRIBUTIONS.md](../../../ATTRIBUTIONS.md)：署名义务（善意=署名，机器可查）。
- [docs/learning-as-simulation.md](../../../docs/learning-as-simulation.md)：轨迹/FSRS/确定性的设计依据。
- [dsh-prose-standard](../dsh-prose-standard/SKILL.md)：注释、文档、提示词、可见字符串的必需覆盖。
- `tasks/lessons.md`：踩过的坑。对教训记录持异议 = 设计讨论，不是自动否决。
- 双语改动（README/UI 繁简）两边都要审。

## 阻断性要求

1. **新散文过语义审查**：用 prose-standard 审每一段新增/修改的 Markdown、注释、提示词、描述、诊断、可见字符串。自动化检查不建立正确性。
2. **文档与代码一致**：配置、默认值、错误、字段、事件、公开行为在同一个 diff 里更新 README 与注释。注释只陈述非显然契约；flag 实现叙述、测试走查、评审历史、重复理由（删除或链接到唯一归属）。
3. **数据包符合契约**：pack 改动必须过 `python3 scripts/check-packs.py`（构建管线内），新数据源必须在 ATTRIBUTIONS.md 登记。
4. **轨迹与 FSRS 正确性**：新事件类型要么 foldable（know/wrong/remember/forget/anki，注意 e.t 必须 number、e.w 必须 number）要么明确非 foldable（quiz/game/tutor 只进热力图）；20k 上限后 compactTrajectory 保持状态等价；确定性（同输入恒同输出）不被 Math.random/Date.now 侵入纯函数。
5. **必需证据存在**：作者跑过窄相关检查（npm test / npm run build）；`npm run build` 产物（app/lazeword.html、lib/client.js）必须与源码同 diff 提交（CI 有 `git diff --exit-code` 检查）；审查 CI 覆盖不到的语义缺口。

## 手工检查

- **接口契约**：改动接口的两侧都追一遍——实现是否与 PR 及文档一致，含错误、所有权、取消、清理。
- **生命周期与并发**：async setup、callback、AbortController 超时路径——竞态、await 中的取消、独立错误上报、回调遏制、重入前的所有权、完整 detach 清理。
- **单文件约束**：template.html 改动要问：有没有破坏裸 `app/lazeword.html` 独立运行（无 dsh 宿主、无 worker）？离线降级路径是否显式（toast/dim 提示）？
- **范围、所有权、必要性**：把每个抽象、状态机、选项、防御性拷贝、兼容路径映射到当前契约与生产消费者。挑战无关功能与投机泛化（KISS/YAGNI）。
- **配置与公开选择**：每个默认值、公开操作集、格式是否有当前消费者证据或先例支持；无证据时要求显式选择或延后。
- **模型视角**：检查发给模型的提示词、工具 schema、诊断；flag 模型任务之外的概念；稳定文本逐字核对。
- **执行路径**：追每一条拒绝路径到执行它的操作；测试能绕过 schema/提示词/监听顺序的旁路调用。
- **借用与衍生状态**：每个保留值是借用还是自有（under contract）；每个缓存/回显/重放/查询视图追溯到权威源与成功点。
- **边界覆盖最终操作**：完整产出的属主（含包装与元数据）；极小与恰好的极限、超大块、多字节文本的字节限制。
- **真实入口路径**：测试/验证走真实入口——构建后的 app/lazeword.html 浏览器实测，而非仅单测。
- **测试强度**：断言要在目标回归上失败、验证外部状态（轨迹/事件/热力图）而非重述实现；覆盖是必要的，但不是场景正确的证据。
- **任务教训落地**：实现了 tasks/lessons.md 中某项教训的防复发规则时，同时更新教训记录的现状表述。

## 报告发现

陈述缺陷、位置、影响、证据。局部缺陷放在最紧的 diff 行内；跨切面的架构/范围/综述用顶层评论。Blocker 与建议分开；绿门已强制的不再提。收到审查时：逐条核实断言，以技术依据修复或反驳，不做表演性同意。
