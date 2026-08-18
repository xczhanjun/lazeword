// lazeword 核心纯函数单元测试（node:test，零依赖）
import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../src/core.mjs";

test("ipaSyllables: 多音节 + 主重音", () => {
  const syls = core.ipaSyllables("/æmˈbɪʃn/");
  assert.equal(syls.length, 3);
  assert.equal(syls[1].s, 1); // 主重音在 bɪ
  assert.deepEqual(syls.map(s => s.t), ["æm", "bɪ", "ʃn"]);
});

test("ipaSyllables: 主 + 次重音", () => {
  const syls = core.ipaSyllables("/ˌkɒmpəˈtɪʃn/");
  assert.ok(syls.some(s => s.s === 1), "有主重音");
  assert.ok(syls.some(s => s.s === 2), "有次重音");
});

test("ipaSyllables: 去掉首尾斜杠", () => {
  const a = core.ipaSyllables("/ˈhelθi/");
  const b = core.ipaSyllables("ˈhelθi");
  assert.deepEqual(a, b);
});

test("ipaSyllables: 尾辅音成音节（-tion 的 ʃn）", () => {
  const syls = core.ipaSyllables("/kəˌmjuːnɪˈkeɪʃn/");
  assert.equal(syls[syls.length - 1].t, "ʃn");
});

test("ipaSyllables: 无元音时整体返回", () => {
  assert.deepEqual(core.ipaSyllables("/tʃk/"), [{ t: "tʃk", s: 0 }]);
});

test("wordSyllables: 基础切分", () => {
  assert.deepEqual(core.wordSyllables("ambition"), ["am", "bi", "tion"]);
  assert.deepEqual(core.wordSyllables("computer"), ["com", "pu", "ter"]);
});

test("wordSyllables: 静音 e 不占音节", () => {
  assert.deepEqual(core.wordSyllables("take"), ["take"]);
});

test("wordSyllables: 二合字母保持完整", () => {
  const syls = core.wordSyllables("teacher");
  assert.equal(syls.join(""), "teacher");
});

/* ---- FSRS-5（golden 向量由 ts-fsrs@5.4.1 生成：
   /tmp/fsrs-golden/gen.mjs：generatorParameters({w: FSRS_W, version:"FSRS-5",
   enable_short_term:false, enable_fuzz:false, request_retention:0.9,
   maximum_interval:36500})；容差 1e-4 断言公式层一致性 ---- */
