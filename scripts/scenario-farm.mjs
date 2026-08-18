/**
 * 场景农场：冷启动场景集的确定性生产者。
 * 基础词表（947 词）按每 20 词一组 → scenarioCompose → validateLaze 质量门
 * → data/scenarios/starter.json（提交入库，成为场景资产）。
 *
 * 生产与选择分离（docs/scenario-farm.md）：本脚本只产场景；个性化选择走 bandit（L1）。
 * 确定性：同词表同参数 → 逐位一致的场景集（可复现，git diff 可审计）。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../src/core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vocab = JSON.parse(readFileSync(join(root, "data/vocabineer_947_words.json"), "utf8"));
const CHUNK = 20;
const groups = [];
for (let i = 0; i < vocab.length; i += CHUNK) groups.push(vocab.slice(i, i + CHUNK));

const scenarios = groups.map((g, i) =>
  core.scenarioCompose({
    id: `starter-wordquiz-${i + 1}`,
    title: `基礎詞 第 ${i + 1} 組（${g.length} 詞）`,
    words: g.map(e => e.word),
    count: 10,
    seed: i + 1,
  })
);

// 质量门：每一份场景必须过 validateLaze（组合器契约的一部分）
const bad = scenarios.filter(s => !core.validateLaze(s).ok);
if (bad.length) {
  console.error(`场景农场失败：${bad.length} 份场景未过校验门`);
  for (const s of bad) console.error("  ✗", JSON.stringify(core.validateLaze(s).errors));
  process.exit(1);
}

const outDir = join(root, "data/scenarios");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "starter.json"), JSON.stringify(scenarios, null, 2) + "\n", "utf8");
console.log(`场景农场产出：${scenarios.length} 份 starter 场景（${vocab.length} 词 / 每 ${CHUNK} 词一组），全部通过 validateLaze`);
