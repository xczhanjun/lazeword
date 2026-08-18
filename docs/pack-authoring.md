# Pack 创作接口（Pack Authoring SDK）

> 阶段二·扩展进化：lazeword 的「一切皆插件」。任何学科、任何内容都可以打包成一个 pack，
> 构建时静态组合进单文件。本契约面向人类作者与 dsh agent 作者——按此规范产出数据，
> `npm test` 与构建校验会自动把关。

## 1. 目录结构

```
data/packs/<pack-id>/
├── manifest.json      # 必需：pack 声明
├── words.json         # 必需（或 manifest.files 指定其他文件名）：词条数组
├── formulas.json      # 可选：公式表（math pack 示范）
├── papers.json        # 可选：论文卡片（ai pack 示范）
├── people.json        # 可选：人物卡片（people/ai pack 示范）
└── modules/<x>.mjs    # 可选：题型/参考页渲染模块（构建时拼入 core 作用域）
```

## 2. manifest.json 契约

```json
{
  "id": "geography",                          // 必需：目录名一致
  "order": 30,                                // 必需：构建合并顺序（去重时先到先得）
  "scenes": [{ "key": "geography", "zh": "地理（香港中學）" }],   // 场景筛选条目
  "quizTypes": [{ "key": "arith", "zh": "算術練習" }],           // 考试新题型（需 modules 实现）
  "refSections": [{ "key": "ai-papers", "zh": "AI 論文" }],      // 参考页子页（需 modules 实现）
  "modules": ["arith.mjs"],                   // 构建时去 export 拼入全局作用域
  "files": ["words.json"],                    // 可选：词条文件名（默认 words.json）
  "formulasFile": "formulas.json",            // 可选：注入 PACKS.formulas
  "papersFile": "papers.json",                // 可选：注入 PACKS.papers
  "peopleFile": "people.json"                 // 可选：注入 PACKS.people（人与词 tab 渲染）
}
```

## 3. words.json 词条格式

```json
{ "word": "erosion", "phonetic": "/ɪˈrəʊʒn/", "pos": "n.", "meaning": "侵蝕", "c": "geography" }
```

| 字段 | 必需 | 规则 |
|---|---|---|
| word | ✅ | 英文（或中文词条如文化 pack），≤64 字符；全库去重按小写 |
| phonetic | — | IPA 文本；无则空串（UI 安全） |
| pos | — | 词性缩写，默认 "n." |
| meaning | ✅ | 中文释义（文化 pack 为英文释义+白话），2-80 字符 |
| c | ✅ | 分类 key，须与 manifest scenes 的 key 一致（或复用已有 key） |

**注意**：含义含白话解释时用「英文釋義（白話）—《出處》」格式——
`displayMeaning()` 会在出题时剥离括号与出处，防止答案泄漏（见 ai/culture pack 示范）。

## 4. modules/*.mjs 模块契约

- 构建时 `export ` 前缀被剥离，与 core.mjs 同全局作用域（可用 `PACKS`/`escapeHtml`/`mulberry32` 等）
- 题型函数：`generateXxx(op, difficulty, seed)` —— 确定性（同 seed 恒同题），供 startQuiz 调用
- 参考页渲染：`renderXxx(q, hide)` 返回 HTML 字符串，注册 `PACK_REF_RENDER["<refSection-key>"] = renderXxx`
- 纯函数建议放 `src/core.mjs`（可单测）；模块只做装配

## 5. 质量门（构建时自动校验）

`scripts/check-packs.py`（构建管线内）逐 pack 检查：
1. manifest 字段完整（id/order）
2. words.json 词条字段合法、无空 word/meaning、c 与 scenes 匹配
3. 全库 word 大小写去重
4. 引文/数据出处必须在 ATTRIBUTIONS.md 有记录（善意 = 署名，机器可查）

## 6. 快速开始

```bash
python3 scripts/new-pack.py mypack 我的学科       # 生成骨架
# 填 words.json → 补 ATTRIBUTIONS.md → 构建：
node scripts/build.mjs                            # 校验失败会报错
npm test                                         # 全量测试（含 pack 数据质量测试）
```

## 7. 给 dsh agent 作者

按本契约产出 `data/packs/<id>/` 后，提交 PR。CI 会跑：pack 校验 + 全量单测 +
可复现构建 diff。人工合并 —— 进化的账本是 git + 测试，不是 AI 自治。

---

参考实现：`data/packs/math`（题型+公式）、`data/packs/ai`（论文+人物+守则）、
`data/packs/people`（人物卡片）、`data/packs/geography`（纯词条）。