const DAY = 86400000;
const near = (a, b, msg, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test("fsrsInit: 评级 1-4 的初始稳定性与难度（golden）", () => {
  const golden = { 1: [0.4026, 7.1949], 2: [1.1839, 6.4883], 3: [3.173, 5.2824], 4: [15.6911, 3.2245] };
  for (const [g, [s, d]] of Object.entries(golden)) {
    near(core.fsrsInitStability(+g), s, `initS(${g})`);
    near(core.fsrsInitDifficulty(+g), d, `initD(${g})`);
  }
});

test("fsrsRetrievability: 记忆保留率曲线（golden）", () => {
  const golden = { "0/3.173": 1, "1/3.173": 0.965, "3/3.173": 0.9047, "10/3.173": 0.7583, "20/50": 0.9561, "100/50": 0.825, "1/0.40255": 0.7949 };
  for (const [k, v] of Object.entries(golden)) {
    const [t, S] = k.split("/").map(Number);
    near(core.fsrsRetrievability(t, S), v, `R(${k})`);
  }
});

test("fsrsReview: Good×5 序列（golden：s/d/间隔）", () => {
  const goldS = [3.173, 5.8691, 8.4199, 10.8816, 13.2805];
  const goldD = [5.2824, 5.273, 5.2635, 5.2542, 5.2448];
  let st = core.fsrsEmptyState();
  for (let i = 0; i < 5; i++) {
    st = core.fsrsReview(st, 3, i * DAY);
    near(st.s, goldS[i], `seqA s[${i}]`);
    near(st.d, goldD[i], `seqA d[${i}]`);
    assert.equal(st.due, i * DAY + core.fsrsNextInterval(st.s) * DAY);
    assert.equal(st.state, 2);
    assert.equal(st.reps, i + 1);
  }
});

test("fsrsReview: 忘词回炉序列（golden s/d + 产品 due 语义）", () => {
  const gold = [
    { g: 3, t: 0, s: 3.173, d: 5.2824 },
    { g: 3, t: 1 * DAY, s: 5.8691, d: 5.273 },
    { g: 1, t: 3 * DAY, s: 1.3535, d: 6.7906 },
    { g: 3, t: 3 * DAY + 10 * 60000, s: 1.3693, d: 6.7742 },
    { g: 4, t: 8 * DAY, s: 25.704, d: 6.2368 },
  ];
  // s[3]/s[4] 为产品语义值：ts-fsrs 回炉后 Good 走学习步机制（稳定性不更新），
  // 我们走标准 recall 公式（r≈1 时稳定性微增）—— 分歧已在 core 注释与概念文档声明。
  let st = core.fsrsEmptyState();
  for (const [i, e] of gold.entries()) {
    st = core.fsrsReview(st, e.g, e.t);
    const tol = i === 4 ? 0.1 : 1e-4; // s[4] 由分歧基点累积，放宽容差
    near(st.s, e.s, `seqB s[${i}]`, tol);
    near(st.d, e.d, `seqB d[${i}]`);
  }
  // 产品 due 语义（ts-fsrs 此处走学习步机制，我们按产品覆盖）：
  // 忘词（rating 1）→ 10 分钟回炉；回炉后 Good → 正常间隔（round(1.3535)=1 天）
  let s2 = core.fsrsReview(core.fsrsEmptyState(), 3, 0);
  s2 = core.fsrsReview(s2, 1, 3 * DAY);
  assert.equal(s2.due, 3 * DAY + 600000);
  assert.equal(s2.state, 3);
  assert.equal(s2.lapses, 1);
  const s3 = core.fsrsReview(s2, 3, 3 * DAY + 600000);
  assert.equal(s3.due, 3 * DAY + 600000 + 1 * DAY); // round(1.3535) = 1 天
  assert.equal(s3.state, 2);
});

test("fsrsReview: Hard/Easy 路径（golden）", () => {
  const stH = core.fsrsReview(core.fsrsEmptyState(), 2, 0);
  near(stH.s, 1.1839, "new+Hard s");
  near(stH.d, 6.4883, "new+Hard d");
  const stE = core.fsrsReview(core.fsrsEmptyState(), 4, 0);
  near(stE.s, 15.6911, "new+Easy s");
  // Review 后 Hard（golden seqD）：New+Good@0, Good@3d, Hard@4d
  let c = core.fsrsReview(core.fsrsEmptyState(), 3, 0);
  c = core.fsrsReview(c, 3, 3 * DAY);
  const h = core.fsrsReview(c, 2, 4 * DAY);
  near(h.s, 11.2932, "seqD hard s");
  near(h.d, 6.0271, "seqD hard d");
});

test("fsrsReview: 确定性——同输入恒同输出", () => {
  const a = core.fsrsReview(core.fsrsReview(core.fsrsEmptyState(), 3, 0), 1, DAY);
  const b = core.fsrsReview(core.fsrsReview(core.fsrsEmptyState(), 3, 0), 1, DAY);
  assert.deepEqual(a, b);
});

test("foldWordStates: 空轨迹 → 空对象；乱序事件按时间折叠", () => {
  assert.deepEqual(core.foldWordStates([], 0), {});
  const evs = [
    { type: "remember", w: 1, rating: 3, t: 5 * DAY, source: "app" },
    { type: "know", w: 1, rating: 3, t: 0, source: "app" },
    { type: "know", w: 2, rating: 3, t: 0, source: "app" },
  ];
  const st = core.foldWordStates(evs, 0);
  assert.ok(st[1] && st[2]);
  near(st[1].s, 15.032, "乱序折叠 s"); // golden: know@0 + remember@5d（ts-fsrs 同序列）
  assert.equal(st[1].reps, 2);
  assert.equal(st[2].reps, 1);
});

test("foldWordStates: quiz/game/daily 不产生调度", () => {
  const evs = [
    { type: "quiz", s: 8, n: 10, t: 0 },
    { type: "know", w: 5, rating: 3, t: 0, source: "app" },
    { type: "game", s: 120, t: 0 },
  ];
  const st = core.foldWordStates(evs, 0);
  assert.equal(Object.keys(st).length, 1);
  assert.ok(st[5]);
});

test("foldWordStates: anki 事件与 app 事件混合折叠（跨平台时间线）", () => {
  const evs = [
    { type: "know", w: 9, rating: 3, t: 0, source: "app" },
    { type: "anki", w: 9, rating: 1, t: 2 * DAY, source: "anki" },
    { type: "anki", w: 9, rating: 4, t: 5 * DAY, source: "anki" },
  ];
  const st = core.foldWordStates(evs, 0);
  assert.ok(st[9]);
  assert.equal(st[9].lapses, 1);
  near(st[9].s, 16.8373, "混合折叠 s"); // golden: know@0 + Again@2d + Easy@5d
  near(st[9].d, 6.2631, "混合折叠 d");
});

test("fsrsMigrateLegacy: stage 0-5 全映射、due 精确保持", () => {
  const due = 1_800_000_000_000;
  for (let stage = 0; stage <= 5; stage++) {
    const e = core.fsrsMigrateLegacy({ stage, due }, 42);
    assert.equal(e.w, 42);
    assert.equal(e.seed.due, due);
    const st = core.foldWordStates([e], due)[42];
    assert.ok(st, `stage ${stage} fold`);
    assert.equal(st.due, due, `stage ${stage} due 不变`);
    if (stage >= 1) { assert.equal(st.s, [0, 1, 3, 7, 15, 30][stage]); assert.equal(st.reps, stage); }
    else { assert.equal(st.s, 0); assert.equal(st.reps, 0); }
  }
});

test("foldWordStates: seed 快照初始化且 due 不变（迁移+后续事件）", () => {
  const due = 1_800_000_000_000;
  const seed = core.fsrsMigrateLegacy({ stage: 2, due }, 42);
  const later = { type: "remember", w: 42, rating: 3, t: due + DAY, source: "app" };
  const st = core.foldWordStates([later, seed], due)[42];
  assert.ok(st);
  assert.equal(st.reps, 3);
  assert.ok(st.due > due);
});

test("compactTrajectory: 压缩后状态等价、事件数受控", () => {
  const events = [];
  for (let i = 0; i < 200; i++) {
    events.push({ type: "know", w: i % 3, rating: 3, t: i * DAY, source: "app" });
    if (i % 10 === 0) events.push({ type: "quiz", s: 5, n: 10, t: i * DAY + 1 });
  }
  const before = core.foldWordStates(events, 200 * DAY);
  const compact = core.compactTrajectory(events, 200 * DAY);
  assert.ok(compact.length < 100, `compact length ${compact.length}`);
  const after = core.foldWordStates(compact, 200 * DAY);
  assert.deepEqual(Object.keys(before).sort(), Object.keys(after).sort());
  for (const w of Object.keys(before)) {
    near(after[w].s, before[w].s, `compact s w${w}`);
    assert.equal(after[w].due, before[w].due, `compact due w${w}`);
  }
});

test("gradeGuess: 全对全绿 / 错位黄 / 不存在灰", () => {
  assert.deepEqual(core.gradeGuess("hello", "hello").map(x => x.status), ["green", "green", "green", "green", "green"]);
  const mixed = core.gradeGuess("aab", "baa");
  assert.equal(mixed[0].status, "yellow");
  assert.deepEqual(core.gradeGuess("xyz", "abc").map(x => x.status), ["gray", "gray", "gray"]);
});

test("similarity: 精确=1 / 接近≈0.88 / 无关=0", () => {
  assert.equal(core.similarity("ambition", "ambition"), 1);
  assert.ok(Math.abs(core.similarity("ambiton", "ambition") - 0.875) < 0.01);
  assert.equal(core.similarity("xyz", "ambition"), 0);
});

test("blankWord: 命中与未命中", () => {
  const hit = core.blankWord("Her ambition is big.", "ambition");
  assert.equal(hit.sentence, "Her ______ is big.");
  assert.equal(hit.found, true);
  const miss = core.blankWord("He tried hard.", "try");
  assert.equal(miss.found, false);
});

test("mulberry32: 同种子序列完全一致", () => {
  const a = core.mulberry32(42), b = core.mulberry32(42);
  for (let i = 0; i < 10; i++) assert.equal(a(), b());
});

test("seededShuffle: 确定性 + 是原数组的排列", () => {
  const arr = Array.from({ length: 20 }, (_, i) => i);
  const x = core.seededShuffle(arr, 99), y = core.seededShuffle(arr, 99);
  assert.deepEqual(x, y);
  assert.deepEqual([...x].sort((a, b) => a - b), arr);
});

test("detectAffixes: 前缀/后缀/词根", () => {
  const pre = core.detectAffixes("unhappy").map(a => a.affix);
  assert.ok(pre.includes("un"));
  const suf = core.detectAffixes("ambition").map(a => a.affix);
  assert.ok(suf.includes("tion"));
  const roots = core.detectAffixes("transport").map(a => a.affix);
  assert.ok(roots.includes("port"));
});

test("escapeHtml: 转义 XSS 字符", () => {
  assert.equal(core.escapeHtml(`<script>"&'`), "&lt;script&gt;&quot;&amp;&#39;");
});

test("事件日志: 不可变追加 + 确定性折叠", () => {
  const log0 = core.createEventLog(1);
  const log1 = core.appendEvent(log0, { type: "seen", word: "apple", t: 1000 });
  const log2 = core.appendEvent(log1, { type: "known", word: "apple", t: 2000 });
  // 原日志未被修改
  assert.equal(log0.events.length, 0);
  assert.equal(log1.events.length, 1);
  assert.equal(log2.events.length, 2);
  // 折叠出状态
  const state = core.foldEvents(log2, (acc, e) => {
    if (e.type === "known") acc.known.push(e.word);
    return acc;
  }, { known: [] });
  assert.deepEqual(state, { known: ["apple"] });
  // seq 连续
  assert.deepEqual(log2.events.map(e => e.seq), [0, 1]);
});

test("事件日志: 重放确定性（同输入同状态）", () => {
  const build = () => {
    let log = core.createEventLog(7);
    for (const w of core.seededShuffle(["a", "b", "c", "d"], 7)) log = core.appendEvent(log, { type: "seen", word: w, t: 0 });
    return log;
  };
  assert.deepEqual(build(), build());
});

test("eventsByDay: 按本地日期聚合", () => {
  // 2026-08-15 本地时间 09:00 与 21:00 的两条事件
  const t1 = new Date(2026, 7, 15, 9, 0, 0).getTime();
  const t2 = new Date(2026, 7, 15, 21, 0, 0).getTime();
  const t3 = new Date(2026, 7, 16, 8, 0, 0).getTime();
  const days = core.eventsByDay([
    { type: "know", t: t1 },
    { type: "quiz", t: t2 },
    { type: "game", t: t3 },
  ]);
  assert.equal(days["2026-08-15"], 2);
  assert.equal(days["2026-08-16"], 1);
  assert.equal(Object.keys(days).length, 2);
});

test("eventsByDay: 忽略无时间戳事件", () => {
  const days = core.eventsByDay([{ type: "know" }, null, { type: "quiz", t: 0 }]);
  assert.equal(Object.keys(days).length, 1);
});

test("轨迹 + eventsByDay: 端到端确定性", () => {
  // 同一 seed 重放同一学习序列 → 完全相同的每日聚合
  const run = (seed) => {
    let log = core.createEventLog(seed);
    const base = new Date(2026, 7, 10).getTime();
    for (let i = 0; i < 10; i++) {
      log = core.appendEvent(log, { type: i % 3 === 0 ? "quiz" : "know", t: base + i * 3600_000 });
    }
    return core.eventsByDay(log.events);
  };
  assert.deepEqual(run(3), run(3));
});

test("zhConv: t2s 基本转换", () => {
  const t2s = "發:发,學:学,單:单,詞:词,體:体,寫:写,習:习";
  assert.equal(core.zhConv("學習單詞", t2s), "学习单词");
  // 不在表中的字符原样保留
  assert.equal(core.zhConv("ABC 中文", t2s), "ABC 中文");
});

test("zhConv: s2t 方向（映射表决定方向）", () => {
  const s2t = "发:發,词:詞,体:體";
  assert.equal(core.zhConv("发词体", s2t), "發詞體");
});

test("zhConv: 空映射表 = 恒等", () => {
  assert.equal(core.zhConv("測試", ""), "測試");
});

/* ---- Anki 兼容纯函数 ---- */
import { ANKI_TSV_HEADER, ankiTsvRow, ankiNoteFor } from "../src/core.mjs";

test("ankiTsvRow: 含词、IPA 与 tab 分隔", () => {
  const row = ankiTsvRow({ w: "apple", p: "/ˈæp.əl/", pos: "n.", m: "蘋果", c: "fruits" });
  if (!row.includes("\t")) throw new Error("缺少 tab 分隔符");
  if (!row.includes("apple")) throw new Error("缺少单词");
  if (!row.includes("ˈæp.əl")) throw new Error("缺少 IPA");
  if (!row.includes("蘋果")) throw new Error("缺少释义");
});

test("ankiTsvRow: HTML 转义恶意内容", () => {
  const row = ankiTsvRow({ w: "<script>", p: "", pos: "n.", m: "<b>bold</b>", c: "x" });
  if (row.includes("<script>")) throw new Error("单词未转义");
  if (row.includes("<b>bold</b>")) throw new Error("释义未转义");
  if (!row.includes("&lt;script&gt;")) throw new Error("缺少转义后的单词");
});

test("ankiNoteFor: Basic 模板、正面词+音标、背面词性+释义", () => {
  const n = ankiNoteFor({ w: "book", p: "/bʊk/", pos: "n.", m: "書", c: "school" }, "my-deck");
  if (n.deckName !== "my-deck") throw new Error("deckName 错误: " + n.deckName);
  if (n.modelName !== "Basic") throw new Error("modelName 错误");
  if (!n.fields.Front.includes("book") || !n.fields.Front.includes("/bʊk/")) throw new Error("Front 缺词或音标");
  if (!n.fields.Back.includes("n.") || !n.fields.Back.includes("書")) throw new Error("Back 缺词性或释义");
  if (JSON.stringify(n.tags) !== JSON.stringify(["lazeword", "school"])) throw new Error("tags 错误: " + JSON.stringify(n.tags));
});

test("ANKI_TSV_HEADER: Anki 导入头完整", () => {
  const h = ANKI_TSV_HEADER;
  if (!h.includes("#separator:tab")) throw new Error("缺 #separator:tab");
  if (!h.includes("#html:true")) throw new Error("缺 #html:true");
  if (!h.includes("#tags:lazeword")) throw new Error("缺 #tags:lazeword");
});

/* ---- Anki 事件导入 ---- */
test("ankiRevlogToEvent: ease→rating、id 秒→毫秒", () => {
  const map = new Map([[101, 7]]);
  const ev = core.ankiRevlogToEvent({ cardId: 101, ease: 2, id: 1750000000 }, map);
  assert.equal(ev.w, 7);
  assert.equal(ev.rating, 2);
  assert.equal(ev.t, 1750000000000); // 秒 → 毫秒
  assert.equal(ev.source, "anki");
  assert.equal(ev.type, "anki");
});

test("ankiRevlogToEvent: 毫秒 id 原样、无匹配词返回 null", () => {
  const map = new Map([[101, 7]]);
  const ev = core.ankiRevlogToEvent({ cardId: 101, ease: 4, id: 1750000000000 }, map);
  assert.equal(ev.t, 1750000000000);
  assert.equal(core.ankiRevlogToEvent({ cardId: 999, ease: 3, id: 1750000000000 }, map), null);
  assert.equal(core.ankiRevlogToEvent({ cardId: 101, ease: 9, id: 0 }, map).rating, 4); // ease 越界钳制
});

test("foldWordStates: seed 是确定性 checkpoint（历史事件早于快照时重置）", () => {
  const due = 1_800_000_000_000;
  const seed = core.fsrsMigrateLegacy({ stage: 2, due }, 42);   // t = due - 3天
  const olderAnki = { type: "anki", w: 42, rating: 1, t: due - 10 * 86400000, source: "anki" }; // 早于快照
  const later = { type: "remember", w: 42, rating: 3, t: due + 86400000, source: "app" };
  // 只有快照 + 更早的 anki 事件：checkpoint 覆盖历史，due 精确等于 seed
  const st = core.foldWordStates([olderAnki, seed], due)[42];
  assert.equal(st.due, due, "快照重置：due 回到 seed 值");
  assert.equal(st.reps, 2);
  // 快照之后的事件正常折叠推进
  const st2 = core.foldWordStates([later, olderAnki, seed], due)[42];
  assert.ok(st2.due > due, "快照之后的 later 事件正常折叠");
  assert.equal(st2.reps, 3);
});

/* ---- 数学 pack 生成器（模块以全局作用域依赖 core，测试用 new Function 搭桥） ---- */
import { readFileSync } from "node:fs";
const arithSrc = readFileSync(new URL("../data/packs/math/modules/arith.mjs", import.meta.url), "utf8").replace(/^export /gm, "");
const arithMod = new Function("mulberry32", arithSrc + "; return { generateArithmetic, packMathUniqueOpts };")(core.mulberry32);
const { generateArithmetic, packMathUniqueOpts } = arithMod;
const PACKS_STUB = { formulas: JSON.parse(readFileSync(new URL("../data/packs/math/formulas.json", import.meta.url), "utf8")) };
const formulaSrc = readFileSync(new URL("../data/packs/math/modules/formulas.mjs", import.meta.url), "utf8").replace(/^export /gm, "");
const formulaMod = new Function("mulberry32", "PACKS", "PACK_REF_RENDER", "escapeHtml", "packMathUniqueOpts",
  formulaSrc + "; return { renderMathFormulas, generateFormulaQuestion };")(core.mulberry32, PACKS_STUB, {}, core.escapeHtml, packMathUniqueOpts);
const { renderMathFormulas, generateFormulaQuestion } = formulaMod;

test("generateArithmetic: 确定性 + 答案正确 + 选项互异含正确", () => {
  for (let seed = 0; seed < 20; seed++) {
    for (const op of ["add", "sub", "mul", "div", "mix"]) {
      for (const diff of [1, 2, 3]) {
        const g1 = generateArithmetic(op, diff, seed);
        const g2 = generateArithmetic(op, diff, seed);
        assert.deepEqual(g1, g2, "同 seed 恒同题");
        // 验证答案
        const [a, b] = g1.q.replace(" = ？", "").split(/ [+−×÷] /);
        const sym = g1.q.match(/ [+−×÷] /)[0].trim();
        const calc = { "+": +a + +b, "−": +a - +b, "×": +a * +b, "÷": +a / +b }[sym];
        assert.equal(g1.a, calc, `答案错误: ${g1.q}`);
        assert.ok(Number.isInteger(g1.a), "答案须为整数");
        assert.equal(new Set(g1.opts).size, 4, "4 个互异选项");
        assert.ok(g1.opts.includes(g1.a), "选项含正确答案");
      }
    }
  }
});

test("generateFormulaQuestion: 整数答案、选项合法、确定性", () => {
  for (let seed = 0; seed < 30; seed++) {
    const g1 = generateFormulaQuestion(seed);
    const g2 = generateFormulaQuestion(seed);
    assert.deepEqual(g1, g2);
    assert.ok(Number.isInteger(g1.a), "答案整数");
    assert.equal(new Set(g1.opts).size, 4);
    assert.ok(g1.opts.includes(g1.a));
    assert.ok(g1.q.length > 5);
  }
});

test("renderMathFormulas: 分组渲染 + 搜索过滤", () => {
  const html = renderMathFormulas("", false);
  if (!html.includes("代數") || !html.includes("幾何") || !html.includes("勾股定理")) throw new Error("公式页缺分组/条目: " + html.slice(0, 80));
  if (!html.includes("formula-row")) throw new Error("缺公式行样式类");
  const filtered = renderMathFormulas("勾股", false);
  if (!filtered.includes("勾股定理")) throw new Error("搜索应命中勾股定理");
  if (filtered.includes("圓面積")) throw new Error("搜索应过滤掉圓面積");
});

/* ---- 性能回归（宽松预算防 CI 抖动；预算数量级远超当前实测，只防回归性退化） ---- */
test("perf: zhConv 万次短文本转换 < 800ms（防映射表未缓存回归）", () => {
  const map = "發:发,學:学,單:单,詞:词,庫:库,設:设,置:置,統:统,計:计,".repeat(200); // 模拟 1000+ 对映射
  const s0 = performance.now();
  for (let i = 0; i < 10000; i++) core.zhConv("發學單詞庫設置統計", map);
  const ms = performance.now() - s0;
  assert.ok(ms < 800, `万次转换耗时 ${ms.toFixed(0)}ms`);
});

test("perf: makeZhMap 同一映射串只编译一次", () => {
  const map = "發:发,學:学,單:单,詞:词,庫:库,設:设,置:置,統:统,計:计,".repeat(200);
  const m1 = core.makeZhMap(map);
  const m2 = core.makeZhMap(map);
  assert.equal(m1, m2, "同一映射串必须返回同一实例（缓存命中）");
});

test("perf: foldWordStates 2 万事件 < 2s", () => {
  const events = [];
  for (let i = 0; i < 20000; i++) {
    events.push({ type: i % 3 === 0 ? "know" : (i % 3 === 1 ? "remember" : "wrong"), w: i % 200, rating: i % 3 === 2 ? 1 : 3, t: i * 60000, source: "app" });
  }
  const s0 = performance.now();
  const st = core.foldWordStates(events, 20000 * 60000);
  const ms = performance.now() - s0;
  assert.ok(ms < 2000, `fold 2万事件耗时 ${ms.toFixed(0)}ms`);
  assert.ok(Object.keys(st).length > 0);
});

test("perf: compactTrajectory 2 万事件 < 3s 且等价", () => {
  const events = [];
  for (let i = 0; i < 20000; i++) {
    events.push({ type: i % 3 === 0 ? "know" : (i % 3 === 1 ? "remember" : "wrong"), w: i % 200, rating: 3, t: i * 60000, source: "app" });
  }
  const before = core.foldWordStates(events, 20000 * 60000);
  const s0 = performance.now();
  const compact = core.compactTrajectory(events, 20000 * 60000);
  const ms = performance.now() - s0;
  assert.ok(ms < 3000, `压缩耗时 ${ms.toFixed(0)}ms`);
  const after = core.foldWordStates(compact, 20000 * 60000);
  for (const w of Object.keys(before)) {
    assert.equal(after[w].due, before[w].due, `压缩后 due 等价 w${w}`);
  }
});

/* ---- 功能回归（评审发现的边界补充） ---- */
test("packMathUniqueOpts: 千次生成全部为正整数且互异含正确", () => {
  for (let seed = 0; seed < 1000; seed++) {
    const rng = core.mulberry32(seed);
    const ans = seed % 50 + 1;
    const opts = packMathUniqueOpts(ans, rng);
    assert.equal(opts.length, 4);
    assert.ok(opts.every(o => Number.isInteger(o) && o >= 1), `负数/非整数选项: ${opts} (seed ${seed}, ans ${ans})`);
    assert.equal(new Set(opts).size, 4, `选项重复: ${opts}`);
    assert.ok(opts.includes(ans), `缺正确答案: ${opts} vs ${ans}`);
  }
});

test("generateArithmetic: 全组合合法（无除零/越界）", () => {
  for (const op of ["add", "sub", "mul", "div", "mix"]) {
    for (const diff of [1, 2, 3]) {
      for (let seed = 0; seed < 50; seed++) {
        const g = generateArithmetic(op, diff, seed);
        const m = g.q.match(/^(-?\d+) ([+−×÷]) (-?\d+) = ？$/);
        assert.ok(m, `题干格式: ${g.q}`);
        if (m && m[2] === "÷") assert.ok(+m[3] > 0, `除数为零: ${g.q}`);
        assert.ok(Number.isInteger(g.a), `答案非整数: ${g.q} = ${g.a}`);
      }
    }
  }
});

test("foldWordStates: rating 越界钳制 + relapseMs 0 覆盖", () => {
  const evs = [
    { type: "wrong", w: 1, rating: 1, relapseMs: 0, t: 0, source: "app" },   // Again + 立即到期
    { type: "know", w: 2, rating: 0, t: 0, source: "app" },                    // 钳到 1(Again) → 默认 10 分钟回炉
    { type: "anki", w: 3, rating: 99, t: 0, source: "anki" },                  // 钳到 4(Easy) → Review + 间隔
  ];
  const st = core.foldWordStates(evs, 100);
  assert.equal(st[1].state, 3, "rating 1 + relapseMs 0 → 回炉");
  assert.equal(st[1].due, 0, "relapseMs 0：错题立即到期（due=事件时间）");
  assert.equal(st[2].state, 3, "rating 0 钳制为 1(Again) → 回炉");
  assert.equal(st[2].due, core.RELAPSE_MS, "默认回炉 10 分钟");
  assert.equal(st[3].state, 2, "rating 99 钳制为 4(Easy) → Review");
  assert.equal(st[3].s, core.fsrsInitStability(4), "Easy 初始稳定性");
});

test("fsrsMigrateLegacy: stage 越界钳制、due=0 边界", () => {
  const e1 = core.fsrsMigrateLegacy({ stage: 99, due: 1000 }, 1);
  assert.equal(e1.seed.reps, 5, "stage 越界钳到 5");
  assert.equal(e1.seed.due, 1000);
  const e2 = core.fsrsMigrateLegacy({ stage: -3, due: 0 }, 2);
  assert.equal(e2.seed.reps, 0, "负 stage 钳到 0");
  const st = core.foldWordStates([e2], 0)[2];
  assert.equal(st.due, 0, "due=0 保持");
});

test("fsrsReview: 不变性——输入状态不被修改", () => {
  const before = core.fsrsEmptyState();
  const snapshot = JSON.stringify(before);
  core.fsrsReview(before, 3, 1000);
  assert.equal(JSON.stringify(before), snapshot, "fsrsReview 不得修改输入状态");
});

/* ---- 字母组词纯逻辑 ---- */
test("letterGameWord: 小写、去非字母、取前 5 字母", () => {
  assert.equal(core.letterGameWord("Store"), "store");
  assert.equal(core.letterGameWord("CULTURE'S"), "cultu");
  assert.equal(core.letterGameWord("人之初"), "");
  assert.equal(core.letterGameWord("ab-cd-ef"), "abcde");
});

test("letterGridBuild: 确定性 + 词可沿路径读回 + 填充完整", () => {
  const targets = ["store", "truck", "brake", "pump", "gear", "shaft"];
  const g1 = core.letterGridBuild(targets, 7, 42);
  const g2 = core.letterGridBuild(targets, 7, 42);
  assert.deepEqual(g1, g2, "同 seed 同网格");
  assert.equal(g1.placed.length, 6, "6 词全部放置");
  assert.ok(g1.grid.every(c => /^[a-z]$/.test(c)), "每格为单个小写字母");
  for (const p of g1.placed) {
    const readback = p.path.map(i => g1.grid[i]).join("");
    assert.equal(readback, p.word, `路径读回 ${p.word}`);
  }
});

test("letterPathValid: 相邻/对角/重复/越界/跳格", () => {
  const size = 7;
  assert.equal(core.letterPathValid([0, 1, 2, 3, 4], size), true, "横线");
  assert.equal(core.letterPathValid([0, 8, 16], size), true, "对角");
  assert.equal(core.letterPathValid([0, 1, 0], size), false, "重复访问");
  assert.equal(core.letterPathValid([-1, 0], size), false, "负越界");
  assert.equal(core.letterPathValid([48, 49], size), false, "上越界");
  assert.equal(core.letterPathValid([0, 2], size), false, "跳格");
  assert.equal(core.letterPathValid([], size), false, "空路径");
});


/* ---- 单词赛车纯逻辑 ---- */
test("raceGate: 三道互异、含目标词、正确车道准确、确定性", () => {
  const words = Array.from({ length: 20 }, (_, i) => ({ w: "word" + i, m: "词" + i }));
  for (let seed = 0; seed < 30; seed++) {
    const g1 = core.raceGate(words, core.mulberry32(seed));
    const g2 = core.raceGate(words, core.mulberry32(seed));
    assert.deepEqual(g1, g2, "同 rng 恒同门");
    assert.equal(g1.lanes.length, 3);
    assert.equal(new Set(g1.lanes).size, 3, "三道互异");
    assert.ok(g1.lanes.includes(g1.target), "含目标词");
    assert.equal(g1.lanes[g1.correctLane], g1.target, "正确车道指向目标词");
  }
  // 词池不足
  assert.equal(core.raceGate([{ w: "only" }], core.mulberry32(1)), null);
});

/* ---- 與 AI 對話模板 ---- */
import { readFileSync as rfs } from "node:fs";
const aiRefSrc = rfs(new URL("../data/packs/ai/modules/ai-ref.mjs", import.meta.url), "utf8").replace(/^export /gm, "");
const aiRefMod = new Function("PACK_REF_RENDER", "PACKS", "escapeHtml",
  aiRefSrc + "; return { chatTemplate, renderAiChat };")({}, { papers: [], people: [] }, core.escapeHtml);
const { chatTemplate, renderAiChat } = aiRefMod;

test("chatTemplate: 五种模板非空骨架", () => {
  for (const k of ["describe", "story", "why", "verify", "fix"]) {
    const t = chatTemplate(k, []);
    assert.ok(t.length > 10, `${k} 模板过短: ${t}`);
  }
  assert.equal(chatTemplate("nope", []), "", "未知模板返回空串");
});

test("chatTemplate: story 注入已学词（去重 ≤10）", () => {
  const words = ["apple", "book", "apple", "cat", "dog", "egg", "fish", "goat", "hat", "ice", "jam", "kite"];
  const t = chatTemplate("story", words);
  assert.ok(t.startsWith("Write a 5-sentence story using these words: "), t);
  const list = t.split(": ")[1].split(". Use")[0];
  const arr = list.split(", ");
  assert.ok(arr.length <= 10, `注入词数超限: ${arr.length}`);
  assert.equal(new Set(arr).size, arr.length, "注入词去重");
  assert.ok(!arr.includes("apple".toLowerCase()) || arr.filter(x => x === "apple").length === 1);
  // 无已学词时的兜底
  assert.ok(chatTemplate("story", []).includes("______"));
});

test("renderAiChat: 返回含模板按钮与四要素的骨架（无 key 时提示）", () => {
  globalThis.settings = { deepseekKey: "" };
  globalThis.setTimeout = setTimeout;
  const html = renderAiChat("", false);
  if (!html.includes("四要素")) throw new Error("缺四要素教学");
  if (!html.includes("aiChatTemplate('verify')")) throw new Error("缺 verify 模板按钮");
  if (!html.includes("還沒設定 DeepSeek key")) throw new Error("无 key 提示缺失");
  if (!html.includes("aiChatInput")) throw new Error("缺输入框");
  delete globalThis.settings;
});

/* ---- 单词挖雷纯逻辑 ---- */
test("mineField: 雷数正确、相邻计数正确（暴力对照）、确定性", () => {
  for (const seed of [1, 7, 42]) {
    const f1 = core.mineField(9, 12, seed);
    const f2 = core.mineField(9, 12, seed);
    assert.equal(f1.mines.size, 12, "雷数");
    assert.deepEqual([...f1.mines], [...f2.mines], "同 seed 同雷场");
    // 暴力对照计数
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9), c = i % 9;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < 9 && cc >= 0 && cc < 9 && f1.mines.has(rr * 9 + cc)) n++;
      }
      assert.equal(f1.counts[i], n, `counts[${i}]`);
    }
  }
});

