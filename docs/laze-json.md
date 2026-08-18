# laze.json：学习场景声明标准（v0.1）

> lazeword 的场景层格式——对标自动驾驶 Open 系列（OpenSCENARIO 声明场景、仿真器确定性执行、
> 日志回放），并借鉴 dsh 的 Cordis 底层设计（声明式依赖注入、可逆副作用、补丁式配置）。
> 姊妹篇：[scenario-engine.md](./scenario-engine.md)（引擎理论）、[pack-authoring.md](./pack-authoring.md)（数据 pack 契约）、
> [roadmap.md](./roadmap.md)。

## 一、三层架构：读场景、执行、写日志

```
OpenSCENARIO（场景声明）   →  仿真器（确定性执行）  →  日志（rosbag 回放）
laze.json（场景声明，可分享） →  引擎（seed 确定性）   →  轨迹（append-only 事件流）
```

- **laze.json = 只读数据**：UI 读它渲染，agent 读它理解，用户之间拷贝分享；
  它描述「一次学习场景」，不存储进度。
- **执行 = 确定性引擎**：同 seed 同输入恒同输出；runner 按 `behavior.type` 注册。
- **轨迹 = 只追加不修改**：执行结果写事件日志（状态 = fold(事件)），**永不写回场景文件**——
  这正是与「所有功能读改单一文档」设计的本质区别：可重放、可压缩、可导入 Anki 历史。

## 二、Cordis 设计映射（借鉴哲学，不照搬实现）

| Cordis 概念 | laze.json 对应 |
|---|---|
| `inject: [services]` 声明式依赖 | `entities` + `requires`：场景声明依赖，加载时解析，缺失即校验错误 |
| `ctx.effect` 可逆副作用 | storyboard 步骤 onEnter/onExit：音频/计时器/写入在场景中断时逆序清理 |
| 声明式装配 | laze.json 无命令式代码，引擎解释；场景可分享、可审计、agent 可生成 |
| `cordis.patch.yml` 补丁式配置 | `conditions`（seed/retention/difficulty）：同一引擎 + 不同补丁 = 个性化场景 |
| Provider/Consumer 三件套 | schema 校验器 + runner 注册表（`SCENARIO_RUNNERS[behavior.type]`）+ UI 渲染器 |

**分工不混层**：`cordis.patch.yml` 是 dsh 层装配（lazeword 作为插件的声明）；
`laze.json` 是场景层装配（学习场景的声明）。两层同构、各自独立。

## 三、schema v0.1

```json
{
  "laze": "0.1",
  "scenario": {
    "id": "dse-math-quadratic-10",          // kebab-case，全库唯一
    "title": "一元二次方程 10 題",
    "subject": "math",                       // en | math | mixed
    "entities": { "words": ["quadratic", "discriminant"], "packs": ["dse-math"] },
    "behavior": { "type": "word-quiz", "mode": "en2zh", "difficulty": 2, "count": 10 },
    "conditions": { "seed": 42, "retention": 0.9, "timeLimit": 600 },
    "trace": { "write": true }               // 是否写回轨迹（demo=false）
  },
  "storyboard": [
    { "step": "lecture", "word": "quadratic", "source": "dictionary" },
    { "step": "practice", "count": 10 }
  ]
}
```

字段规则：

| 字段 | 必需 | 规则 |
|---|---|---|
| laze | ✅ | 版本号；引擎按版本分发（向前兼容） |
| scenario.id / title | ✅ | kebab-case / ≤80 字符 |
| entities.words / packs | — | 引用词表或 pack id；加载时解析，缺失 → 校验错误 |
| behavior.type | ✅ | 必须是已注册 runner 的类型（word-quiz / arith / …） |
| conditions.seed | — | 整数 [0, 2^31)；缺省由引擎按「用户+日期」确定性派生 |
| storyboard | — | 步骤数组；每步声明式描述，onExit 逆序清理副作用 |
| trace.write | — | 默认 true；demo/预览为 false（轨迹纯净） |

## 四、引擎与校验（machine-checkable）

- `validateLaze(laze)` → `{ ok, errors[] }`：schema 校验纯函数（core.mjs，可单测）。
- `lazeWordQuiz(scenario, words, seed)` → 题目数组：第一个内置 runner（word-quiz），
  确定性出题（en2zh/zh2en 交替 + seeded 干扰项）。
- runner 注册表：`SCENARIO_RUNNERS[behavior.type] = (scenario, ctx) => { ... }`，
  与 PACK_REF_RENDER 同模式——pack 模块可注册新题型（如数学 arith runner）。

