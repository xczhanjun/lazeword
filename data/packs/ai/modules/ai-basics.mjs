/* AI 的基因與元素：少数基本件 × 规律 = 组合威力——给孩子建立 AI 底层 sense 的启发页。
 * 诚实声明：我们不知道 AI 的「基因学」和「元素周期表」是什么——这一页是启发，不是答案。 */
export function renderAiBasics(q, hide) {
  const rows = [
    { n: "4 種", t: "DNA 鹼基", d: "A / T / G / C 四種鹼基的排列 → 地球上的一切生命", c: "base pair" },
    { n: "118 種", t: "化學元素", d: "按原子序數與電子排布分佈 → 世界上的一切物質；看似很多，其實極有規律", c: "element" },
    { n: "≈5 萬", t: "詞元（token）", d: "按頻率分佈（Zipf 定律）→ 人類的一切表達；你背的單詞就是它們", c: "token" },
    { n: "幾種", t: "基本工具", d: "讀檔案 / 寫檔案 / 執行命令 / 思考——pi 的簡潔、dsh 的一切皆插件：把複雜度用內建與數學的方法解決", c: "tool" },
  ];
  return `
  <div class="insight-box">
    <h4 class="ref-h">🧬 AI 的基因與元素</h4>
    <div class="dim" style="font-size:13px;line-height:1.8;margin-bottom:10px">
      <b>大人和孩子在 AI 面前是一樣的</b>——就像弓箭手和長槍手面對火槍：都是新手，都在同一起跑線。
      所以不慌，慢慢建立對 AI 底層的 sense：大模型不是魔法，是<b>幾種基本件，按規律組合出的威力</b>。
      我們還不知道 AI 的「基因學」和「元素週期表」到底是什麼——這一頁是啟發，不是答案。</div>
    ${rows.map(r => `
      <div class="ref-card" style="display:flex;gap:12px;align-items:baseline;padding:10px 14px;margin-bottom:8px;flex-wrap:wrap">
        <span class="b" style="font-size:14px;min-width:64px">${escapeHtml(r.n)}</span>
        <span class="en" style="color:var(--accent-ink);font-size:14px;font-weight:700">${escapeHtml(r.t)}</span>
        <span class="dim" style="font-size:13px">${escapeHtml(r.d)}</span>
      </div>`).join("")}
  </div>
  <div class="insight-box">
    <h4 class="ref-h">📜 兩千多年前，中國人已經說過了</h4>
    <div style="font-size:16px;font-family:var(--serif);line-height:1.9;padding:6px 0">
      「道生一，一生二，二生三，三生萬物。」<span class="dim" style="font-size:12px">——《道德經》第四十二章</span>
    </div>
    <div class="dim" style="font-size:13px;line-height:1.8">組合湧現的思想不是新東西：四個鹼基生萬物、百餘種元素生萬物、幾種工具生萬物——都是同一個形狀。
    中華文化 pack 裡背過的經典，和今天 AI 的底層原理，隔著兩千五百年在互相點頭。</div>
  </div>
  <div class="insight-box">
    <h4 class="ref-h">💛 為什麼還要寫「向善」</h4>
    <div class="dim" style="font-size:13px;line-height:1.8">組合威力越大，方向越重要。同樣的火藥，可以造煙花，也可以造火槍——所以我們在向善筆記裡練習
    「想用 AI 做的好事」。而 lazeword 本身也是一場實驗：軌跡是實驗賬本，你每天的一點進步，都是這個實驗的一筆記錄。</div>
  </div>`;
}
PACK_REF_RENDER["ai-basics"] = renderAiBasics;