test("mineReveal: 零扩散、数字格停止、不含雷", () => {
  const f = core.mineField(9, 12, 42);
  // 找一个数字为 0 且非雷的格子
  const zero = f.counts.findIndex((c, i) => c === 0 && !f.mines.has(i));
  assert.ok(zero >= 0, "存在零格");
  const out = core.mineReveal(f, zero, new Set());
  assert.ok(out.includes(zero));
  assert.ok(out.every(i => !f.mines.has(i)), "扩散不含雷");
  assert.ok(out.every(i => f.counts[i] === 0 || out.length >= 1), "扩散集合法");
  // 数字格不扩散：单独翻开数字格只返回自身
  const num = f.counts.findIndex((c, i) => c > 0 && !f.mines.has(i));
  const out2 = core.mineReveal(f, num, new Set());
  assert.deepEqual(out2, [num], "数字格不扩散");
  // 雷格不返回
  const m = [...f.mines][0];
  assert.deepEqual(core.mineReveal(f, m, new Set()), [], "雷格不可翻开");
});

test("letterGridBuild: 随机种子下绝大多数能放满 6 词", () => {
  const targets = ["store", "truck", "brake", "pump", "gear", "shaft"];
  let full = 0;
  for (let seed = 0; seed < 50; seed++) {
    const g = core.letterGridBuild(targets, 7, seed);
    if (g.placed.length === 6) full++;
  }
  assert.ok(full >= 47, `50 种子中仅 ${full} 个放满（应 ≥47）`);
});

