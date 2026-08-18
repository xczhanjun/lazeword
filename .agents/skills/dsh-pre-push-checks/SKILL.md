---
name: dsh-pre-push-checks
description: Use before pushing a lazeword branch or claiming checks pass — select the smallest tests and checks that cover the outgoing diff without reflexively running everything; and immediately after any history-rewriting push, re-validate the published heads.
---

<!-- 来源：DeepSeek Harness 官方 .agents/skills/dsh-pre-push-checks（MIT © 2026 DeepSeek）。
     本地化适配：pnpm/vitest/gh-stack 机制替换为 lazeword 的 npm 工作流；保留「选最小证据」原则。
     原版：https://github.com/deepseek-ai/deepseek-harness/tree/master/.agents/skills/dsh-pre-push-checks -->

# lazeword 推送前检查

推送前跑一次**相关的**本地证据。没有「全量基线」——每个行为变更选最窄的、能对它回归失败的检查；diff 真正触及的表面才加更宽的检查。CI（.github/workflows/ci.yml）拥有全量矩阵：test-and-build + 可复现构建检查（`git diff --exit-code -- app/lazeword.html lib/client.js`）。

## 查看待推变更

```sh
git status --short --branch
git diff HEAD~1 --stat        # 或相对已记录的远端基线
```

## 按 diff 选证据（lazeword 工具箱）

| 改动表面 | 最窄证据 |
|---|---|
| `src/core.mjs` / `tests/` | `npm test`；聚焦：`node --test --test-name-pattern="tutorDiagnosis" tests/core.test.mjs` |
| `app/template.html` | `npm run build` + 提交产物（app/lazeword.html、lib/client.js）+ 浏览器实测（`?tab=` 深链直达改动面） |
| `data/packs/**` | `python3 scripts/check-packs.py` + `npm run build` |
| `worker/index.js` | `node --check worker/index.js` |
| `lib/index.js` / `cordis.patch.yml` | `node --check lib/index.js`（dsh 插件入口改动需宿主实测） |
| 文档 | `git diff --check`；README 双语双份同步；链接 `rg -n "docs/目标"` 核对 |
| 任何构建管线改动 | `npm run build` 后 `git diff --exit-code -- app/lazeword.html lib/client.js` |

不要在推送前机械重复已过的检查；也不要只跑 `npm test` 就声称「构建没问题」——单测不覆盖构建注入与 pack 校验。

## 完整本地排练

只有三种情况跑全套（npm test + build + check-packs + node --check 全部文件 + 浏览器冒烟）：用户明确要求、排查 CI 失败、或变更跨仓太广没有可信的更窄集。

## 保护历史改写推送

改写分支历史前，fetch 当前远端分支并记录其精确 OID；用 `--force-with-lease=<branch>:<observed-oid>` 发布，让并发更新中止推送。裸 `--force` 永远不允许。改写推送后，重新 fetch 实头、复核未决评审线索与检查状态——改写前的 commit 哈希与行内评论锚点不是当前证据。

## 处理失败

相关检查在普通推送前失败 → 停下修复或解释 blocker，不要「推上去赌 CI 不一样」。疑似环境特定 → 证明它：记录确切命令、失败测试、平台差异；确认非平台证据；优先修跨平台不确定性。绕过本地检查只有用户明确同意时才行，且报告确切失败原因与为什么 CI 预期不同。

## 推送流程

1. 跑一次选定的相关检查。
2. 正常提交（本仓按用户偏好：本地逐条提交、积累 5-10 个推送一次）。
3. 正常推送（或对授权改写分支用精确 lease）。
4. 核对远端 ref 与本地 HEAD 一致：`git rev-parse HEAD origin/$(git branch --show-current)`。
5. 检查远端 CI：`gh pr checks`（有 PR 时）；把 pending 报为 pending。
