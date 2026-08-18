/* lazeword AI pack：论文参考页 + 安全与向善守则（原创编选，引文出处见 ATTRIBUTIONS）。 */
export function renderAiPapers(q, hide) {
  const groups = [];
  for (const group of PACKS.papers || []) {
    const items = group.items.filter(it => !q
      || (it.title + " " + it.authors + " " + it.zh).toLowerCase().includes(q));
    if (!items.length) continue;
    groups.push(`<div class="ref-group"><h4 class="ref-h">${escapeHtml(group.g)}</h4>`);
    for (const it of items) {
      const wordChips = (it.words || []).map(w => {
        const entry = WORDS.find(x => x.w.toLowerCase() === w.toLowerCase());
        return entry ? `<button class="people-chip" data-open="${entry.i}">${escapeHtml(entry.w)}</button>` : "";
      }).join("");
      groups.push(`<div class="ref-card paper-row ${hide ? "hide" : ""}">
        <div class="f-name">${it.url ? `<a href="${escapeHtml(it.url)}" target="_blank" rel="noopener">${escapeHtml(it.title)}</a>` : escapeHtml(it.title)}</div>
        <div class="f-note">${escapeHtml(it.authors)} · ${it.year} · ${escapeHtml(it.venue)}</div>
        <div class="pc-m" style="font-size:13px;margin:4px 0 6px">${escapeHtml(it.zh)}</div>
        <div class="people-words">${wordChips}</div>
      </div>`);
    }
    groups.push(`</div>`);
  }
  return groups.join("") || `<div class="empty-note">沒有匹配的論文</div>`;
}
PACK_REF_RENDER["ai-papers"] = renderAiPapers;

// AI 安全与向善：给孩子的话（可验证的怀疑 + 具体行动）
export function renderAiSafety(q, hide) {
  const sections = [
    { t: "🛡️ 保護自己（四條守則）", items: [
      ["隱私", "不要把自己的全名、地址、照片告訴聊天機器人——AI 會記住你說的每一句話。"],
      ["辨別真假", "AI 可以合成以假亂真的影片和聲音（deepfake）。看到「太神奇」的內容，先懷疑，再求證。"],
      ["不沉迷", "AI 再會聊天，也代替不了朋友、運動和睡覺。螢幕時間要自己管理。"],
      ["查證", "AI 有時會一本正經地編造答案（幻覺）。重要的事，問它「你的來源是什麼？」"],
    ]},
    { t: "🌱 向善的途徑（四個可以馬上做的）", items: [
      ["開源", "把自己寫的小程式、小遊戲放到 GitHub 上公開——任何人都能檢查和改進。"],
      ["署名", "用了別人的代碼、圖片、文章，註明出處——尊重是最小的善意。"],
      ["教別人", "把學會的一個詞、一個概念講給家人聽——教是最好的學。"],
      ["提問", "對任何「權威結論」保持一個問題的距離：誰說的？我可以自己驗證嗎？"],
    ]},
    { t: "⚖️ 大人的世界也在爭論", items: [
      ["兩種善意", "有人（如 Anthropic 的 Dario Amodei）主張用制度約束最強的 AI 公司；也有人（如 LeCun）認為權力集中本身才是最大的風險。兩邊都是善意的人——分歧需要你自己思考，而不是選邊站。"],
      ["別在暗房裡", "NVIDIA 的 Jensen Huang 說：別在暗房裡搞 AI，然後告訴我它是安全的。安全的主張應該可以被任何人檢查——這就是「可驗證性」。"],
      ["我們的答案", "lazeword 的答案很小：開源、署名、離線可運行、軌跡可重放。善意不是口號，是可以被審計的行為。"],
    ]},
  ];
  const ql = (q || "").toLowerCase();
  let html = `<div class="empty-note" style="margin-bottom:10px">給孩子與家長的 AI 素養手冊：先保護自己，再向善而為。點擊詞條可看詳情。</div>`;
  for (const sec of sections) {
    const items = sec.items.filter(([k, v]) => !ql || (k + v).toLowerCase().includes(ql));
    if (!items.length) continue;
    html += `<div class="ref-group"><h4 class="ref-h">${escapeHtml(sec.t)}</h4>`;
    for (const [k, v] of items) {
      html += `<div class="ref-card safety-row ${hide ? "hide" : ""}">
        <div class="f-name">${escapeHtml(k)}</div>
        <div class="pc-m" style="font-size:13.5px;margin-top:4px;color:var(--ink-soft)">${escapeHtml(v)}</div>
      </div>`;
    }
    html += `</div>`;
  }
  return html;
}
PACK_REF_RENDER["ai-safety"] = renderAiSafety;

/* ================= 與 AI 對話（学单词的用武之地） =================
 * 孩子用学过的词与 AI 对话、提问、共创；教「可验证的怀疑」（verify 模板）。
 * 会话只记入轨迹次数（type:"chat", n:1），不记录内容——隐私。 */
let chatMessages = []; // [{role:"kid"|"ai", text}]

