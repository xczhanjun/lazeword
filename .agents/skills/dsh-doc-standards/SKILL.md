---
name: dsh-doc-standards
description: 'Use when writing, moving, reviewing, or auditing documentation in the lazeword repo — choosing hierarchy and detail, separating tutorials from references, trimming doc slop, or requests like "improve the docs", "audit the docs", "where should this be documented", or "this doc is too long".'
---

<!-- 来源：DeepSeek Harness 官方 .agents/skills/dsh-doc-standards（MIT © 2026 DeepSeek）。
     本地化适配：docs/AGENTS.md 与 pnpm gates 替换为 lazeword docs/ 语料约定；Agent Notes → tasks/lessons.md。
     原版：https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills/dsh-doc-standards -->

# lazeword 文档标准

文档语料与规则的家：`docs/`（概念/理论/路线图）+ 根目录 `README.md` / `README.zh.md`（双语双份，改一边必须同步另一边）+ `ATTRIBUTIONS.md`（署名=善意，机器可查）+ `tasks/lessons.md`（教训记录）。这是指导，不是脚本；用 [dsh-prose-standard](../dsh-prose-standard/SKILL.md) 管覆盖与编辑判断，永远不把长度本身当缺陷。

## 事实来源（读，不要复述）

- `docs/pack-authoring.md` — pack 创作契约（数据/模块/质量门的权威）。
- `docs/learning-as-simulation.md`、`docs/scenario-engine.md`、`docs/ai-governance.md` — 理论与立场文档，概念解释只有一个家。
- `ATTRIBUTIONS.md` — 数据/代码出处记录；引入新数据源必须在此登记。
- `docs/roadmap.md` — 路线图；功能落地后更新状态。

## 先审结构再管散文

对每份人类可读文档按顺序过一遍（不适用于 lessons.md）：

1. 定位文档在语料中的位置：它自己的主题是什么，直接子主题是什么。
2. 定允许的细节层级：主题本身写全，子主题按用途/职责/高层行为概述，深解释下放到归属文档并链接。
3. 按用途而非路径分类：教程必须带领有序工作到可观察结果（如「快速开始：`python3 scripts/new-pack.py …` → 填词 → 构建 → 测试」）；参考必须支持在显式范围内查表而不需顺序阅读。
4. 教程：确定读者起点（初/中/高级），把过早的材料重排，可选的进阶细节移到更后面的教程或参考。
5. 混合形态切分：次要形态放进明确标注的小节。

## 审计语料

1. 量纲：`git ls-files '*.md' | xargs wc -w | sort -rn | head -20` 找出未预算的超长文件——但长度≠缺陷，先看结构。
2. 找推理转录泄漏：用 [dsh-trim-cot-leakage](../dsh-trim-cot-leakage/SKILL.md) 的分类与电池。
3. 找重复：grep 独特短语，只留一个家，其余改链接。
4. 手写目录/状态清单/代码重述 → 换成权威脚本或生成的参考。
5. 中文文档用繁体还是简体？文档语料惯例是繁体（与 UI 默认一致）；README.zh.md 为简体约定——保持每份文档内部一致即可。

## 移动/重命名

- 移动前 grep 入链：`rg -n "docs/旧名|旧名.md" README.md README.zh.md docs/`。
- 移动是原子的：旧家删除、新家添加、所有入链在同一笔改动里修复。
- 双语双份：README.md 与 README.zh.md 结构对齐（小节顺序、链接、功能清单一致）。

## 验证与提交卫生

- 至少跑 `npm test` 与 `git diff --check`。
- 文档改动影响构建产物时（README 被 npm files 收录），`npm run build` 后提交产物。
- 提交信息写明：word 增量、刻意保留的长文档例外、跑过的检查。
