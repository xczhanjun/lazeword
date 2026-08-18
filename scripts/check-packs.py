#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pack 质量门：按 docs/pack-authoring.md 契约校验全部 packs（构建前调用）。

用法：python3 scripts/check-packs.py   # 失败退出码非 0
检查项：
  1. manifest 必需字段（id/order）
  2. words.json 词条字段合法（word/meaning 非空、长度上限）
  3. c 分类 key 与 manifest scenes 一致（或复用全局已知 key）
  4. 全库 word 大小写去重
  5. 每个 pack 在 ATTRIBUTIONS.md 有署名记录（善意 = 署名，机器可查）
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS_DIR = os.path.join(ROOT, "data", "packs")
KNOWN_KEYS = {"nouns", "verbs", "adjectives", "adverbs_prepositions", "pronouns_conjunctions",
              "daily_life", "time_numbers", "food_drink", "body_health", "family_relationships",
              "clothing_accessories", "weather_nature", "transportation_travel", "jobs_occupations",
              "math", "science", "campus", "ket", "pet", "fce", "custom"}

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    if not os.path.isdir(PACKS_DIR):
        print("no packs dir; skip")
        return
    attrib = open(os.path.join(ROOT, "ATTRIBUTIONS.md"), encoding="utf-8").read()
    seen_words = {}   # 全库：跨包重复仅提示（构建时按 order 去重，重复词并入 cs 多场景引用）
    packs = sorted(d for d in os.listdir(PACKS_DIR) if os.path.isdir(os.path.join(PACKS_DIR, d)))
    # 预扫描全部 pack 场景 key：cs 跨包引用允许指向其他 pack 的场景
    all_scene_keys = set(KNOWN_KEYS)
    for pid in packs:
        mf_path = os.path.join(PACKS_DIR, pid, "manifest.json")
        if os.path.exists(mf_path):
            mf = load_json(mf_path)
            all_scene_keys.update(s.get("key") for s in mf.get("scenes", []) if s.get("key"))
    for pid in packs:
        pdir = os.path.join(PACKS_DIR, pid)
        mf_path = os.path.join(pdir, "manifest.json")
        if not os.path.exists(mf_path):
            err(f"{pid}: 缺 manifest.json")
            continue
        manifest = load_json(mf_path)
        if manifest.get("id") != pid:
            err(f"{pid}: manifest.id 与目录名不一致")
        if not isinstance(manifest.get("order"), int):
            err(f"{pid}: manifest.order 缺失或非整数")
        scene_keys = {s.get("key") for s in manifest.get("scenes", [])}
        # 署名检查
        if pid not in attrib:
            err(f"{pid}: ATTRIBUTIONS.md 未记录该 pack 的出处（善意 = 署名）")
        # 词条校验
        files = manifest.get("files") or ["words.json"]
        for fn in files:
            fp = os.path.join(pdir, fn)
            if not os.path.exists(fp):
                err(f"{pid}: 词条文件 {fn} 缺失")
                continue
            words = load_json(fp)
            if not isinstance(words, list):
                err(f"{pid}/{fn}: 应为数组")
                continue
            for i, w in enumerate(words):
                tag = f"{pid}/{fn}[{i}]"
                if not isinstance(w, dict):
                    err(f"{tag}: 非对象")
                    continue
                word = (w.get("word") or "").strip()
                meaning = (w.get("meaning") or "").strip()
                c = w.get("c")
                if not word:
                    err(f"{tag}: word 为空")
                elif len(word) > 64:
                    err(f"{tag}: word 超 64 字符")
                if not meaning:
                    err(f"{tag}: meaning 为空")
                elif len(meaning) > 80:
                    err(f"{tag}: meaning 超 80 字符")
                if c is None or (c not in scene_keys and c not in KNOWN_KEYS):
                    err(f"{tag}: c={c!r} 不在 manifest.scenes 且非全局已知 key")
                cs = w.get("cs")
                if cs is not None:
                    if not isinstance(cs, list) or not all(isinstance(x, str) for x in cs):
                        err(f"{tag}: cs 须为字符串数组")
                    else:
                        for x in cs:
                            if x not in all_scene_keys:
                                err(f"{tag}: cs 引用未知场景 {x!r}")
                lw = word.lower()
                if lw in seen_words:
                    warn(f"{tag}: 与 {seen_words[lw]} 跨包重复（构建时按 order 去重，属预期）")
                else:
                    seen_words[lw] = tag

    if errors:
        print(f"pack 校验失败（{len(errors)} 项）：")
        for e in errors[:30]:
            print("  ✗ " + e)
        sys.exit(1)
    print(f"pack 校验通过：{len(packs)} packs, {len(seen_words)} 首现词条"
          + (f"（{len(warnings)} 条跨包重复，构建时去重）" if warnings else ""))


if __name__ == "__main__":
    main()
