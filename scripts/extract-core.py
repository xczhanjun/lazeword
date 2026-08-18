#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""One-shot: extract pure functions from app/template.html into src/core.mjs,
and replace them in the template with a single /*__CORE__*/ marker.

cut(a, b) removes [a, b) — the end marker STAYS in the template.
"""
import re

TPL = "app/template.html"
OUT = "src/core.mjs"

s = open(TPL, encoding="utf-8").read()

def cut(a, b):
    global s
    i = s.index(a)
    j = s.index(b, i)
    block = s[i:j]
    s = s[:i] + s[j:]
    return block.rstrip()

blocks = []

# 1. AFFIXES + detectAffixes
blocks.append(cut("const AFFIXES = [", "\nconst MAX_USERS"))
# the marker goes where AFFIXES was: recompute after removals is complex,
# so instead insert the marker right BEFORE where MAX_USERS now starts.
pos = s.index("const MAX_USERS")
s = s[:pos] + "/*__CORE__*/\n" + s[pos:]

# 2. SRS constants + srsAdvance (srsReset stays in the template: it uses mutateUser)
blocks.append(cut("const SRS_INTERVALS_DAYS", "function srsReset(index)"))

# 3. IPA parsing + word syllabification (animateSpeech stays)
blocks.append(cut("const IPA_VOWELS", "function animateSpeech"))

# 4. mulberry32 (single line; keep the following line intact)
blocks.append(cut("function mulberry32(a)", "\n").rstrip("\n"))

# 5. blankWord (renderTyping stays)
blocks.append(cut("function blankWord(sentence, word)", "function renderTyping(q)"))

# 6. gradeGuess (nextQuiz stays)
blocks.append(cut("function gradeGuess(guess, target)", "function nextQuiz()"))

# 7. utils: shuffle / escapeHtml / escapeRegExp / similarity (toastTimer stays)
blocks.append(cut("function shuffle(a)", "let toastTimer"))

# sanity: no leftover pure-function definitions in template
for name in ["function ipaSyllables", "function gradeGuess", "function detectAffixes",
             "function wordSyllables", "function mulberry32", "function escapeHtml",
             "function srsAdvance", "function blankWord", "function similarity",
             "const AFFIXES", "const IPA_VOWELS"]:
    assert name not in s, f"leftover in template: {name}"

open(TPL, "w", encoding="utf-8").write(s)

body = "\n\n".join(blocks)
body = re.sub(r"^(const|function) ", r"export \1 ", body, flags=re.M)

core = """// lazeword 核心纯函数（单一事实源：App 与测试共用）。
// 构建时经 scripts/build.mjs 去 export 注入 App；测试直接 import。

""" + body + """

/* ---- 确定性学习轨迹（事件溯源：时空确定性） ---- */
export function createEventLog(seed = 0) {
  return { events: [], seed: seed | 0, seq: 0 };
}
// 追加一条不可变事件（返回新日志对象）
export function appendEvent(log, ev) {
  const e = { seq: log.seq, ...ev };
  return { events: [...log.events, e], seed: log.seed, seq: log.seq + 1 };
}
// 状态 = 折叠事件（确定性）
export function foldEvents(log, reducer, init) {
  return log.events.reduce(reducer, init);
}
// 可复现洗牌：同一 seed 得到完全相同的顺序
export function seededShuffle(arr, seed = 42) {
  const a = arr.slice();
  const rng = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
"""

open(OUT, "w", encoding="utf-8").write(core)
print("extracted", len(blocks), "blocks ->", OUT)
print("template updated with /*__CORE__*/ marker")