// 提示模板（纯函数，可测）：knownWords 注入「用我学过的词」模板，去重 ≤10
export function chatTemplate(kind, knownWords) {
  const words = (knownWords || []).filter((w, i, a) => w && a.indexOf(w) === i).slice(0, 10);
  const T = {
    describe: "Please describe ______. Use three adjectives and one example.",
    story: words.length
      ? `Write a 5-sentence story using these words: ${words.join(", ")}. Use simple sentences.`
      : "Write a 5-sentence story about ______. Use simple sentences.",
    why: "Why ______? Explain it simply, like I am ten.",
    verify: "I heard that ______. Is it true? Show me how to verify it.",
    fix: `Please fix my English: "______"`,
  };
  return T[kind] || "";
}
function aiChatTemplate(kind) {
  const input = document.getElementById("aiChatInput");
  if (!input) return;
  input.value = chatTemplate(kind, [...knownSet()].map(i => {
    const w = wordByIndex(i);
    return w ? w.w : null;
  }));
  input.focus();
}
function aiChatRenderMessages() {
  if (typeof document === "undefined") return; // node 测试环境安全
  const box = document.getElementById("aiChatMessages");
  if (!box) return;
  if (!chatMessages.length) {
    box.innerHTML = `<div class="chat-bubble ai">👋 Hi! I'm your AI study buddy. Ask me anything in English — or use a template above. Try: <b>Why is the sky blue?</b></div>`;
    return;
  }
  box.innerHTML = chatMessages.map(m => m.role === "kid"
    ? `<div class="chat-bubble kid">${escapeHtml(m.text)}</div>`
    : `<div class="chat-bubble ai">${highlightWords(m.text)}</div>`).join("");
  box.scrollTop = box.scrollHeight;
}
async function aiChatSend() {
  const input = document.getElementById("aiChatInput");
  const msg = (input && input.value || "").trim();
  if (!msg) return;
  if (msg.length > 500) { toast("訊息太長（最多 500 字元）"); return; }
  input.value = "";
  chatMessages.push({ role: "kid", text: msg });
  aiChatRenderMessages();
  // 只记次数入轨迹（学习热力图可见），不记录对话内容——隐私
  mutateUser(u => { touchActivity(u); appendTrajectory(u, "chat", { n: 1 }); });
  const key = (settings.deepseekKey || "").trim();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  const sys = "You are a friendly English teacher for Hong Kong primary school students. Answer in simple English, at most five sentences. Use short sentences and simple words. Be encouraging. Output ONLY your reply: no title, no commentary.";
  let reply = "";
  try {
    const proxy = await fetch("/api/ai-chat", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (proxy && proxy.reply) reply = proxy.reply;
    if (!reply && key) {
      const d = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: sys }, { role: "user", content: msg }],
          temperature: 0.8, max_tokens: 500,
        }),
      });
      if (d.ok) {
        const j = await d.json();
        reply = j && j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : "";
      }
    }
  } catch (e) { /* 网络错误 → 下面统一提示 */ }
  clearTimeout(timer);
  chatMessages.push({ role: "ai", text: reply || "（暫時聯繫不上 AI：請檢查網絡，或在設置裡填入 DeepSeek key / 部署 Worker。）" });
  aiChatRenderMessages();
}
export function renderAiChat(q, hide) {
  const hasKey = !!(settings && settings.deepseekKey && settings.deepseekKey.trim());
  setTimeout(aiChatRenderMessages, 0); // innerHTML 注入后渲染消息
  return `
  <div class="chat-teach">
    <h4 class="ref-h">✍️ 怎麼和 AI 說清楚？四要素</h4>
    <div class="chips">
      <span class="chip">角色：你是一位老師…</span>
      <span class="chip">任務：做什麼</span>
      <span class="chip">細節：幾句/多長</span>
      <span class="chip">例子：示範想要的樣子</span>
    </div>
    ${hasKey ? "" : `<div class="empty-note" style="margin:8px 0">還沒設定 DeepSeek key：在設置填入（或部署 Worker）後即可對話。現在可以先練習寫提示。</div>`}
  </div>
  <div class="chat-tpls">
    <button class="btn sm" onclick="aiChatTemplate('describe')">🎨 描述</button>
    <button class="btn sm" onclick="aiChatTemplate('story')">📖 用我學過的詞講故事</button>
    <button class="btn sm" onclick="aiChatTemplate('why')">❓ 問為什麼</button>
    <button class="btn sm" onclick="aiChatTemplate('verify')">🔍 檢查說法</button>
    <button class="btn sm" onclick="aiChatTemplate('fix')">✍️ 幫我改句子</button>
  </div>
  <div class="chat-msgs" id="aiChatMessages"></div>
  <div class="chat-input-row">
    <input class="search" id="aiChatInput" placeholder="用英文問 AI 任何問題…（先用上面的模板試試）" onkeydown="if(event.key==='Enter')aiChatSend()">
    <button class="btn primary sm" onclick="aiChatSend()">發送</button>
  </div>`;
}
PACK_REF_RENDER["ai-chat"] = renderAiChat;