/* ---- 在线批量加词 ---- */
test("parseAddWordsLine: 三种输入形态", () => {
  assert.deepEqual(core.parseAddWordsLine("serendipity"), { w: "serendipity", m: null });
  assert.deepEqual(core.parseAddWordsLine("serendipity 意外發現珍奇事物的本領"), { w: "serendipity", m: "意外發現珍奇事物的本領" });
  assert.deepEqual(core.parseAddWordsLine("  truck 卡車  "), { w: "truck", m: "卡車" });
  assert.equal(core.parseAddWordsLine(""), null);
  assert.equal(core.parseAddWordsLine("123"), null);
  assert.equal(core.parseAddWordsLine("人之初"), null);
});

/* ---- 数据进化：轨迹挑选最佳保留率 ---- */
test("fsrsPickRetention: 确定性 + 遗忘多的孩子选出更低保留率", () => {
  // 遗忘型用户：know 后很快 forget，反复回炉
  const forgetful = [];
  let t = 0;
  for (let i = 0; i < 8; i++) {
    forgetful.push({ type: "know", w: 1, rating: 3, t });
    t += 86400000;
    forgetful.push({ type: "forget", w: 1, rating: 1, relapseMs: 600000, t });
    t += 600000;
    forgetful.push({ type: "remember", w: 1, rating: 3, t });
    t += 86400000;
  }
  const r1 = core.fsrsPickRetention(forgetful, t);
  const r1b = core.fsrsPickRetention(forgetful, t);
  assert.deepEqual(r1, r1b, "确定性");
  assert.ok(r1.retention !== null, "样本足够时给出结果");
  // 稳定型用户：持续记得 → 高保留率更优
  const steady = [];
  let t2 = 0;
  for (let i = 0; i < 8; i++) {
    steady.push({ type: "know", w: 1, rating: 3, t: t2 });
    t2 += 86400000;
    steady.push({ type: "remember", w: 1, rating: 3, t: t2 });
    t2 += 86400000 * (i + 1);
  }
  const r2 = core.fsrsPickRetention(steady, t2);
  assert.ok(r2.retention !== null);
  assert.ok(r2.retention >= r1.retention, `稳定用户保留率应≥遗忘用户: ${r1.retention} vs ${r2.retention}`);
});

