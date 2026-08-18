#!/usr/bin/env node
// build.mjs — 构建独立 App：注入核心纯函数（去 export）与全部词库数据。
// 用法：node scripts/build.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// 构建前跑 pack 质量门（失败则中止构建）
import { execSync } from "node:child_process";
try { execSync("python3 scripts/check-packs.py", { cwd: root, stdio: "inherit" }); }
catch { console.error("pack 校验失败，构建中止（详见上）"); process.exit(1); }

const tpl = readFileSync(path.join(root, "app/template.html"), "utf8");
const vocab = JSON.parse(readFileSync(path.join(root, "data/vocabineer_947_words.json"), "utf8"));
const HK_FILES = ["hk_subject_words.json", "hk_campus.json"];
const hk = HK_FILES.flatMap((f) => JSON.parse(readFileSync(path.join(root, "data", f), "utf8")));
// Oxford 考试词表（可选：由 scripts/build-oxford.py 生成后生效）
const oxfordFiles = ["oxford_exam.json"];
const oxford = oxfordFiles.flatMap((f) => {
  const p = path.join(root, "data", f);
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return []; }
});
const core = readFileSync(path.join(root, "src/core.mjs"), "utf8");

// 合并香港学科词库（词条索引接续 947）
let next = Math.max(...vocab.map((e) => e.index)) + 1;
for (const e of [...hk, ...oxford]) {
  vocab.push({ index: next++, word: e.word, phonetic: e.phonetic, pos: e.pos, meaning: e.meaning, category_key: e.c });
}

// ---- 学科 packs（静态组合，构建时注入；pack 缺失则零成本）----
const packDir = path.join(root, "data", "packs");
const packs = [];
try {
  for (const d of readdirSync(packDir)) {
    const mf = path.join(packDir, d, "manifest.json");
    if (existsSync(mf)) packs.push({ dir: path.join(packDir, d), manifest: JSON.parse(readFileSync(mf, "utf8")) });
  }
} catch { /* data/packs 不存在 → 无 pack */ }
packs.sort((a, b) => (a.manifest.order || 0) - (b.manifest.order || 0));

// pack 词条合并（全库按 word 去重）；跨包重复 → 并入多场景引用 cs
// （如 hobby 的 wing 已在 transportation：wing 获得 cs:["model_aircraft"]，
//   场景筛选「航模」即可看到完整词表——允许引用其他词表的词）
const existingWords = new Set(vocab.map((e) => e.word.toLowerCase()));
for (const p of packs) {
  for (const f of p.manifest.files || ["words.json"]) {
    const arr = JSON.parse(readFileSync(path.join(p.dir, f), "utf8"));
    for (const e of arr) {
      const lw = e.word.toLowerCase();
      if (existingWords.has(lw)) {
        const prev = vocab.find((v) => v.word.toLowerCase() === lw);
        if (prev) {
          prev.cs = [...new Set([...(prev.cs || []), e.c, ...(e.cs || [])])];
        }
        continue;
      }
      existingWords.add(lw);
      vocab.push({ index: next++, word: e.word, phonetic: e.phonetic || "", pos: e.pos || "n.", meaning: e.meaning, category_key: e.c, cs: e.cs || [] });
    }
  }
}

const packScenes = packs.flatMap((p) => p.manifest.scenes || []);
const packQuizTypes = packs.flatMap((p) => p.manifest.quizTypes || []);
const packRefSections = packs.flatMap((p) => p.manifest.refSections || []);
const packFormulas = packs.flatMap((p) => p.manifest.formulasFile
  ? JSON.parse(readFileSync(path.join(p.dir, p.manifest.formulasFile), "utf8")) : []);
const packPeople = packs.flatMap((p) => p.manifest.peopleFile
  ? JSON.parse(readFileSync(path.join(p.dir, p.manifest.peopleFile), "utf8")) : []);
const packPapers = packs.flatMap((p) => p.manifest.papersFile
  ? JSON.parse(readFileSync(path.join(p.dir, p.manifest.papersFile), "utf8")) : []);
// 通用数据文件：manifest.dataFiles = { "prompts": "prompts.json" } → PACKS.prompts（场景层数据）
const packData = {};
for (const p of packs) {
  for (const [key, file] of Object.entries(p.manifest.dataFiles || {})) {
    if (!packData[key]) packData[key] = [];
    packData[key].push(...JSON.parse(readFileSync(path.join(p.dir, file), "utf8")));
  }
}
const packsJs = `const PACKS = ${JSON.stringify({ scenes: packScenes, quizTypes: packQuizTypes, refSections: packRefSections, formulas: packFormulas, people: packPeople, papers: packPapers, ...packData })};\n`;

