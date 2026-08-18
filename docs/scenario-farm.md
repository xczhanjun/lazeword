# 场景农场：自动生产与个性化选择（RL 调研结论）

> 解决冷启动：新用户没有轨迹 → 没有诊断 → 没有个性化场景。
> 答案分两层：**生产**（确定性组合器，不需要 RL）与**选择**（contextual bandit，RL 的轻量形态）。
> 姊妹篇：[laze-json.md](./laze-json.md)（场景标准）、[scenario-engine.md](./scenario-engine.md)（引擎理论）。

## 一、RL 库调研（JS/TS 生态，2026-08 设计评估）

| 库 | 状态 | 结论 |
|---|---|---|
| TensorFlow.js / tfjs-node | 活跃，唯一有真训练能力 | 可用但重型（MB 级依赖，违背单文件）；模型权重不透明，违背「可验证的怀疑」 |
| brain.js | 活跃 | 前馈网络，无 RL |
| ml5.js | 活跃 | 基于 tfjs 的创意编程，无 RL |
| REINFORCE.js（Karpathy） | 年久失修 | 概念参考，不可依赖 |
| stable-baselines3 / RLlib（Python） | 成熟 | JS 生态没有对应物——但当前问题用不到 |

**结论**：JS/TS 的 RL 生态很薄，但**场景选择问题不需要深度学习**。给一个孩子选「下一个场景」
（题型/难度/词集）是 contextual bandit 问题：LinUCB / Thompson sampling 是纯线性代数，
~50 行纯 JS，确定性、可测试、零依赖、每步决策可解释——这比引入黑箱模型更符合项目立场。
**升级条件**（YAGNI 护栏）：当样本量（每个孩子的场景完成数）真实到达千级、且 bandit 表现
出现可测量的天花板时，再评估 tfjs 或 Python 侧服务。

## 二、架构：生产与选择分离（对标自动驾驶）

```
生产（coverage-driven 参数化生成）      选择（个性化）
词库 15k × 题型 6 × 难度 3 × 骨架      轨迹特征 → bandit → 下一个场景参数
→ scripts/scenario-farm.mjs            → LinUCB（L1）
→ data/scenarios/（laze.json 语料）     → /api/scenario-next 或客户端内嵌
```

- **生产是确定性组合器**：笛卡尔积生成 + `validateLaze` 质量门——场景驱动测试的
  coverage-driven 参数化生成，直接解决冷启动（新用户先得到 starter 场景集）。
- **选择是 bandit**：特征（回炉词比例、正确率、场景完成度）→ 线性模型挑题型/难度；
  收益信号 = 次日留存（FSRS 的 remember/forget 就是现成的回报）。
- **生产与选择互相独立**：组合器永不消耗 RL 预算；bandit 永不生成场景，只排序。

## 三、与 dsh AI 兼容（人机共写场景库）

场景是数据（laze.json），两条生产线写同一个语料目录：
1. **确定性农场**（本仓库脚本）：词库组合，validateLaze 校验后入库；
2. **dsh AI 老师**：按 [laze-json.md](./laze-json.md) 契约生成场景（DSE prompt 已是雏形），
   同样过 validateLaze + 人工合并——进化的账本是 git + 测试，AI 产出走同一道门。

## 四、落地

- **L0（本提交）**：`scenarioCompose` 纯函数（组合器）+ `scripts/scenario-farm.mjs`
  （从基础词表批量生成 starter 场景集）+ 测试
- **L1**：LinUCB 选择器（core 纯函数 + 测试）+ 场景导出/导入/URL 分享 UI
- **L2**：/api/scenario-next（服务端排序）+ 场景完成度回报写轨迹