test("fsrsPickRetention: 样本不足返回 null 保留率", () => {
  const few = [{ type: "know", w: 1, rating: 3, t: 0 }];
  const r = core.fsrsPickRetention(few, 86400000);
  assert.equal(r.retention, null);
});

test("tutorDiagnosis: 回炉词优先于到期词，健康词不入选", () => {
  const t0 = 1000 * 86400000;
  const events = [
    // 词 1：know 后很快 wrong → 回炉（relearning）
    { type: "know", w: 1, rating: 3, t: t0 },
    { type: "wrong", w: 1, rating: 1, relapseMs: 600000, t: t0 + 86400000 },
    // 词 2：只 know 过一次 → 早已到期（due）
    { type: "know", w: 2, rating: 3, t: t0 },
    // 词 3：最近刚复习 → 健康，不应入选
    { type: "know", w: 3, rating: 3, t: t0 + 38 * 86400000 },
  ];
  const now = t0 + 40 * 86400000;
  const d = core.tutorDiagnosis(events, now);
  assert.equal(d.words.length, 2, "只有回炉+到期两词入选");
  assert.equal(d.words[0].w, 1, "回炉词排第一");
  assert.equal(d.words[0].reason, "relearning");
  assert.equal(d.words[1].w, 2, "到期词排第二");
  assert.equal(d.words[1].reason, "due");
  assert.ok(!d.words.some(x => x.w === 3), "健康词不入选");
});