// 紧凑 schema（与模板约定一致）；b=1 为基础模式词（947+香港学科+校园），b=0 为高级模式词
const BASIC_COUNT = 947 + hk.length;
const compact = vocab.map((e, idx) => ({ i: e.index, w: e.word, p: e.phonetic, pos: e.pos, m: e.meaning, c: e.category_key, b: idx < BASIC_COUNT ? 1 : 0, ...(e.cs && e.cs.length ? { cs: e.cs } : {}) }));

// 去 export 后注入行内脚本；pack modules 追加到 core 尾部（同一全局作用域）
let inlineCore = core.replace(/^export /gm, "");
for (const p of packs) {
  for (const m of p.manifest.modules || []) {
    inlineCore += "\n" + readFileSync(path.join(p.dir, "modules", m), "utf8").replace(/^export /gm, "") + "\n";
  }
}

let html = tpl;
if (!html.includes("/*__CORE__*/")) throw new Error("template missing /*__CORE__*/ marker");
if (!html.includes("/*__WORDS__*/")) throw new Error("template missing /*__WORDS__*/ marker");
if (!html.includes("/*__PACKS__*/")) throw new Error("template missing /*__PACKS__*/ marker");
if (!html.includes("/*__SCENARIOS__*/")) throw new Error("template missing /*__SCENARIOS__*/ marker");
if (!html.includes("/*__BPE_B64__*/")) throw new Error("template missing /*__BPE_B64__*/ marker");
if (!html.includes("/*__VERSION__*/")) throw new Error("template missing /*__VERSION__*/ marker");
html = html.replace("/*__CORE__*/", inlineCore);
html = html.replace("/*__PACKS__*/", packsJs);
html = html.replace("/*__WORDS__*/", JSON.stringify(compact));
// 场景农场产物（starter 场景包）：构建时注入，供「場景分享」一键载入
let starterScenarios = [];
try {
  const s = JSON.parse(readFileSync(path.join(root, "data/scenarios/starter.json"), "utf8"));
  if (Array.isArray(s)) starterScenarios = s;
} catch { /* 无 starter 包（如未跑农场）→ 空数组 */ }
html = html.replace("/*__SCENARIOS__*/", JSON.stringify(starterScenarios));
// GPT-2 BPE 词表（gzip+base64，构建期内联；运行时 DecompressionStream 解压，约 +280KB）
let bpeB64 = "";
try {
  bpeB64 = readFileSync(path.join(root, "data/tokenizer/vocab.bpe.gz")).toString("base64");
} catch { /* 词表缺失 → 空串，UI 自动降级为教学分词 */ }
html = html.replace("/*__BPE_B64__*/", JSON.stringify(bpeB64));
// 单字节词元 ID 表（256 项，≈700B base64）：从 encoder.json 提取 byte → token id，
// 用于显示 GPT-2 分词结果的数字 ID（合并片段的 ID 即 vocab.bpe 的 rank，无需此表）
let bpeByteIdsB64 = "";
try {
  const enc = JSON.parse(gunzipSync(readFileSync(path.join(root, "data/tokenizer/encoder.json.gz"))).toString("utf8"));
  const rev = new Map();
  for (const [id, s] of Object.entries(enc)) rev.set(s, Number(id));
  // GPT-2 标准 byte→unicode 映射（与 template 的 bytesToUnicode 同构）
  const b2u = new Map();
  let n = 0;
  for (let b = 0; b < 256; b++) {
    if (b >= 33 && b <= 126) { b2u.set(b, String.fromCharCode(b)); continue; }
    if (b >= 161 && b <= 172) { b2u.set(b, String.fromCharCode(n + 256)); n++; continue; }
    if (b >= 174 && b <= 255) { b2u.set(b, String.fromCharCode(n + 256)); n++; continue; }
    b2u.set(b, String.fromCharCode(n)); n++;
  }
  const ids = new Uint16Array(256);
  for (let b = 0; b < 256; b++) {
    const id = rev.get(b2u.get(b));
    ids[b] = id === undefined ? 0xffff : id;
  }
  bpeByteIdsB64 = Buffer.from(ids.buffer).toString("base64");
} catch { /* 词表缺失 → 空串，UI 降级为不显示数字 ID */ }
if (!html.includes("/*__BPE_BYTE_IDS__*/")) throw new Error("template missing /*__BPE_BYTE_IDS__*/ marker");
html = html.replace("/*__BPE_BYTE_IDS__*/", JSON.stringify(bpeByteIdsB64));
// 版本号：从 package.json 注入（顶部小字显示）
let appVersion = "0.0.0";
try { appVersion = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version; } catch { /* 缺 package.json */ }
html = html.replace("/*__VERSION__*/", JSON.stringify(appVersion));

const out = path.join(root, "app/lazeword.html");
writeFileSync(out, html);
console.log(`built ${out} (${compact.length} words, ${(html.length / 1024).toFixed(0)} KB)`);
