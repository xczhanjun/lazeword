#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成繁/简映射表并注入模板 /*__I18N_MAPS_BEGIN__*/…/*__I18N_MAPS_END__*/ 区域。

扫描 app/template.html 与 data/*.json 中的所有 CJK 字符，用 opencc 逐个求
繁→简 / 简→繁 映射，仅保留「发生变化」的字符，输出紧凑的 "char:char,..." 串。

修改了界面文案或词库后请重跑：python3 scripts/gen-i18n.py
依赖：pip install opencc-python-reimplemented
"""
import json
import re
import glob
import os

from opencc import OpenCC

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "app/template.html")
BEGIN = "/*__I18N_MAPS_BEGIN__*/"
END = "/*__I18N_MAPS_END__*/"

t2s_cc = OpenCC("t2s")
s2t_cc = OpenCC("s2t")

# 收集所有 CJK 字符（模板 + 词库）
texts = [open(TPL, encoding="utf-8").read()]
for f in glob.glob(os.path.join(ROOT, "data", "*.json")) + glob.glob(os.path.join(ROOT, "data", "packs", "**", "*.json"), recursive=True):
    texts.append(open(f, encoding="utf-8").read())
chars = set()
for t in texts:
    chars.update(re.findall(r"[一-鿿]", t))

t2s = []
s2t = []
for ch in sorted(chars):
    a = t2s_cc.convert(ch)
    b = s2t_cc.convert(ch)
    if a != ch:
        t2s.append(f"{ch}:{a}")
    if b != ch:
        s2t.append(f"{ch}:{b}")

block = (
    f"{BEGIN}\n"
    f'const I18N_T2S = "{",".join(t2s)}"; // 繁→简（构建时由 gen-i18n.py 生成）\n'
    f'const I18N_S2T = "{",".join(s2t)}"; // 简→繁\n'
    f"{END}"
)

s = open(TPL, encoding="utf-8").read()
if BEGIN in s and END in s:
    # 替换标记之间的区域（幂等）
    i = s.index(BEGIN)
    j = s.index(END) + len(END)
    s = s[:i] + block + s[j:]
else:
    # 清掉可能存在的旧注入（无标记的裸 const 对）
    s = re.sub(
        r"\n?const I18N_T2S = \"[^\"]*\"; // 繁→简[^\n]*\nconst I18N_S2T = \"[^\"]*\"; // 简→繁\n?",
        "\n",
        s,
    )
    assert "/*__CORE__*/" in s, "core marker missing"
    s = s.replace("/*__CORE__*/", "/*__CORE__*/\n" + block, 1)

open(TPL, "w", encoding="utf-8").write(s)
print(f"gen-i18n: {len(chars)} unique CJK chars; t2s pairs={len(t2s)}, s2t pairs={len(s2t)}")
print("injected maps between i18n markers")
