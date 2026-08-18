#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 Oxford 5000 JSON 生成 KET/PET/FCE 词表（含繁体中文释义，经 DeepSeek 批量翻译）。

用法：python3 scripts/build-oxford.py
依赖：环境变量 DEEPSEEK_API_KEY；Oxford 数据文件 data/oxford5000.json（先下载）。
支持断点续传：部分结果写入 data/oxford_exam.partial.json。
"""
import json
import os
import ssl
import sys
import time
import urllib.request

SSL_CTX = ssl._create_unverified_context()  # 本地构建脚本：跳过证书验证

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OXFORD = os.path.join(ROOT, "data", "oxford5000.json")
PARTIAL = os.path.join(ROOT, "data", "oxford_exam.partial.json")
OUT = os.path.join(ROOT, "data", "oxford_exam.json")
BATCH = 40

KEY = os.environ.get("DEEPSEEK_API_KEY", "").strip()
if not KEY:
    print("DEEPSEEK_API_KEY not set")
    sys.exit(1)

POS_MAP = {
    "noun": "n.", "verb": "v.", "adjective": "adj.", "adverb": "adv.",
    "preposition": "prep.", "pronoun": "pron.", "conjunction": "conj.",
    "determiner": "det.", "phrasal verb": "phr.v.", "modal verb": "modal v.",
    "number": "num.", "exclamation": "interj.", "idiom": "phr.",
    "indefinite article": "art.", "definite article": "art.", "auxiliary verb": "aux.v.",
}

def load_oxford():
    d = json.load(open(OXFORD, encoding="utf-8"))
    out = {}
    for item in d:
        v = item.get("value", {})
        w = (v.get("word") or "").strip()
        lv = (v.get("level") or "").strip()
        if not w or not any(c.isalpha() for c in w):
            continue
        ph = v.get("phonetics") or {}
        ipa = (ph.get("us") or ph.get("uk") or "").strip()
        out.setdefault(w.lower(), {
            "word": w, "level": lv,
            "phonetic": ipa,
            "pos": POS_MAP.get((v.get("type") or "").strip(), "n."),
        })
    return out

def load_existing():
    s = set()
    for f in ["vocabineer_947_words.json", "hk_subject_words.json", "hk_campus.json"]:
        for e in json.load(open(os.path.join(ROOT, "data", f), encoding="utf-8")):
            s.add(e["word"].lower())
    return s

def load_partial():
    if os.path.exists(PARTIAL):
        return json.load(open(PARTIAL, encoding="utf-8"))
    return {}

def translate(batch_items):
    """batch_items: list of dicts {word, level, pos}. Returns {word_lower: meaning}."""
    lines = [f"{i+1}. {it['word']} ({it['pos'].rstrip('.')}, CEFR {it['level']})"
             for i, it in enumerate(batch_items)]
    prompt = (
        "Translate the following English words into Traditional Chinese (Hong Kong school usage, 繁體中文). "
        "Each meaning must be SHORT (2-8 characters), suitable for primary/secondary students. "
        "Return ONLY a JSON array of strings, same order as the list, each string is the Chinese meaning only (no word, no punctuation).\n\n"
        + "\n".join(lines)
    )
    body = json.dumps({
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 2000,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.deepseek.com/chat/completions",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY},
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=90, context=SSL_CTX) as r:
                data = json.loads(r.read())
            content = data["choices"][0]["message"]["content"]
            content = content.strip()
            if content.startswith("```"):
                content = content.strip("`").lstrip("json").strip()
            arr = json.loads(content)
            assert len(arr) == len(batch_items), f"count mismatch {len(arr)} vs {len(batch_items)}"
            return {it["word"].lower(): str(m).strip("。. ").rstrip("。. ") for it, m in zip(batch_items, arr)}
        except Exception as e:
            print(f"  attempt {attempt+1} failed: {e}")
            time.sleep(4)
    raise RuntimeError("batch failed after retries")

def main():
    ox = load_oxford()
    existing = load_existing()
    partial = load_partial()
    done = set(partial.keys())

    groups = {"ket": ("A1", "A2"), "pet": ("B1",), "fce": ("B2",)}
    todo = []
    for w, v in ox.items():
        if w in existing or w in done:
            continue
        for g, lvs in groups.items():
            if v["level"] in lvs:
                todo.append({"word": v["word"], "level": v["level"],
                             "pos": v["pos"], "phonetic": v["phonetic"], "c": g})
                break
    print(f"todo: {len(todo)} words")

    for i in range(0, len(todo), BATCH):
        batch = todo[i:i + BATCH]
        print(f"batch {i // BATCH + 1}/{(len(todo) - 1) // BATCH + 1} ({len(batch)} words)…", flush=True)
        meanings = translate(batch)
        for it in batch:
            m = meanings.get(it["word"].lower(), "")
            if m:
                partial[it["word"].lower()] = {
                    "word": it["word"], "phonetic": it["phonetic"],
                    "pos": it["pos"], "meaning": m, "c": it["c"],
                }
        json.dump(partial, open(PARTIAL, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
        time.sleep(1)

    final = [v for v in partial.values()]
    json.dump(final, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"done: {len(final)} words -> {OUT}")

if __name__ == "__main__":
    main()
