#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从香港教育局官方英汉辞汇表生成学科 pack 词库（离线可复现）。

数据源（已 vendor 到 data/raw/，均取自教育局公开网页，教育用途 + 署名）：
- 数学：數學科常用英漢辭匯（二零二零年七月八日版）Glossary20200708.pdf
- 科学：科學科(S.1-S.3) SciGlossary_2017.pdf、生物 Biology_Glossary_2020.pdf、
        物理 PhyGlossary_2020.pdf、化學 glossary_chem2007.pdf
- 地理：中學地理科常用英漢辭彙（二零二五）Geography_Glossary_Final_Version_July_2025.pdf

用法：python3 scripts/build-edb.py
依赖：pypdf（pip install pypdf）；raw 文件缺失时打印下载指引。
输出：data/packs/{math,science,geography}/words.json
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")

SOURCES = {
    "math": {
        "files": ["math_glossary_2020.pdf"],
        "c": "math",
    },
    "science": {
        "files": ["SciGlossary_2017.pdf", "Biology_Glossary_2020.pdf",
                  "PhyGlossary_2020.pdf", "glossary_chem2007.pdf"],
        "c": "science",
    },
    "geography": {
        "files": ["geography_glossary_2025.pdf"],
        "c": "geography",
    },
}

LINE_RE = re.compile(
    r"^([A-Za-z][A-Za-z0-9\-\'\/\(\)\[\]\., ×+=\^ ]{1,70}?)[ \t]+([一-鿿][一-鿿0-9，。、；（）()\[\]\-×· ]{0,80})$"
)


def clean_word(en):
    """修复多列 PDF 提取的断裂残片（NN/XX 列头、n th→nth、尾字母重复、双空格、义项编号）。"""
    en = re.sub(r"^(NN|XX|e\.g\.|cf\.|i\.e\.)\s+", "", en)
    en = en.replace("n th", "nth").replace("x- ", "x-")
    en = re.sub(r"\s+\(\d+\)$", "", en)  # capital (1) → capital
    en = re.sub(r"\s+([nx])$", lambda m: "" if m.group(1) in en[: len(en) - 2] else m.group(0), en)
    en = re.sub(r"\s+\-", "-", en)
    return re.sub(r"\s+", " ", en).strip()


def parse_pdf(path):
    try:
        import pypdf
    except ImportError:
        print("依赖缺失：pip install pypdf")
        sys.exit(1)
    reader = pypdf.PdfReader(path)
    raw = []
    for page in reader.pages:
        raw.extend((page.extract_text() or "").split("\n"))
    # 列断裂：无 CJK 的行拼到下一行
    lines = []
    i = 0
    while i < len(raw):
        ln = raw[i].strip()
        if ln and len(ln) > 2 and not re.search(r"[一-鿿]", ln) and i + 1 < len(raw):
            lines.append(ln + " " + raw[i + 1].strip())
            i += 2
        else:
            lines.append(ln)
            i += 1
    words, seen = [], set()
    for ln in lines:
        if not ln:
            continue
        m = LINE_RE.match(ln)
        if not m:
            continue
        en = clean_word(m.group(1))
        zh = re.sub(r"[，,]?\(\d+\)\s*", "；", m.group(2).strip()).strip("； ")
        zh = re.sub(r"；+", "；", zh)
        if not en or not zh:
            continue
        key = en.lower()
        if key in seen:
            continue
        seen.add(key)
        words.append({"word": en, "phonetic": "", "pos": "n.", "meaning": zh, "c": None})
    return words


def main():
    for subject, spec in SOURCES.items():
        out = []
        seen = set()
        for fname in spec["files"]:
            path = os.path.join(RAW, fname)
            if not os.path.exists(path):
                print(f"跳过 {subject}：缺少 data/raw/{fname}（见文件头下载指引）")
                continue
            parsed = parse_pdf(path)
            for w in parsed:
                if w["word"].lower() in seen:
                    continue
                seen.add(w["word"].lower())
                w["c"] = spec["c"]
                out.append(w)
        if not out:
            continue
        out_dir = os.path.join(ROOT, "data", "packs", subject)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "words.json"), "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=0)
        print(f"{subject}: {len(out)} words")
        for w in out[:3]:
            print(f"   {w['word']} → {w['meaning']}")


if __name__ == "__main__":
    main()
