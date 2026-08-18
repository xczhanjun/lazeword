/* lazeword 数学 pack：公式表渲染 + 公式代入练习生成器（自编，确定性）。 */
export function renderMathFormulas(q, hide) {
  const groups = [];
  for (const group of PACKS.formulas || []) {
    const items = group.items.filter(it => !q
      || (it.name + it.formula + (it.note || "")).toLowerCase().includes(q));
    if (!items.length) continue;
    groups.push(`<div class="ref-group"><h4 class="ref-h">${escapeHtml(group.g)}</h4>`);
    for (const it of items) {
      groups.push(`<div class="ref-card formula-row ${hide ? "hide" : ""}">
        <div class="f-name">${escapeHtml(it.name)}</div>
        <div class="f-formula">${escapeHtml(it.formula)}</div>${it.note ? `<div class="f-note dim">${escapeHtml(it.note)}</div>` : ""}
      </div>`);
    }
    groups.push(`</div>`);
  }
  return groups.join("") || `<div class="empty-note">沒有匹配的公式</div>`;
}
PACK_REF_RENDER["math-formulas"] = renderMathFormulas;

// 数值代入题：全部为整数答案（三角形面积/长方形周长/勾股/梯形/平均数）
export function generateFormulaQuestion(seed = 0) {
  const rng = mulberry32(seed);
  const rint = (lo, hi) => lo + ((rng() * (hi - lo + 1)) | 0);
  const kinds = [
    () => { const b = rint(2, 10) * 2, h = rint(2, 9); return { q: `三角形面積：底 = ${b}，高 = ${h}，面積 = ？`, a: b * h / 2 }; },
    () => { const l = rint(3, 14), w2 = rint(2, 11); return { q: `長方形周長：長 = ${l}，闊 = ${w2}，周長 = ？`, a: 2 * (l + w2) }; },
    () => { const k = rint(1, 5); const [x, y, z] = [3 * k, 4 * k, 5 * k]; return { q: `直角三角形：兩直角邊 = ${x} 和 ${y}，斜邊 = ？`, a: z }; },
    () => { const a2 = rint(2, 13) * 2, b2 = rint(2, 13) * 2, h = rint(2, 8); return { q: `梯形面積：上底 = ${a2}，下底 = ${b2}，高 = ${h}，面積 = ？`, a: (a2 + b2) * h / 2 }; },
    () => { const m = rint(5, 15); const d1 = rint(1, 4), d2 = rint(1, 4);
      const xs = [m + d1, m - d1, m + d2, m - d2]; return { q: `平均數：${xs.join("、")} 的平均 = ？`, a: m }; },
  ];
  const base = kinds[(rng() * kinds.length) | 0]();
  const opts = packMathUniqueOpts(base.a, rng);
  return { q: base.q, a: base.a, opts };
}