test("tutorDiagnosis: 忘过多次的词优先于普通到期词", () => {
  const t0 = 1000 * 86400000;
  // 词 A：两次 lapses（know→wrong→know→wrong），state 回炉
  const events = [
    { type: "know", w: 1, rating: 3, t: t0 },
    { type: "wrong", w: 1, rating: 1, relapseMs: 600000, t: t0 + 86400000 },
    { type: "know", w: 1, rating: 3, t: t0 + 2 * 86400000 },
    { type: "wrong", w: 1, rating: 1, relapseMs: 600000, t: t0 + 3 * 86400000 },
    // 词 B：仅到期
    { type: "know", w: 2, rating: 3, t: t0 },
  ];
  const now = t0 + 40 * 86400000;
  const d = core.tutorDiagnosis(events, now);
  assert.equal(d.words[0].w, 1);
  assert.ok(d.stats.relearning >= 1, "统计含回炉词数（state 3 归回炉桶）");
});

test("tutorDiagnosis: 确定性 + 空轨迹返回空", () => {
  const events = [
    { type: "know", w: 7, rating: 3, t: 86400000 },
    { type: "wrong", w: 9, rating: 1, relapseMs: 600000, t: 2 * 86400000 },
  ];
  const now = 30 * 86400000;
  const a = core.tutorDiagnosis(events, now);
  const b = core.tutorDiagnosis(events, now);
  assert.deepEqual(a, b, "同输入恒同输出");
  const empty = core.tutorDiagnosis([], now);
  assert.deepEqual(empty.words, []);
  assert.equal(empty.stats.seen, 0);
});

test("perf: tutorDiagnosis 2 万事件 < 2s", () => {
  const events = [];
  let t = 0;
  for (let i = 0; i < 20000; i++) {
    events.push({ type: i % 2 ? "know" : "wrong", w: i % 500, rating: i % 2 ? 3 : 1, relapseMs: 600000, t });
    t += 60000;
  }
  const s0 = performance.now();
  core.tutorDiagnosis(events, t);
  const ms = performance.now() - s0;
  assert.ok(ms < 2000, `tutorDiagnosis 2万事件耗时 ${ms.toFixed(0)}ms`);
});

