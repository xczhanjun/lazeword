#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pack 脚手架：生成符合 docs/pack-authoring.md 契约的目录骨架。

用法：python3 scripts/new-pack.py <pack-id> <中文名>
之后：填 words.json → 补 ATTRIBUTIONS.md 署名 → python3 scripts/check-packs.py → node scripts/build.mjs
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    pid, zh = sys.argv[1], sys.argv[2]
    assert all(c.isalnum() or c in "-_" for c in pid) and pid.isascii(), "pack-id 只能含小写字母/数字/连字符"
    pid = pid.lower()
    pdir = os.path.join(ROOT, "data", "packs", pid)
    if os.path.exists(pdir):
        print(f"{pdir} 已存在，跳过")
        sys.exit(1)
    os.makedirs(os.path.join(pdir, "modules"), exist_ok=True)
    manifest = {
        "id": pid, "order": 90,
        "scenes": [{"key": pid, "zh": zh}],
        "quizTypes": [], "refSections": [], "modules": [],
    }
    words = [{"word": "example", "phonetic": "/ɪɡˈzɑːmpl/", "pos": "n.", "meaning": "例子", "c": pid}]
    with open(os.path.join(pdir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    with open(os.path.join(pdir, "words.json"), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    print(f"已生成 data/packs/{pid}/（manifest.json + words.json）")
    print("下一步：1) 替换示例词条 2) ATTRIBUTIONS.md 加署名 3) python3 scripts/check-packs.py")


if __name__ == "__main__":
    main()
