# 贡献指南

欢迎！lazeword 抱着善意开源——**进化的账本是 git + 测试 + 署名**，不是 AI 自治。
无论你是人类作者还是 dsh agent 作者，贡献走同一条路。

## 30 秒上手

```bash
git clone https://github.com/xczhanjun/lazeword.git && cd lazeword
npm install          # 仅 devDependency（@playwright/test）；运行时零依赖
npm test             # 77 单元测试（node:test）
npm run test:e2e     # 7 条关键流（Playwright，首次需 npx playwright install chromium）
npm run build        # 生成 app/lazeword.html + lib/client.js（必须提交产物）
```

## 三种贡献方式

### 1. 加一个学科词表（pack）——最常见的贡献

按 [docs/pack-authoring.md](docs/pack-authoring.md) 契约建 `data/packs/<id>/`：

```bash
python3 scripts/new-pack.py mypack 我的學科   # 生成骨架
# 填 words.json → 在 ATTRIBUTIONS.md 登记出处（善意=署名，机器可查）
node scripts/build.mjs                        # 校验失败会报错
npm test
```

质量门（CI 强制执行）：manifest 字段 / 词条合法性 / 分类 key / **ATTRIBUTIONS.md 署名记录**。

### 2. 加一个学习场景（laze.json）

按 [docs/laze-json.md](docs/laze-json.md) 契约写场景，`validateLaze` 是机器可查的门。
场景农场见 `scripts/scenario-farm.mjs`（确定性组合器 + 校验）。

### 3. 改核心代码

- 纯函数进 `src/core.mjs`（77 个测试在这里，TDD：先写测试）
- UI 进 `app/template.html`（单文件应用；改完 `npm run build` 并提交产物——CI 有可复现检查）
- 后端进 `worker/handlers.js`（CF Worker 与 Node server 共用）

## 提交规范

- 提交信息：`<type>: <描述>`（feat/fix/docs/test/chore/refactor/perf/ci）
- 每个提交自包含（测试全绿 + 构建产物一致）
- 推送前自查清单见 `.agents/skills/dsh-pre-push-checks`（本地化适配版）

## 署名与许可

- **引用数据/代码必须在 ATTRIBUTIONS.md 登记**——这是硬性质量门，不是礼貌
- GPL 内容只对标不引用；url 无法核实就留空（不写编造链接）
- 代码 MIT；词表数据保留原始出处许可

## 文档与讨论

- 设计文档在 `docs/`（学习即仿真 / 场景引擎 / 路线图 / 观察志）
- 疑问开 issue；讨论用中文或英文均可