/* ---- laze.json 场景标准（L0：schema 校验 + 首个内置 runner） ---- */
test("validateLaze: 合法场景通过，缺字段/非法 id/未知 subject 报错", () => {
  const good = {
    laze: "0.1",
    scenario: {
      id: "dse-math-quadratic-10", title: "一元二次方程 10 題", subject: "math",
      entities: { words: ["quadratic"], packs: ["dse-math"] },
      behavior: { type: "word-quiz", mode: "en2zh", difficulty: 2, count: 10 },
      conditions: { seed: 42 },
      trace: { write: false },
      storyboard: [{ step: "lecture", word: "quadratic" }, { step: "practice", count: 10 }],
    },
  };
  assert.deepEqual(core.validateLaze(good), { ok: true, errors: [] });
  const bad = JSON.parse(JSON.stringify(good));
  bad.scenario.id = "Bad ID!";
  bad.scenario.behavior = {};
  delete bad.scenario.title;
  const r = core.validateLaze(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.includes("scenario.id")), "非法 id 报错");
  assert.ok(r.errors.some(e => e.includes("title")), "缺 title 报错");
  assert.ok(r.errors.some(e => e.includes("behavior.type")), "缺 behavior.type 报错");
  assert.equal(core.validateLaze(null).ok, false);
  assert.equal(core.validateLaze({ laze: "9.9", scenario: { id: "x", title: "x", behavior: { type: "word-quiz" } } }).ok, false, "版本不匹配报错");
});

test("lazeWordQuiz: 确定性 + 选项含正确答案且不重复 + 空词表返回空", () => {
  const words = ["apple", "banana", "cherry", "dog", "elephant"].map((w, i) => ({ i, w, m: w + "釋義" }));
  const scenario = { behavior: { type: "word-quiz", mode: "en2zh", count: 6 } };
  const a = core.lazeWordQuiz(scenario, words, 42);
  const b = core.lazeWordQuiz(scenario, words, 42);
  assert.deepEqual(a, b, "同 seed 恒同题");
  assert.equal(a.length, 6);
  for (const q of a) {
    assert.ok(q.opts.includes(q.correct), "选项含正确答案");
    assert.equal(new Set(q.opts).size, q.opts.length, "选项不重复");
    assert.equal(q.opts.length, 4);
  }
  assert.deepEqual(core.lazeWordQuiz(scenario, [], 42), []);
  const z = core.lazeWordQuiz({ behavior: { type: "word-quiz", count: -3 } }, words, 1);
  assert.equal(z.length, 1, "count 钳制到 ≥1");
});

test("scenarioCompose: 组合器产物通过 validateLaze，确定性", () => {
  const opts = { id: "starter-wordquiz-1", title: "基礎詞 第 1 組", words: ["apple", "book", "cat", "dog"], count: 10, seed: 7 };
  const s1 = core.scenarioCompose(opts);
  const s2 = core.scenarioCompose(opts);
  assert.deepEqual(s1, s2, "确定性：同参数同场景");
  assert.deepEqual(core.validateLaze(s1), { ok: true, errors: [] }, "组合器产物必过校验门");
  assert.deepEqual(s1.scenario.entities.words, ["apple", "book", "cat", "dog"]);
  assert.equal(s1.scenario.behavior.count, 10);
  assert.equal(s1.scenario.conditions.seed, 7);
  assert.equal(core.validateLaze(core.scenarioCompose({})).ok, false, "空参数不过门（id 缺省仍合法，title 缺省时用 id——空 id 非法）");
});

test("wordTokens: 词素分词（最长匹配）——transformer 三词元、under 优先于 un、无词缀整词", () => {
  const t = core.wordTokens("transformer");
  assert.deepEqual(t.parts.map(p => p.text), ["trans", "form", "er"]);
  assert.deepEqual(t.parts.map(p => p.kind), ["prefix", "root", "suffix"]);
  assert.deepEqual(core.wordTokens("understand").parts.map(p => p.text), ["under", "stand"], "最长前缀 under 优先于 un");
  assert.deepEqual(core.wordTokens("unhappy").parts.map(p => p.text), ["un", "happy"]);
  assert.equal(core.wordTokens("apple").parts.length, 1, "无词缀 → 整词 1 个词元");
  assert.equal(core.wordTokens(""), null);
  assert.equal(core.wordTokens("farming landscape"), null, "多词条目不拆分");
  assert.equal(core.wordTokens("transformer").note.includes("詞元"), true, "诚实标注教学分词");
});

test("bpeMerge + piecesToDisplay: 迷你 ranks 合并 + 多字节偏移切回原文", () => {
  // 迷你词表：a+b → ab，ab+c → abc
  const ranks = { "a b": 0, "ab c": 1 };
  const parts = core.bpeMerge(["a", "b", "c"], ranks);
  assert.deepEqual(parts.map(p => p.text), ["abc"]);
  assert.deepEqual(parts.map(p => p.bytes), [3]);
  assert.deepEqual(parts.map(p => p.rank), [1], "最终片段的 token id = 最后一次合并的 rank");
  // 多字节：中文“苹果”（每字符 3 字节）按字节偏移切回
  const ch = core.piecesToDisplay("苹果", [{ bytes: 3 }, { bytes: 3 }]);
  assert.deepEqual(ch, ["苹", "果"]);
  const en = core.piecesToDisplay("transformer", [{ bytes: 5 }, { bytes: 4 }, { bytes: 2 }]);
  assert.deepEqual(en, ["trans", "form", "er"]);
  // 无合并对 → 逐字符保留
  const solo = core.bpeMerge(["x", "y"], ranks);
  assert.deepEqual(solo.map(p => p.text), ["x", "y"]);
});

test("dsePrompt: 含课题/薄弱词/验收标准，确定性（同输入恒同 prompt）", () => {
  const p = core.dsePrompt("數學（必修部分）", "一元二次方程", ["quadratic", "discriminant"]);
  assert.ok(p.includes("一元二次方程"), "含课题名");
  assert.ok(p.includes("quadratic"), "含薄弱词");
  assert.ok(p.includes("單一 HTML"), "要求单文件输出");
  assert.ok(p.includes("8 題"), "题数约定");
  assert.ok(p.includes("不依賴外部網絡"), "沙箱可运行约束");
  const p2 = core.dsePrompt("數學（必修部分）", "一元二次方程", ["quadratic", "discriminant"]);
  assert.equal(p, p2, "确定性：同输入恒同 prompt");
  const p3 = core.dsePrompt("數學（必修部分）", "概率", []);
  assert.ok(p3.includes("概率"));
  assert.ok(!p3.includes("quadratic"), "无薄弱词时不注入");
  assert.ok(p3.includes("暫無記錄"), "空诊断有诚实说明");
});

/* ---- 自适应内核：错误模式分类 + 薄弱单元诊断（docs/adaptive-learning.md） ---- */
test("classifySpellingError: 常见混淆对识别", () => {
  assert.deepEqual(core.classifySpellingError("recieve", "receive"), ["ie-ei"]);
  assert.deepEqual(core.classifySpellingError("appearence", "appearance"), ["ance-ence"]);
  assert.deepEqual(core.classifySpellingError("studys", "studies"), ["y-ies"]);
  assert.deepEqual(core.classifySpellingError("makeing", "making"), ["e-drop"]);
  assert.deepEqual(core.classifySpellingError("bad", "dad"), ["b-d"]);
  assert.deepEqual(core.classifySpellingError("apple", "apple"), []);
  assert.deepEqual(core.classifySpellingError("", "apple"), []);
  assert.deepEqual(core.classifySpellingError("receive", "receive"), []);
});