## 五、storyboard v0.2：从线性列表到图（Karpathy：「Delete everything, keep Graph」）

Karpathy 的 AI 工程阶梯——10% LLM → 30% Prompt → 50% Agent → 70% Loop → 100% Graph——
恰好描述 lazeword 的演进：

| 阶梯 | lazeword 对应 | 状态 |
|---|---|---|
| 10% LLM | 模型是商品：三级降级（worker → 用户 key → 离线），随时可换 | ✅ |
| 30% Prompt | dsePrompt / 私教提示词 / prompt 测试 pack | ✅ |
| 50% Agent | dsh AI 老师（有进度记忆 + 工具） | ✅ |
| 70% Loop | 判定 → 写回轨迹 → FSRS 调度 → 再学习（反馈闭环） | ✅ |
| 100% Graph | **场景图**：storyboard 从线性列表升级为「节点 + 条件边」 | 🔶 v0.2 设计 |

v0.2 storyboard 图化（借鉴 LangGraph 的状态图思想，不引入其运行时——执行器是纯 JS 确定性遍历）：

```json
"storyboard": {
  "nodes": [
    { "id": "n1", "step": "lecture", "word": "quadratic" },
    { "id": "n2", "step": "practice", "count": 5 },
    { "id": "n3", "step": "review", "count": 3 }
  ],
  "edges": [
    { "from": "n1", "to": "n2" },
    { "from": "n2", "to": "n2", "when": { "score": { "lt": 3 } } },   // 答得差 → 回炉同节点
    { "from": "n2", "to": "n3", "when": { "score": { "gte": 3 } } }    // 答得好 → 进阶
  ]
}
```

借鉴 LangGraph 的四件事（其余不照搬）：
1. **状态图执行**：节点=步骤、边=条件转移（分数/时间/轨迹特征）
2. **检查点**：轨迹事件流就是 checkpoint——任何时刻可从日志重建图位置
3. **人在回路**：家长监督 / 离线自判 = interrupt 语义
4. **可观察性**：走过的路径（图遍历记录）进轨迹，可审计

执行器：`runStoryboard(graph, state, seed)` 纯函数——同图同状态同 seed 恒同路径（确定性遍历）。
这与 LangGraph 的根本区别：**图是我们的数据契约（可分享、可校验），不是服务端运行时**——
单文件离线、agent 可读可写、validateLaze 机器可查。

## 六、资产层（render/assets）：公式库与画图库

storyboard 步骤可声明渲染资产（v0.1 预留字段，L3 启用）：

```json
{ "step": "lecture", "word": "quadratic", "render": "katex", "formula": "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" }
{ "step": "diagram", "type": "mermaid", "src": "graph TD; A[詞]-->B[場景];" }
```

- **KaTeX**（MIT）：数学公式渲染的事实标准，速度快于 MathJax；需 ~30 个字体文件，
  构建期 vendor **按需子集**（只打包用到的符号），保持单文件离线。
- **mermaid**（MIT）：文本 → 流程图/时序图——场景 storyboard 与 AI 生成页面的图表示意。
- **原则**：资产构建期注入、运行期零网络；vendor 时按 ATTRIBUTIONS.md 登记许可。
  MVP 阶段（当前）公式用 formulas.mjs 的确定性渲染覆盖常见题型，不提前 vendor——
  体积预算是单文件架构的硬约束，资产层在真实需求出现时按子集引入。

## 七、落地路线（渐进）

- **L0（已完成）**：schema v0.1 + `validateLaze` + `lazeWordQuiz` + `dsePrompt` + `scenarioCompose` + 测试 + 本文档
- **L1**：场景导出/导入/URL 分享（UI 层）；「交给 AI 老师」升级为直接分享 laze.json
- **L2（已完成）**：DSE 专题与 prompt 测试作为首批场景生产者/消费者——prompt 生成器产 laze.json，运行器执行
- **L3**：游戏/私教场景化（现有引擎函数包装为 runner，不重写）+ 资产层（KaTeX/mermaid 子集）
- **L4（进行中）**：场景农场——确定性组合器自动产场景（starter.json 48 份已入库）+ bandit 选择（见 scenario-farm.md）
- **L5**：storyboard v0.2 图化（节点+条件边+确定性遍历执行器）

## 六、与 Anki 的关系

正交。Anki 导出/导入是**轨迹层**适配器（事件流互转），laze.json 是**场景层**标准。
「超越 Anki」的战场在场景层：一个 laze.json = 一节课/一个游戏剧本，可分享给任何实例——Anki 没有这个维度。
