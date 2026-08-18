/* 自主研究参考页：autoresearch 循环——用英语向 AI 描述目标、让它迭代改进的方法论。
 * 概念源于 karpathy/autoresearch 谱系（webfuse-com/awesome-autoresearch，CC0-1.0，署名见 ATTRIBUTIONS.md）。 */

// Agent 进化史（数据驱动——历史前进时在此数组追加即可；事实来源：Daisy Hollman NDC 2026 演讲）
const AGENT_HISTORY = [
  { y: "2022", t: "純聊天", d: "人說一句，模型答一句，來回倒——大語言模型的原始形態。" },
  { y: "2024", t: "工具調用", d: "模型讓計算機執行一個動作，再把結果讀回來。單次調用、看結果、給反饋。" },
  { y: "2024→", t: "鏈式調用", d: "基於上一次調用的結果發起下一次調用，鏈條越拉越長。" },
  { y: "2025→", t: "Agent", d: "量變到質變——不再是「調用工具的聊天機器人」。編碼智能體把 shell、編輯、編譯、CI 一股腦交給模型；工具原始得驚人（old_string 換 new_string ≈ 把 ed 當唯一編輯器），表現卻好到不像話。" },
  { y: "2026", t: "多智能體", d: "worktree 隔離、持久身份、agent teams、/loop、auto mode——從單兵到編隊。能力曲線：50% 成功率的任務時長每 4-7 個月翻一倍（METR）。" },
  { y: "未來", t: "?", d: "曲線遲早到平台期——但等到的人和沒等的人處境完全不同。值得認真考慮它還能走一兩年。" },
];

export function renderCsResearch(q, hide) {
  const rows = [
    ["定義目標（可度量）", "goal / metric / measurable", "「寫得更好」不是目標；「測試覆蓋率到 90%」才是"],
    ["做實驗", "experiment / hypothesis", "一次只改一件事，才知道什麼有效"],
    ["評估結果", "eval / benchmark / verification", "用度量說話，不靠感覺"],
    ["保留或回退", "keep / revert", "有效就保留，無效就回退——不用捨不得"],
    ["實驗賬本（只追加）", "ledger / evidence", "每一次嘗試都記下來，可複現、可審計"],
  ];
  return `
  <div class="insight-box">
    <h4 class="ref-h">🔬 自主研究：用英語指揮 AI 超越一般人的方法</h4>
    <div class="dim" style="font-size:13px;margin-bottom:10px">autoresearch 循環五步——「If you can measure it, you can optimize it.」學會用英語把目標說清楚，AI 就會替你迭代改進。參考：<a href="https://github.com/webfuse-com/awesome-autoresearch" target="_blank" rel="noopener">awesome-autoresearch</a>（CC0-1.0）與 <a href="https://github.com/karpathy/autoresearch" target="_blank" rel="noopener">karpathy/autoresearch</a>。</div>
    ${rows.map(([zh, en, note], i) => `
      <div class="ref-card" style="display:flex;gap:12px;align-items:baseline;padding:10px 14px;margin-bottom:8px">
        <span class="b" style="font-size:14px;min-width:150px">${i + 1}. ${escapeHtml(zh)}</span>
        <span class="en" style="color:var(--accent-ink);font-size:13px">${escapeHtml(en)}</span>
        <span class="dim" style="font-size:12px">${escapeHtml(note)}</span>
      </div>`).join("")}
  </div>
  <div class="insight-box">
    <h4 class="ref-h">🧬 Agent 進化史（不斷進化的一幅圖）</h4>
    <div class="agent-timeline">
      ${AGENT_HISTORY.map(n => `
        <div class="agent-node">
          <div class="agent-dot"></div>
          <div class="at-year">${escapeHtml(n.y)}</div>
          <div class="at-title">${escapeHtml(n.t)}</div>
          <div class="at-desc">${escapeHtml(n.d)}</div>
        </div>`).join("")}
    </div>
  </div>
  <div class="insight-box">
    <h4 class="ref-h">♻️ 為什麼 lazeword 長成這樣</h4>
    <div class="dim" style="font-size:13px;line-height:1.8">研究循環和學習循環是同一個形狀：autoresearch 的「實驗賬本（append-only）」就是 lazeword 的「學習軌跡」；
    「可度量的目標」就是 FSRS 的保留率；「保留或回退」就是 know/wrong 寫回。你在用的這個程序，
    本身就是一個教你怎麼和 AI 協作的 autoresearch 系統。</div>
  </div>
  <div class="insight-box">
    <h4 class="ref-h">🧠 零開銷原則（Daisy Hollman, Anthropic）</h4>
    <div class="dim" style="font-size:13px;line-height:1.8">「用不到的東西不該佔地方」——本是用在內存和緩存上的原則，現在要用在提示詞和上下文窗口上。
    對學習也一樣：FSRS 只讓你複習「剛好該複習」的詞（零開銷），躺平模式減少注意力切換（「你的注意力，
    是這套系統裡最小的盒子」）。反饋閉環收得越緊，進步越快——比換一個更聰明的模型更有效。</div>
  </div>
  <div class="insight-box">
    <h4 class="ref-h">🗣️ 練一句英語指揮 AI</h4>
    <div class="dim" style="font-size:13px;margin-bottom:8px">用這些詞向 AI 描述一個可度量的改進目標（複製到 dsh / 任何 AI）：</div>
    <div class="dict-out" style="font-size:13px">"Measure the code coverage of this project, run the failing tests, propose one hypothesis for the biggest gap, implement it, evaluate the result, and keep or revert based on the evidence. Record everything in an append-only ledger."</div>
  </div>`;
}
PACK_REF_RENDER["cs-research"] = renderCsResearch;