test("diagnoseWeaknesses: 从 wrong 事件聚合薄弱单元（确定性 + 排序）", () => {
  const wordOf = (i) => ({ 1: { w: "receive" }, 2: { w: "appearance" }, 3: { w: "studies" } }[i]);
  const events = [
    { type: "wrong", w: 1, input: "recieve", t: 1000 },
    { type: "wrong", w: 1, input: "recieve", t: 2000 },
    { type: "wrong", w: 2, input: "appearence", t: 3000 },
    { type: "wrong", w: 3, input: "studys", t: 4000 },
    { type: "know", w: 1, t: 5000 },              // 非 wrong 忽略
    { type: "wrong", w: 4, t: 6000 },             // 无 input 忽略
  ];
  const d1 = core.diagnoseWeaknesses(events, wordOf);
  const d2 = core.diagnoseWeaknesses(events, wordOf);
  assert.deepEqual(d1, d2, "确定性：同轨迹恒同诊断");
  assert.equal(d1[0].unit, "ie-ei", "次数最多的排第一");
  assert.equal(d1[0].count, 2);
  assert.deepEqual(d1[0].words, ["receive"]);
  assert.equal(d1.length, 3);
  assert.equal(d1[1].zh.includes("ance"), true, "带中文说明");
  assert.deepEqual(core.diagnoseWeaknesses([], wordOf), []);
});

test("targetWords: 按薄弱单元选词（确定性 + 匹配 + 未知单元空）", () => {
  const pool = [
    { w: "receive", m: "收到" }, { w: "believe", m: "相信" }, { w: "field", m: "田野" },
    { w: "apple", m: "蘋果" }, { w: "study", m: "學習" }, { w: "appearance", m: "外貌" },
  ];
  const a = core.targetWords("ie-ei", pool, 42, 3);
  const b = core.targetWords("ie-ei", pool, 42, 3);
  assert.deepEqual(a, b, "确定性：同 seed 恒同结果");
  assert.ok(a.length === 3 && a.every(w => /(ie|ei)/i.test(w.w)), "只选含 ie/ei 的词");
  assert.ok(a.every(w => w.w !== "apple" && w.w !== "study"), "不含不匹配词");
  const y = core.targetWords("y-ies", pool, 1, 5);
  assert.ok(y.some(w => w.w === "study"));
  assert.deepEqual(core.targetWords("no-such-unit", pool, 1, 5), []);
  assert.equal(core.targetWords("ie-ei", pool, 1, 0).length, 0, "count=0 返回空");
  assert.ok(core.targetWords("ie-ei", pool, 1, 99).length <= pool.length, "count 超池长不越界");
});

/* ---- 音素层诊断（最小对：th/s、i/ee、l/r…） ---- */
test("phonemeConfusion: 最小对音素混淆识别", () => {
  assert.equal(core.phonemeConfusion("/ʃɪp/", "/ʃiːp/"), "i-ee");
  assert.equal(core.phonemeConfusion("/θɪŋk/", "/sɪŋk/"), "th-s");
  assert.equal(core.phonemeConfusion("/laɪt/", "/raɪt/"), "l-r");
  assert.equal(core.phonemeConfusion("/ˈveri/", "/ˈweri/"), "v-w");
  assert.equal(core.phonemeConfusion("/sɪn/", "/sɪŋ/"), "n-ng");
  assert.equal(core.phonemeConfusion("/æpl/", "/æpl/"), null, "相同无混淆");
});

test("diagnosePhonemeWeaknesses: 从 chosen 错误聚合音素薄弱单元", () => {
  const wordOf = (i) => ({ 1: { w: "ship", p: "/ʃɪp/" }, 2: { w: "sheep", p: "/ʃiːp/" }, 3: { w: "think", p: "/θɪŋk/" }, 4: { w: "sink", p: "/sɪŋk/" } }[i]);
  const events = [
    { type: "wrong", w: 1, chosen: 2, t: 1000 },  // ship 听成 sheep → i-ee
    { type: "wrong", w: 1, chosen: 2, t: 2000 },  // 再错
    { type: "wrong", w: 3, chosen: 4, t: 3000 },  // think 听成 sink → th-s
  ];
  const d = core.diagnosePhonemeWeaknesses(events, wordOf);
  assert.equal(d[0].unit, "i-ee");
  assert.equal(d[0].count, 2);
  assert.deepEqual(d[0].words, ["ship"]);
  assert.equal(d[1].unit, "th-s");
  assert.deepEqual(core.diagnosePhonemeWeaknesses([], wordOf), []);
});

/* ---- 数学易错题分类与诊断（领域知识：进位/借位/口诀/余数/公式） ---- */
test("classifyMathError: 运算类型归因", () => {
  assert.equal(core.classifyMathError("add", 2), "carry-add");
  assert.equal(core.classifyMathError("add", 3), "carry-add");
  assert.equal(core.classifyMathError("sub", 2), "borrow-sub");
  assert.equal(core.classifyMathError("mul", 1), "times-table");
  assert.equal(core.classifyMathError("mul", 2), "big-mul");
  assert.equal(core.classifyMathError("div", 1), "division");
  assert.equal(core.classifyMathError("div", 3), "division");
  assert.equal(core.classifyMathError("formula", 1), "formula");
  assert.equal(core.classifyMathError("add", 1), "basic-arith");
});

test("diagnoseMathWeaknesses: 从 mathwrong 事件聚合", () => {
  const events = [
    { type: "mathwrong", op: "add", difficulty: 2, q: "37+58=？", t: 1000 },
    { type: "mathwrong", op: "add", difficulty: 2, q: "45+28=？", t: 2000 },
    { type: "mathwrong", op: "mul", difficulty: 1, q: "6×7=？", t: 3000 },
    { type: "mathwrong", op: "formula", difficulty: 1, q: "三角形面積", t: 4000 },
    { type: "know", w: 1, t: 5000 },
  ];
  const d = core.diagnoseMathWeaknesses(events);
  assert.equal(d[0].unit, "carry-add");
  assert.equal(d[0].count, 2);
  assert.equal(d[1].unit, "times-table");
  assert.equal(d.length, 3);
  assert.deepEqual(core.diagnoseMathWeaknesses([]), []);
});

/* ---- 数学概念题生成器（百分比/多项式/坐标旋转——Chloe 的薄弱点） ---- */
test("generatePercentage: 确定性 + 答案为整数 + 在选项中", () => {
  const a = core.generatePercentage(42), b = core.generatePercentage(42);
  assert.deepEqual(a, b, "确定性");
  assert.ok(Number.isInteger(a.a), "答案为整数");
  assert.ok(a.opts.includes(a.a), "答案在选项中");
  assert.equal(a.opts.length, 4);
  assert.ok(a.opts.every(o => typeof o === "number"));
});

test("generatePolynomial: 确定性 + 答案字符串 + 选项含答案", () => {
  const a = core.generatePolynomial(7), b = core.generatePolynomial(7);
  assert.deepEqual(a, b, "确定性");
  assert.ok(typeof a.a === "string" && a.a.includes("x"), "答案为含 x 的字符串");
  assert.ok(a.opts.includes(a.a), "选项含答案");
  assert.equal(a.opts.length, 4);
});

test("generateCoordinate: 确定性 + 坐标字符串 + 选项含答案", () => {
  const a = core.generateCoordinate(3), b = core.generateCoordinate(3);
  assert.deepEqual(a, b, "确定性");
  assert.ok(/^\(.+\)$/.test(a.a), "答案为坐标字符串");
  assert.ok(a.opts.includes(a.a));
  assert.equal(a.opts.length, 4);
});

test("classifyMathError: 概念题归因（percent/poly/coord）", () => {
  assert.equal(core.classifyMathError("percent", 1), "percent");
  assert.equal(core.classifyMathError("poly", 1), "polynomial");
  assert.equal(core.classifyMathError("coord", 1), "coordinate");
});