/* ---- 向善筆記：写下想用 AI 做的好事 → 轨迹 goodnote 事件（家长可查）→ 与导师探讨 ---- */
const GOOD_CHAT_PROMPT = [
  "你是一位「向善導師」，和一個香港小學生討論如何用 AI 做好事。",
  "回應用繁體中文，最多五句，語氣溫暖、鼓勵。",
  "先肯定孩子的想法，再問一個有啟發性的問題，引導他思考。",
  "只輸出你的回應。",
].join(" ");
const GOOD_STARTERS = [
  "我想用 AI 幫助生病的人",
  "我想用 AI 保護動物和環境",
  "怎麼才能相信 AI 說的話？",
  "如果有一天我想關掉一直陪我的 AI，這是錯的嗎？",
];
let GOOD_NOTES = [];
export function renderAiGood(q, hide) {
  setTimeout(() => { const box = document.getElementById("goodNotesList"); if (box) renderGoodNotes(box); }, 0);
  return `
  <div class="insight-box">
    <h4 class="ref-h">💛 向善筆記</h4>
    <div class="dim" style="font-size:13px;margin-bottom:8px">學了詞、玩了遊戲、認識了那些人之後——寫下你想用 AI 做的好事。筆記記入學習軌跡（家長在統計裡也能看到），還可以請向善導師和你探討。</div>
    <div class="chips">
      ${GOOD_STARTERS.map((s, i) => `<button class="chip" style="cursor:pointer" onclick="goodNoteStarter(${i})">${escapeHtml(s)}</button>`).join("")}
    </div>
    <textarea id="goodNoteInput" rows="3" placeholder="我想用 AI…" style="width:100%;font:inherit;font-size:14px;margin-top:10px;padding:10px 12px;border:1px solid var(--line-strong);border-radius:10px;background:var(--surface);color:var(--ink);resize:vertical"></textarea>
    <div style="margin-top:8px"><button class="btn primary sm" onclick="goodNoteSubmit()">📝 寫入筆記</button></div>
  </div>
  <div id="goodNotesList"></div>`;
}
PACK_REF_RENDER["ai-good"] = renderAiGood;

function renderGoodNotes(box) {
  GOOD_NOTES = (userData().trajectory || []).filter(e => e.type === "goodnote").slice().reverse().slice(0, 20);
  box.innerHTML = GOOD_NOTES.length
    ? GOOD_NOTES.map((n, i) => `
      <div class="insight-box" style="padding:12px 14px;margin-bottom:8px">
        <div style="font-size:15px">💛 ${escapeHtml(n.text)}</div>
        <div class="dim" style="font-size:12px;margin-top:6px">${new Date(n.t).toLocaleDateString("zh-HK")} · <button class="btn sm" onclick="goodNoteDiscuss(${i})">💬 和 AI 探討</button></div>
        <div id="goodNoteReply${i}"></div>
      </div>`).join("")
    : `<div class="empty-note">還沒有筆記——寫下第一個「想用 AI 做的好事」吧。</div>`;
}
function goodNoteStarter(i) {
  const inp = document.getElementById("goodNoteInput");
  if (inp) inp.value = GOOD_STARTERS[i] || "";
}
function goodNoteSubmit() {
  const inp = document.getElementById("goodNoteInput");
  const text = (inp ? inp.value : "").trim().slice(0, 200);
  if (!text) { toast("先寫一句話吧"); return; }
  mutateUser(u => { touchActivity(u); appendTrajectory(u, "goodnote", { text }); });
  inp.value = "";
  toast("💛 已寫入向善筆記");
  if (typeof guideEvent === "function") guideEvent("goodNote");
  const box = document.getElementById("goodNotesList");
  if (box) renderGoodNotes(box);
}
async function goodNoteDiscuss(i) {
  const note = GOOD_NOTES[i];
  const out = document.getElementById("goodNoteReply" + i);
  if (!note || !out) return;
  out.innerHTML = '<div class="dim" style="font-size:13px">🤔 導師思考中…</div>';
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  let reply = null;
  try {
    const r = await fetch("/api/ai-chat", {
      method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: note.text, mode: "good" }),
    }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (r && r.reply) reply = r.reply;
    if (!reply) {
      const key = (settings.deepseekKey || "").trim();
      if (key) {
        const d = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST", signal: ctrl.signal,
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
          body: JSON.stringify({ model: "deepseek-chat", messages: [
            { role: "system", content: GOOD_CHAT_PROMPT }, { role: "user", content: note.text },
          ], temperature: 0.8, max_tokens: 500 }),
        });
        if (d.ok) {
          const j = await d.json();
          reply = j && j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : "";
        }
      }
    }
  } catch (e) { /* 降级 */ }
  clearTimeout(t);
  out.innerHTML = reply
    ? `<div class="chat-teach" style="margin-top:8px"><b>導師：</b>${escapeHtml(reply)}</div>`
    : '<div class="dim" style="font-size:13px;margin-top:8px">（暫時聯繫不上 AI：請檢查網絡，或在設置填 DeepSeek key / 部署 Worker。）</div>';
}
