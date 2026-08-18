// lazeword 核心纯函数（单一事实源：App 与测试共用）。
// 构建时经 scripts/build.mjs 去 export 注入 App；测试直接 import。

export const AFFIXES = [
  // prefixes
  { type: "前綴", affix: "un", meaning: "不、非" },
  { type: "前綴", affix: "dis", meaning: "不、相反" },
  { type: "前綴", affix: "re", meaning: "再、回" },
  { type: "前綴", affix: "in", meaning: "不、非" },
  { type: "前綴", affix: "im", meaning: "不、非" },
  { type: "前綴", affix: "pre", meaning: "在…之前" },
  { type: "前綴", affix: "anti", meaning: "反對、抗" },
  { type: "前綴", affix: "de", meaning: "相反、向下" },
  { type: "前綴", affix: "mis", meaning: "錯、壞" },
  { type: "前綴", affix: "non", meaning: "非、無" },
  { type: "前綴", affix: "sub", meaning: "在…下、次" },
  { type: "前綴", affix: "super", meaning: "超、在上" },
  { type: "前綴", affix: "inter", meaning: "在…之間" },
  { type: "前綴", affix: "trans", meaning: "跨越、轉移" },
  { type: "前綴", affix: "bi", meaning: "二、雙" },
  { type: "前綴", affix: "tri", meaning: "三" },
  { type: "前綴", affix: "mono", meaning: "單一" },
  { type: "前綴", affix: "multi", meaning: "多" },
  { type: "前綴", affix: "semi", meaning: "半" },
  { type: "前綴", affix: "auto", meaning: "自己、自動" },
  { type: "前綴", affix: "tele", meaning: "遠" },
  { type: "前綴", affix: "con", meaning: "共同、一起" },
  { type: "前綴", affix: "com", meaning: "共同、一起" },
  { type: "前綴", affix: "ex", meaning: "外、出、前任" },
  { type: "前綴", affix: "pro", meaning: "向前、支持" },
  { type: "前綴", affix: "post", meaning: "在…之後" },
  { type: "前綴", affix: "over", meaning: "過度、在上" },
  { type: "前綴", affix: "under", meaning: "不足、在下" },
  { type: "前綴", affix: "fore", meaning: "前、預先" },
  { type: "前綴", affix: "micro", meaning: "微小" },
  { type: "前綴", affix: "geo", meaning: "地球、土地" },
  // suffixes
  { type: "後綴", affix: "able", meaning: "可…的" },
  { type: "後綴", affix: "ible", meaning: "可…的" },
  { type: "後綴", affix: "ful", meaning: "充滿…的" },
  { type: "後綴", affix: "less", meaning: "無…的" },
  { type: "後綴", affix: "ly", meaning: "…地（副詞）" },
  { type: "後綴", affix: "ment", meaning: "行為/結果（名詞）" },
  { type: "後綴", affix: "ness", meaning: "狀態（名詞）" },
  { type: "後綴", affix: "tion", meaning: "行為/過程（名詞）" },
  { type: "後綴", affix: "sion", meaning: "行為/過程（名詞）" },
  { type: "後綴", affix: "ity", meaning: "狀態（名詞）" },
  { type: "後綴", affix: "ous", meaning: "有…特性的" },
  { type: "後綴", affix: "ious", meaning: "有…特性的" },
  { type: "後綴", affix: "ic", meaning: "…的（形容詞）" },
  { type: "後綴", affix: "al", meaning: "…的（形容詞）" },
  { type: "後綴", affix: "ive", meaning: "有…性質的" },
  { type: "後綴", affix: "ist", meaning: "從事…的人" },
  { type: "後綴", affix: "er", meaning: "做…的人/物" },
  { type: "後綴", affix: "or", meaning: "做…的人/物" },
  { type: "後綴", affix: "ship", meaning: "身份/狀態" },
  { type: "後綴", affix: "hood", meaning: "身份/狀態" },
  { type: "後綴", affix: "ology", meaning: "…學科" },
  { type: "後綴", affix: "ize", meaning: "使…化" },
  { type: "後綴", affix: "ify", meaning: "使…化" },
  { type: "後綴", affix: "ence", meaning: "狀態（名詞）" },
  { type: "後綴", affix: "ance", meaning: "狀態（名詞）" },
  { type: "後綴", affix: "ism", meaning: "…主義/學説" },
  { type: "後綴", affix: "en", meaning: "使變成（動詞）" },
  // roots
  { type: "詞根", affix: "aud", meaning: "聽" },
  { type: "詞根", affix: "bio", meaning: "生命" },
  { type: "詞根", affix: "chron", meaning: "時間" },
  { type: "詞根", affix: "dict", meaning: "説、斷言" },
  { type: "詞根", affix: "graph", meaning: "寫、圖" },
  { type: "詞根", affix: "phon", meaning: "聲音" },
  { type: "詞根", affix: "photo", meaning: "光" },
  { type: "詞根", affix: "port", meaning: "攜帶、運送" },
  { type: "詞根", affix: "scrib", meaning: "寫" },
  { type: "詞根", affix: "script", meaning: "寫" },
  { type: "詞根", affix: "spect", meaning: "看" },
  { type: "詞根", affix: "struct", meaning: "建造" },
  { type: "詞根", affix: "therm", meaning: "熱" },
  { type: "詞根", affix: "vis", meaning: "看" },
  { type: "詞根", affix: "vid", meaning: "看" },
  { type: "詞根", affix: "aqua", meaning: "水" },
  { type: "詞根", affix: "bene", meaning: "好" },
  { type: "詞根", affix: "cred", meaning: "相信" },
  { type: "詞根", affix: "duc", meaning: "引導" },
  { type: "詞根", affix: "duct", meaning: "引導" },
  { type: "詞根", affix: "fact", meaning: "做、製造" },
  { type: "詞根", affix: "form", meaning: "形狀" },
  { type: "詞根", affix: "fort", meaning: "力量、強" },
  { type: "詞根", affix: "fract", meaning: "打破" },
  { type: "詞根", affix: "ject", meaning: "投擲" },
  { type: "詞根", affix: "loc", meaning: "位置" },
  { type: "詞根", affix: "man", meaning: "手" },
  { type: "詞根", affix: "mit", meaning: "發送" },
  { type: "詞根", affix: "miss", meaning: "發送" },
  { type: "詞根", affix: "rupt", meaning: "打破" },
  { type: "詞根", affix: "sent", meaning: "感覺" },
  { type: "詞根", affix: "sens", meaning: "感覺" },
  { type: "詞根", affix: "tract", meaning: "拉、拽" },
  { type: "詞根", affix: "voc", meaning: "聲音、呼叫" },
];
/* Common irregular verbs: [base, past, past participle, meaning] */
export const IRREGULAR_VERBS = [
  ["be", "was/were", "been", "是"],
  ["become", "became", "become", "成為"],
  ["begin", "began", "begun", "開始"],
  ["break", "broke", "broken", "打破"],
  ["bring", "brought", "brought", "帶來"],
  ["build", "built", "built", "建造"],
  ["buy", "bought", "bought", "買"],
  ["catch", "caught", "caught", "抓住"],
  ["choose", "chose", "chosen", "選擇"],
  ["come", "came", "come", "來"],
  ["cost", "cost", "cost", "花費"],
  ["cut", "cut", "cut", "切"],
  ["do", "did", "done", "做"],
  ["draw", "drew", "drawn", "畫"],
  ["drink", "drank", "drunk", "喝"],
  ["drive", "drove", "driven", "駕駛"],
  ["eat", "ate", "eaten", "吃"],
  ["fall", "fell", "fallen", "落下"],
  ["feel", "felt", "felt", "感覺"],
  ["fight", "fought", "fought", "打架"],
  ["find", "found", "found", "找到"],
  ["fly", "flew", "flown", "飛"],
  ["forget", "forgot", "forgotten", "忘記"],
  ["forgive", "forgave", "forgiven", "原諒"],
  ["get", "got", "got/gotten", "獲得"],
  ["give", "gave", "given", "給"],
  ["go", "went", "gone", "去"],
  ["grow", "grew", "grown", "生長"],
  ["have", "had", "had", "有"],
  ["hear", "heard", "heard", "聽見"],
  ["hide", "hid", "hidden", "藏"],
  ["hit", "hit", "hit", "打"],
  ["hold", "held", "held", "握住"],
  ["hurt", "hurt", "hurt", "傷害"],
  ["keep", "kept", "kept", "保持"],
  ["know", "knew", "known", "知道"],
  ["lead", "led", "led", "領導"],
  ["leave", "left", "left", "離開"],
  ["lend", "lent", "lent", "借出"],
  ["let", "let", "let", "讓"],
  ["lie", "lay", "lain", "躺"],
  ["lose", "lost", "lost", "失去"],
  ["make", "made", "made", "製作"],
  ["mean", "meant", "meant", "意思是"],
  ["meet", "met", "met", "遇見"],
  ["pay", "paid", "paid", "支付"],
  ["put", "put", "put", "放"],
  ["read", "read", "read", "讀"],
  ["ride", "rode", "ridden", "騎"],
  ["ring", "rang", "rung", "響"],
  ["rise", "rose", "risen", "升起"],
  ["run", "ran", "run", "跑"],
  ["say", "said", "said", "説"],
  ["see", "saw", "seen", "看見"],
  ["sell", "sold", "sold", "賣"],
  ["send", "sent", "sent", "發送"],
  ["shake", "shook", "shaken", "搖"],
  ["shine", "shone", "shone", "發光"],
  ["shoot", "shot", "shot", "射擊"],
  ["show", "showed", "shown", "展示"],
  ["shut", "shut", "shut", "關"],
  ["sing", "sang", "sung", "唱歌"],
  ["sit", "sat", "sat", "坐"],
  ["sleep", "slept", "slept", "睡"],
  ["speak", "spoke", "spoken", "説"],
  ["spend", "spent", "spent", "花費"],
  ["stand", "stood", "stood", "站"],
  ["steal", "stole", "stolen", "偷"],
  ["swim", "swam", "swum", "游泳"],
  ["take", "took", "taken", "拿"],
  ["teach", "taught", "taught", "教"],
  ["tell", "told", "told", "告訴"],
  ["think", "thought", "thought", "想"],
  ["throw", "threw", "thrown", "扔"],
  ["understand", "understood", "understood", "理解"],
  ["wake", "woke", "woken", "醒"],
  ["wear", "wore", "worn", "穿"],
  ["win", "won", "won", "贏"],
  ["write", "wrote", "written", "寫"],
  ["bear", "bore", "born", "出生"],
  ["beat", "beat", "beaten", "打"],
  ["bend", "bent", "bent", "彎曲"],
  ["bite", "bit", "bitten", "咬"],
  ["blow", "blew", "blown", "吹"],
  ["burn", "burnt/burned", "burnt/burned", "燃燒"],
  ["burst", "burst", "burst", "爆發"],
  ["deal", "dealt", "dealt", "處理"],
  ["dig", "dug", "dug", "挖"],
  ["dream", "dreamt/dreamed", "dreamt/dreamed", "做夢"],
  ["feed", "fed", "fed", "喂"],
  ["freeze", "froze", "frozen", "凍結"],
  ["hang", "hung", "hung", "懸掛"],
  ["lay", "laid", "laid", "放置"],
  ["light", "lit", "lit", "點燃"],
  ["mistake", "mistook", "mistaken", "誤解"],
  ["overcome", "overcame", "overcome", "克服"],
  ["prove", "proved", "proven", "證明"],
  ["seek", "sought", "sought", "尋找"],
  ["sink", "sank", "sunk", "下沉"],
  ["smell", "smelt/smelled", "smelt/smelled", "聞"],
  ["speed", "sped", "sped", "加速"],
  ["spell", "spelt/spelled", "spelt/spelled", "拼寫"],
  ["spill", "spilt/spilled", "spilt/spilled", "溢出"],
  ["split", "split", "split", "分裂"],
  ["spread", "spread", "spread", "傳播"],
  ["strike", "struck", "struck", "打擊"],
  ["sweep", "swept", "swept", "掃"],
  ["swing", "swung", "swung", "擺動"],
  ["tear", "tore", "torn", "撕"],
  ["weep", "wept", "wept", "哭泣"],
  ["withdraw", "withdrew", "withdrawn", "撤回"],
];
/* Common grammar points: [title, english example, chinese note] */
export const GRAMMAR_POINTS = [
  ["一般現在時", "I go to school every day.", "表示習慣或事實，第三人稱單數加 s"],
  ["一般過去時", "I went to school yesterday.", "表示過去發生，動詞用過去式"],
  ["現在進行時", "I am going now.", "表示正在發生：be + 動詞ing"],
  ["現在完成時", "I have gone there.", "表示已發生並影響現在：have/has + 過去分詞"],
  ["一般將來時", "I will go / I am going to go.", "表示將來：will / be going to"],
  ["被動語態", "The book was written by him.", "be + 過去分詞"],
  ["情態動詞", "You must / should / can go.", "表能力、義務、可能"],
  ["比較級", "taller, more beautiful", "比較兩者：-er 或 more"],
  ["最高級", "the tallest, the most beautiful", "三者以上之最：the -est / the most"],
  ["條件句", "If it rains, I will stay home.", "if + 現在時, 主句 will"],
  ["不定冠詞", "a cat / an apple", "泛指；元音音素前用 an"],
  ["定冠詞", "the sun / the book", "特指某事物"],
  ["可數/不可數", "two books / some water", "可數加複數，不可數不加 s"],
  ["複數規則", "box → boxes, baby → babies", "s/x/ch/sh 加 es；輔音+y 變 ies"],
  ["現在分詞", "go → going", "動詞 + ing"],
  ["動名詞", "Swimming is fun.", "動詞ing 作名詞"],
  ["不定式", "I want to go.", "to + 動詞原形"],
  ["There be 句型", "There is a book.", "表示存在：There is/are"],
  ["祈使句", "Open the door.", "表命令或請求，無主語"],
  ["一般疑問句", "Do you like it?", "助動詞 do/does/did 提前"],
  ["否定句", "I don't like it.", "加 don't / doesn't / didn't"],
  ["時間介詞", "at 5 / on Monday / in May", "at + 時刻；on + 天；in + 月/年"],
  ["地點介詞", "in the box / on the desk", "in 在內部；on 在表面"],
  ["形容詞順序", "a big red ball", "大小 + 顏色 + 名詞"],
];

/* Common phrasal verbs / verb collocations: [phrase, meaning] */
export const PHRASAL_VERBS = [
  ["get up", "起牀"],
  ["get along (with)", "與…相處"],
  ["get over", "克服、恢復"],
  ["give up", "放棄"],
  ["give in", "屈服"],
  ["look for", "尋找"],
  ["look after", "照顧"],
  ["look forward to", "期待"],
  ["look up", "查閲"],
  ["put on", "穿上"],
  ["put off", "推遲"],
  ["put away", "收好"],
  ["take off", "脱下、起飛"],
  ["take care of", "照顧"],
  ["take part in", "參加"],
  ["turn on", "打開"],
  ["turn off", "關閉"],
  ["turn up", "出現、調大"],
  ["turn down", "拒絕、調小"],
  ["come across", "偶遇"],
  ["come up with", "想出"],
  ["come back", "回來"],
  ["break down", "拋錨、分解"],
  ["break up", "分手"],
  ["break into", "闖入"],
  ["carry out", "執行"],
  ["find out", "查明"],
  ["go on", "繼續"],
  ["hold on", "稍等"],
  ["keep on", "繼續"],
  ["make up", "編造、和解"],
  ["pick up", "撿起、接載"],
  ["run out of", "用完"],
  ["set up", "建立"],
  ["stand for", "代表"],
  ["work out", "解決、鍛鍊"],
  ["wake up", "醒來"],
  ["hand in", "上交"],
  ["hand out", "分發"],
  ["point out", "指出"],
  ["throw away", "扔掉"],
  ["look down on", "看不起"],
  ["get rid of", "擺脱"],
];

/* Common conversational sentences: [english, chinese] */
export const COMMON_SENTENCES = [
  ["I would like to...", "我想要…"],
  ["Can I help you?", "需要幫忙嗎？"],
  ["How are you?", "你好嗎？"],
  ["How's it going?", "最近怎麼樣？"],
  ["Nice to meet you.", "很高興見到你。"],
  ["Long time no see.", "好久不見。"],
  ["What's your name?", "你叫什麼名字？"],
  ["Where are you from?", "你來自哪裏？"],
  ["Thank you very much.", "非常感謝。"],
  ["You're welcome.", "不客氣。"],
  ["No problem.", "沒問題。"],
  ["It doesn't matter.", "沒關係。"],
  ["Never mind.", "別在意 / 算了。"],
  ["Excuse me.", "打擾一下。"],
  ["I'm sorry.", "對不起。"],
  ["That's a good idea.", "好主意。"],
  ["Sounds good.", "聽起來不錯。"],
  ["I agree with you.", "我同意你。"],
  ["I don't understand.", "我不明白。"],
  ["Could you speak slower?", "能説慢一點嗎？"],
  ["Could you help me?", "能幫我一下嗎？"],
  ["What do you mean?", "你是什麼意思？"],
  ["I'm not sure.", "我不確定。"],
  ["I have no idea.", "我不知道。"],
  ["I got it.", "我明白了。"],
  ["Let me think about it.", "讓我想一想。"],
  ["It's up to you.", "由你決定。"],
  ["Take your time.", "慢慢來。"],
  ["Don't worry.", "別擔心。"],
  ["Cheer up!", "振作起來！"],
  ["Good luck!", "祝你好運！"],
  ["Congratulations!", "恭喜你！"],
  ["I'm looking forward to it.", "我很期待。"],
  ["I can't wait.", "我等不及了。"],
  ["I'd love to.", "我很樂意。"],
  ["Of course.", "當然。"],
  ["Here you are.", "給你。"],
  ["I'm busy right now.", "我現在很忙。"],
  ["What's the matter?", "怎麼了？"],
  ["How much is it?", "這個多少錢？"],
  ["What time is it?", "現在幾點了？"],
  ["See you later.", "待會兒見。"],
  ["See you tomorrow.", "明天見。"],
  ["Have a nice day.", "祝你今天愉快。"],
  ["Let's go.", "我們走吧。"],
  ["May I come in?", "我可以進來嗎？"],
  ["I mean it.", "我是認真的。"],
  ["That's too bad.", "太可惜了。"],
  ["I'm fine, thanks.", "我很好，謝謝。"],
  ["Please wait a moment.", "請稍等。"],
];
export function detectAffixes(word) {
  const w = word.toLowerCase();
  const found = [];
  for (const a of AFFIXES) {
    if (a.type === "前綴") {
      if (w.startsWith(a.affix) && w.length >= a.affix.length + 3) found.push(a);
    } else if (a.type === "後綴") {
      if (w.endsWith(a.affix) && w.length >= a.affix.length + 3) found.push(a);
    } else { // 詞根
      if (a.affix.length >= 3 && w.includes(a.affix)) found.push(a);
    }
  }
  // dedupe by (type,affix), keep prefix first, limit 6
  const seen = new Set();
  const out = [];
  for (const a of found) {
    const key = a.type + ":" + a.affix;
    if (seen.has(key)) continue;
    seen.add(key); out.push(a);
  }
  return out.slice(0, 6);
}

/* ---- FSRS-5 记忆模拟器 ----
 * 算法：FSRS（Free Spaced Repetition Scheduler），open-spaced-repetition 社区标准，
 *       Anki 现役调度算法同族。许可证与出处：
 *       - 算法规范：fsrs4anki wiki《The Algorithm》（github.com/open-spaced-repetition/fsrs4anki）
 *       - 参考实现：ts-fsrs v5.4（MIT，github.com/open-spaced-repetition/ts-fsrs）——
 *         本区块公式逐式对照 ts-fsrs dist/index.mjs 移植，含其 next_difficulty
 *         的线性阻尼（fsrs4anki issue #697）。
 * 产品层简化（儿童两按钮 UI）：App 只发出评级 1(Again)/3(Good)；忘词调度为
 * 立即（错题本，relapseMs=0）或 10 分钟（复习忘，relapseMs=600000）回炉——
 * 这是产品语义对 due 的覆盖，FSRS 公式本身不变。评级 2/4 由 Anki 导入事件带入。
 */
export const FSRS_W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604,
  0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
  2.9898, 0.51655, 0.6621]; // FSRS-5 默认 19 权重（fsrs-rs DEFAULT_PARAMETERS 同款）
export const FSRS_DECAY = -0.5;
export const FSRS_FACTOR = 19 / 81;
export const FSRS_REQUEST_RETENTION = 0.9;
export const FSRS_MAX_INTERVAL_DAYS = 36500;
export const FSRS_S_MIN = 0.01;
export const RELAPSE_MS = 10 * 60000;   // 忘词回炉步长（对应 Anki relearning step）
const DAY_MS = 86400000;

const clampF = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const round8 = v => Math.round(v * 1e8) / 1e8;

// R(t,S) = (1 + FACTOR·t/S)^DECAY，遗忘概率曲线的确定性模拟
export function fsrsRetrievability(elapsedDays, stability) {
  if (stability <= 0) return 0;
  return round8(Math.pow(1 + FSRS_FACTOR * elapsedDays / stability, FSRS_DECAY));
}
// 间隔系数：目标保留率 0.9 与 decay=-0.5 下恰好 ≈ 1（间隔 ≈ 稳定性）
export function fsrsIntervalModifier(retention = FSRS_REQUEST_RETENTION) {
  return round8((Math.pow(retention, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR);
}
export function fsrsInitStability(rating) { return Math.max(FSRS_W[rating - 1], 0.1); }
export function fsrsInitDifficulty(rating) {
  return round8(FSRS_W[4] - Math.exp((rating - 1) * FSRS_W[5]) + 1);
}
// 含 ts-fsrs 线性阻尼 + 均值回归（难度 ∈ [1,10]）
export function fsrsNextDifficulty(d, rating) {
  const delta = -FSRS_W[6] * (rating - 3);
  const damped = d + round8(delta * (10 - d) / 9);
  return clampF(FSRS_W[7] * fsrsInitDifficulty(4) + (1 - FSRS_W[7]) * damped, 1, 10);
}
export function fsrsNextRecallStability(s, d, rating, r) {
  const hardPenalty = rating === 2 ? FSRS_W[15] : 1;
  const easyBonus = rating === 4 ? FSRS_W[16] : 1;
  const boost = Math.exp(FSRS_W[8]) * (11 - d) * Math.pow(s, -FSRS_W[9])
    * (Math.exp((1 - r) * FSRS_W[10]) - 1) * hardPenalty * easyBonus;
  return round8(clampF(s * (1 + boost), FSRS_S_MIN, FSRS_MAX_INTERVAL_DAYS));
}
export function fsrsNextForgetStability(s, d, r) {
  return round8(clampF(FSRS_W[11] * Math.pow(d, -FSRS_W[12]) * (Math.pow(s + 1, FSRS_W[13]) - 1)
    * Math.exp((1 - r) * FSRS_W[14]), FSRS_S_MIN, FSRS_MAX_INTERVAL_DAYS));
}
// 天数间隔（整数天，封顶 36500 天）；0.9 保留率下 ≈ round(stability)
export function fsrsNextInterval(stability) {
  const days = stability * fsrsIntervalModifier();
  return Math.min(Math.max(1, Math.round(days)), FSRS_MAX_INTERVAL_DAYS);
}
// 每词折叠状态：s=stability(天) d=difficulty(1-10) state=0新/2复习/3回炉 due/last=ms reps/lapses=计数
export function fsrsEmptyState() { return { s: 0, d: 0, state: 0, due: 0, last: 0, reps: 0, lapses: 0 }; }

// 一次复习：不可变返回新状态。rating ∈ 1..4（1=Again 2=Hard 3=Good 4=Easy）
export function fsrsReview(state, rating, now, relapseMs = RELAPSE_MS) {
  const st = Object.assign({}, fsrsEmptyState(), state || {});
  const elapsed = st.reps > 0 ? Math.max(0, (now - st.last) / DAY_MS) : 0;
  const r = st.s > 0 ? fsrsRetrievability(elapsed, st.s) : 0;
  if (rating === 1) {
    if (st.s > 0) {
      // 注意顺序：稳定性用「旧难度」计算（与 ts-fsrs next_ds 一致）；
      // 忘词后稳定性 = min(旧稳定性, 遗忘稳定性)（ts-fsrs 短时关闭时 w17/w18=0 的钳制）
      st.s = Math.min(st.s, fsrsNextForgetStability(st.s, st.d, r));
      st.d = fsrsNextDifficulty(st.d || fsrsInitDifficulty(1), 1);
    } else {
      st.s = fsrsInitStability(1);
      st.d = fsrsInitDifficulty(1);
    }
    st.state = 3;            // Relearning：回炉
    st.lapses += 1;
    st.due = now + relapseMs; // 产品覆盖：立即（错题本）或 10 分钟（复习忘）
  } else {
    if (st.state === 0 || st.s === 0) {
      st.s = fsrsInitStability(rating);
      st.d = fsrsInitDifficulty(rating);
    } else {
      st.s = fsrsNextRecallStability(st.s, st.d, rating, r); // 旧难度
      st.d = fsrsNextDifficulty(st.d, rating);
    }
    st.state = 2;            // Review
    st.due = now + fsrsNextInterval(st.s) * DAY_MS;
  }
  st.last = now;
  st.reps += 1;
  return st;
}

// 参与折叠的事件类型（quiz/game/daily 只进轨迹供热力图，不产生调度）
const FOLDABLE_TYPES = new Set(["know", "wrong", "remember", "forget", "anki"]);

// 状态 = fold(事件)：按词分组 → 组内按时间升序 → 逐条 fsrsReview。
// 带 seed（快照）的事件是确定性 checkpoint：无论出现在何处（含导入的 Anki
// 历史事件早于迁移快照的情况），都以快照重置状态、不应用其 rating。
export function foldWordStates(events, now) {
  const groups = new Map();
  for (const e of events || []) {
    if (!e || !FOLDABLE_TYPES.has(e.type) || typeof e.w !== "number") continue;
    const g = groups.get(e.w);
    if (g) g.push(e); else groups.set(e.w, [e]);
  }
  const out = {};
  for (const [w, evs] of groups) {
    evs.sort((a, b) => (a.t || 0) - (b.t || 0));
    let state = null;
    for (const e of evs) {
      if (e.seed) { state = Object.assign({}, fsrsEmptyState(), e.seed); continue; }
      const rating = clampF(typeof e.rating === "number" ? e.rating : 3, 1, 4) | 0;
      const relapseMs = typeof e.relapseMs === "number" ? e.relapseMs : RELAPSE_MS;
      // 注意：不能用 e.t || now —— t=0 是合法时间戳（epoch），falsy 会误判
      state = fsrsReview(state, rating, typeof e.t === "number" ? e.t : now, relapseMs);
    }
    if (state) out[w] = state;
  }
  return out;
}

// 数据进化（阶段一）：用学习轨迹为每个孩子挑选最佳目标保留率。
// 对候选 retention 逐个折叠事件流，用复习结果（记得/忘了）计算对数损失，
// 取损失最小者。确定性：同轨迹同候选恒同结果。
export function fsrsPickRetention(events, now, candidates = [0.8, 0.85, 0.9, 0.95]) {
  let best = null, bestLoss = Infinity, used = 0;
  for (const r of candidates) {
    const states = foldWordStates(events, now, r);
    let loss = 0, n = 0;
    for (const ev of events || []) {
      if (!ev || !FOLDABLE_TYPES.has(ev.type) || typeof ev.w !== "number") continue;
      const t = typeof ev.t === "number" ? ev.t : now;
      // 折叠到该事件之前的状态，计算预测保留率
      const prev = foldWordStates((events || []).filter(x => x.t < t), now, r)[ev.w];
      if (!prev || prev.s <= 0 || prev.reps < 1) continue;
      const elapsed = (t - prev.last) / DAY_MS;
      const R = fsrsRetrievability(elapsed, prev.s);
      const recalled = (typeof ev.rating === "number" ? ev.rating : 3) >= 3;
      loss += recalled ? -Math.log(Math.min(Math.max(R, 1e-6), 1 - 1e-6)) : -Math.log(Math.min(Math.max(1 - R, 1e-6), 1 - 1e-6));
      n++;
    }
    if (n >= 3 && loss / n < bestLoss) { bestLoss = loss / n; best = r; used = n; }
  }
  return { retention: best, loss: bestLoss, samples: used };
}

// AI 私教·备课诊断：从轨迹挑出最值得补习的词。
// 优先级：回炉中（state 3）> 忘过多次（lapses ≥ 2）> 到期未复习（due ≤ now）。
// 只挑「有理由」的词——诊断不说谎：都掌握时返回空，由 UI 补新词。
// 排序键：(优先级, due 升序, lapses 降序)，确定性：同轨迹恒同结果。
export function tutorDiagnosis(events, now, maxWords = 5) {
  const states = foldWordStates(events, now);
  const seen = Object.keys(states).length;
  let relearning = 0, lapsed = 0, dueN = 0;
  const picks = [];
  for (const [w, st] of Object.entries(states)) {
    const wi = Number(w);
    let reason = null;
    if (st.state === 3) { reason = "relearning"; relearning++; }
    else if (st.lapses >= 2) { reason = "lapse"; lapsed++; }
    else if (typeof st.due === "number" && st.due <= now) { reason = "due"; dueN++; }
    if (!reason) continue;
    picks.push({
      w: wi,
      state: st,
      reason,
      overdueDays: st.due <= now ? Math.max(0, Math.floor((now - st.due) / DAY_MS)) : 0,
    });
  }
  picks.sort((a, b) => {
    const pri = { relearning: 0, lapse: 1, due: 2 };
    const pa = pri[a.reason], pb = pri[b.reason];
    if (pa !== pb) return pa - pb;
    if (a.state.due !== b.state.due) return a.state.due - b.state.due;
    return (b.state.lapses || 0) - (a.state.lapses || 0);
  });
  return {
    words: picks.slice(0, Math.max(0, maxWords | 0)),
    stats: { seen, relearning, lapsed, due: dueN },
  };
}
/* ---- laze.json 场景标准（L0）：schema 校验 + 首个内置 runner ----
   三层架构见 docs/laze-json.md：场景声明（读）→ 引擎确定性执行 → 轨迹只追加（写）。
   借鉴 Cordis：声明式依赖（entities）、补丁式配置（conditions）、runner 注册表（behavior.type）。 */

// schema v0.1 校验：机器可查（agent 生成的场景先过这道门）
export function validateLaze(laze) {
  const errors = [];
  if (!laze || typeof laze !== "object" || Array.isArray(laze)) return { ok: false, errors: ["laze 必须为对象"] };
  if (laze.laze !== "0.1") errors.push(`laze 版本须为 "0.1"，当前 ${JSON.stringify(laze.laze)}`);
  const s = laze.scenario;
  if (!s || typeof s !== "object" || Array.isArray(s)) return { ok: false, errors: [...errors, "缺 scenario 对象"] };
  if (typeof s.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)) errors.push("scenario.id 须为 kebab-case 字符串");
  if (typeof s.title !== "string" || !s.title.trim() || s.title.length > 80) errors.push("scenario.title 须为 1-80 字符");
  if (s.subject !== undefined && !["en", "math", "mixed"].includes(s.subject)) errors.push("scenario.subject 须为 en/math/mixed");
  if (s.entities !== undefined) {
    if (typeof s.entities !== "object" || Array.isArray(s.entities)) errors.push("entities 须为对象");
    else for (const k of ["words", "packs"]) {
      if (s.entities[k] !== undefined && (!Array.isArray(s.entities[k]) || s.entities[k].some(x => typeof x !== "string"))) {
        errors.push(`entities.${k} 须为字符串数组`);
      }
    }
  }
  if (!s.behavior || typeof s.behavior !== "object" || typeof s.behavior.type !== "string" || !s.behavior.type.trim()) errors.push("behavior.type 必需（已注册的 runner 类型）");
  if (s.conditions !== undefined && (typeof s.conditions !== "object" || Array.isArray(s.conditions)
    || (s.conditions.seed !== undefined && !Number.isInteger(s.conditions.seed)))) errors.push("conditions.seed 须为整数");
  if (s.trace !== undefined && (typeof s.trace !== "object" || Array.isArray(s.trace))) errors.push("trace 须为对象");
  if (s.storyboard !== undefined && (!Array.isArray(s.storyboard)
    || s.storyboard.some(st => !st || typeof st !== "object" || typeof st.step !== "string"))) errors.push("storyboard 步骤须为含 step 字段的对象数组");
  return { ok: errors.length === 0, errors };
}

// 首个内置 runner：word-quiz（en2zh/zh2en 交替 + seeded 干扰项，确定性：同 seed 恒同题）
export function lazeWordQuiz(scenario, words, seed = 0) {
  const list = (words || []).filter(Boolean);
  if (!list.length) return [];
  const count = Math.min(Math.max(1, Math.floor(scenario.behavior.count || 5)), 50);
  const mode = scenario.behavior.mode === "zh2en" ? "zh2en" : "en2zh";
  const qs = [];
  for (let i = 0; i < count; i++) {
    const dir = mode === "zh2en" ? "zh2en" : (i % 2 === 0 ? "en2zh" : "zh2en");
    const correct = list[(i * 7) % list.length];
    const rng = mulberry32((seed * 31 + i) >>> 0);
    const others = list.filter(w => w !== correct);
    const opts = [correct];
    while (opts.length < 4 && others.length) {
      const j = Math.floor(rng() * others.length);
      opts.push(others[j]); others.splice(j, 1);
    }
    for (let k = opts.length - 1; k > 0; k--) { // 确定性洗牌（同一 rng 流）
      const j = Math.floor(rng() * (k + 1));
      [opts[k], opts[j]] = [opts[j], opts[k]];
    }
    qs.push({ dir, correct, opts });
  }
  return qs;
}

// 词元视角：把单词切成「词元片段」（教学分词——AI 读词的工程化形态的演示）。
// 规则：词缀表匹配前綴/後綴切出边界（最长匹配，under 优先于 un），中间为词根；
// 无词缀则整词为 1 个词元。诚实边界：这是词素级教学分词，不是 GPT 的精确 BPE——UI 文案需说明。
export function wordTokens(word) {
  const w = String(word || "").trim().toLowerCase();
  if (!/^[a-z][a-z'-]*$/.test(w) || w.length < 2) return null;
  let prefix = null, suffix = null;
  for (const a of AFFIXES) {
    if (a.type === "前綴" && w.startsWith(a.affix) && w.length >= a.affix.length + 3
      && (!prefix || a.affix.length > prefix.length)) prefix = a.affix;
    if (a.type === "後綴" && w.endsWith(a.affix) && w.length >= a.affix.length + 3
      && (!suffix || a.affix.length > suffix.length)) suffix = a.affix;
  }
  if (!prefix && !suffix) return { parts: [{ text: w, kind: "root" }], note: "整詞即 1 個詞元" };
  const parts = [];
  let rest = w;
  if (prefix) { parts.push({ text: prefix, kind: "prefix" }); rest = rest.slice(prefix.length); }
  if (suffix) rest = rest.slice(0, rest.length - suffix.length);
  if (rest) parts.push({ text: rest, kind: "root" });
  if (suffix) parts.push({ text: suffix, kind: "suffix" });
  return { parts, note: parts.length + " 個詞元（教學分詞）" };
}

/* ---- LLM Tokenizer（GPT-2 BPE 运行时，纯函数部分）----
 * 模板层提供真实 GPT-2 ranks（构建时注入 vocab.bpe.gz）与字节→Unicode 映射；
 * 本函数只做贪心归并与「按字节偏移切回原词」的显示还原——可在 Node 单测。 */
export function bpeMerge(parts, ranks) {
  // 忠实 GPT-2 BPE（官方 encoder.py 语义）：每轮取全词唯一 pair 中 rank 最小者，
  // 一次性合并该 pair 的所有出现（逐个位置合并在重复字母词上会与官方分叉，如 hello）。
  const ps = parts.map(t => ({ text: t, bytes: 1, rank: null }));
  while (ps.length > 1) {
    const pairRank = new Map();
    for (let i = 0; i < ps.length - 1; i++) {
      const key = ps[i].text + " " + ps[i + 1].text;
      if (!pairRank.has(key)) pairRank.set(key, ranks[key]);
    }
    let bestKey = null, bestRank = Infinity;
    for (const [key, r] of pairRank) {
      if (r !== undefined && r < bestRank) { bestRank = r; bestKey = key; }
    }
    if (bestKey === null) break;
    const [a, b] = bestKey.split(" ");
    const out = [];
    for (let i = 0; i < ps.length; i++) {
      if (i < ps.length - 1 && ps[i].text === a && ps[i + 1].text === b) {
        // rank 为 0-based 合并编号；token id = 256 + rank（未合并的单字节片段由字节表查）
        out.push({ text: a + b, bytes: ps[i].bytes + ps[i + 1].bytes, rank: bestRank });
        i++;
      } else {
        out.push(ps[i]);
      }
    }
    ps.splice(0, ps.length, ...out);
  }
  return ps;
}
// 按字节偏移把 token 片段切回原始词（多字节字符安全：逐字符累计字节数）
export function piecesToDisplay(word, parts) {
  const chars = [...word];
  const charBytes = chars.map(c => new TextEncoder().encode(c).length);
  const out = [];
  let ci = 0;
  for (const p of parts) {
    let need = p.bytes, seg = "";
    while (need > 0 && ci < chars.length) { seg += chars[ci]; need -= charBytes[ci]; ci++; }
    out.push(seg);
  }
  return out;
}

/* ---- 自适应内核（docs/adaptive-learning.md）：错误模式分类 + 薄弱单元诊断 ----
 * 真内核 = 从二元对错到能力单元：拼写题答错 → 归类混淆对（ie/ei、双写、y→ies…），
 * 聚合出「哪个能力单元薄弱」，针对性补课、出题进化。混淆对表数据驱动、可扩展、可署名。 */

// 拼写混淆对（ESL 孩子常见）；pairs 为「写错 → 写对」的子串替换（双向都收录）
export const SPELLING_CONFUSIONS = [
  { id: "ie-ei", zh: "ie / ei 順序", pairs: [["ei", "ie"], ["ie", "ei"]] },
  { id: "ance-ence", zh: "-ance / -ence", pairs: [["ance", "ence"], ["ence", "ance"]] },
  { id: "y-ies", zh: "y → ies（複數/第三人稱）", pairs: [["ys", "ies"], ["ies", "ys"]] },
  { id: "e-drop", zh: "去 e 再加 ing", pairs: [["eing", "ing"], ["ing", "eing"]] },
  { id: "b-d", zh: "b / d 鏡像", pairs: [["b", "d"], ["d", "b"]] },
  { id: "c-s", zh: "c / s", pairs: [["c", "s"], ["s", "c"]] },
];

// 拼写错误分类：返回命中的混淆对 id 列表（可多个）；相同/空串返回 []
export function classifySpellingError(input, expected) {
  const a = String(input || "").toLowerCase();
  const b = String(expected || "").toLowerCase();
  if (!a || !b || a === b) return [];
  const hits = [];
  for (const c of SPELLING_CONFUSIONS) {
    if (c.pairs.some(([wrong, right]) => a.includes(wrong) && a.replace(wrong, right) === b)) hits.push(c.id);
  }
  return hits;
}

// 薄弱单元诊断：从 wrong 事件（带 input）聚合能力单元，按次数降序。
// wordOf: (词索引) => 词对象（含 .w）；确定性：同轨迹恒同结果。
export function diagnoseWeaknesses(events, wordOf) {
  const zhById = Object.fromEntries(SPELLING_CONFUSIONS.map(c => [c.id, c.zh]));
  const agg = new Map(); // unit -> { count, words:Set }
  for (const e of events || []) {
    if (!e || e.type !== "wrong" || typeof e.w !== "number") continue;
    if (typeof e.input !== "string" || !e.input) continue;
    const wo = wordOf ? wordOf(e.w) : null;
    const expected = wo && wo.w ? wo.w : "";
    for (const id of classifySpellingError(e.input, expected)) {
      if (!agg.has(id)) agg.set(id, { count: 0, words: new Set() });
      const a = agg.get(id);
      a.count++;
      if (expected) a.words.add(expected);
    }
  }
  return [...agg.entries()]
    .map(([unit, a]) => ({ unit, zh: zhById[unit] || unit, count: a.count, words: [...a.words] }))
    .sort((x, y) => y.count - x.count || x.unit.localeCompare(y.unit));
}

// 针对性出题：每个薄弱单元对应一个词形匹配器（与 SPELLING_CONFUSIONS 的 id 对齐）
export const SPELLING_TARGETS = {
  "ie-ei": (w) => /(ie|ei)/i.test(w),
  "ance-ence": (w) => /(ance|ence)$/i.test(w),
  "y-ies": (w) => /y$/i.test(w),
  "e-drop": (w) => /e$/i.test(w),
  "b-d": (w) => /[bd]/i.test(w),
  "c-s": (w) => /[cs]/i.test(w),
};

// 从词池选「含该薄弱模式」的词（确定性 seed；未知单元返回空；count 钳制不越界）
export function targetWords(weakness, pool, seed, count = 5) {
  const match = SPELLING_TARGETS[weakness];
  if (!match) return [];
  const list = (pool || []).filter(w => w && typeof w.w === "string" && match(w.w));
  return seededShuffle(list, seed).slice(0, Math.max(0, count | 0));
}

/* ---- 音素层诊断（最小对）：th/s、i/ee、l/r、v/w、n/ng、e/æ ---- */
export const PHONEME_CONFUSIONS = [
  { id: "i-ee", a: "ɪ", b: "i", zh: "短 i / 長 ee（ship / sheep）" },
  { id: "e-ae", a: "e", b: "æ", zh: "e / æ（bed / bad）" },
  { id: "th-s", a: "θ", b: "s", zh: "th / s（think / sink）" },
  { id: "l-r", a: "l", b: "r", zh: "l / r（light / right）" },
  { id: "v-w", a: "v", b: "w", zh: "v / w（very / wery）" },
  { id: "n-ng", a: "n", b: "ŋ", zh: "n / ng（sin / sing）" },
];
// IPA 是否含某音素（子串匹配；长元音 iː 亦含 i）
export function ipaHas(ipa, ph) { return (ipa || "").includes(ph); }
// 两个 IPA 是否构成某音素混淆对（一方含 a、另一方含 b）
export function phonemeConfusion(aIpa, bIpa) {
  for (const c of PHONEME_CONFUSIONS) {
    if ((ipaHas(aIpa, c.a) && ipaHas(bIpa, c.b)) || (ipaHas(aIpa, c.b) && ipaHas(bIpa, c.a))) return c.id;
  }
  return null;
}
/* ---- 数学易错题分类与诊断（领域知识：小学数学/初中数学公认易错点，
 * 非抓取论文；分类表数据驱动、可扩展、可署名） ---- */
export const MATH_ERROR_TYPES = [
  { id: "basic-arith", zh: "基礎運算（20 以內）", match: (o, d) => (o === "add" || o === "sub") && d === 1 },
  { id: "carry-add", zh: "進位加法", match: (o, d) => o === "add" && d >= 2 },
  { id: "borrow-sub", zh: "借位減法", match: (o, d) => o === "sub" && d >= 2 },
  { id: "times-table", zh: "乘法口訣", match: (o, d) => o === "mul" && d === 1 },
  { id: "big-mul", zh: "多位乘法", match: (o, d) => o === "mul" && d >= 2 },
  { id: "division", zh: "除法（含餘數）", match: (o, d) => o === "div" },
  { id: "formula", zh: "公式（面積/周長/勾股/平均）", match: (o, d) => o === "formula" },
  { id: "percent", zh: "百分比（打折/佔比）", match: (o, d) => o === "percent" },
  { id: "polynomial", zh: "多項式（合併/展開）", match: (o, d) => o === "poly" },
  { id: "coordinate", zh: "坐標（旋轉/平移）", match: (o, d) => o === "coord" },
];
// 运算类型 → 易错单元归因（op ∈ add/sub/mul/div/formula；difficulty ∈ 1..3）
export function classifyMathError(op, difficulty) {
  for (const t of MATH_ERROR_TYPES) if (t.match(op, difficulty)) return t.id;
  return "basic-arith";
}
// 数学概念题生成器（确定性，seed 驱动；覆盖 Chloe 的薄弱点：百分比/多项式/坐标旋转）
// 返回 {q, a, opts}：a 为答案（数字或字符串），opts 为 4 个互异选项（含答案）——与 arith 契约一致
function numOpts(a, rng) {
  const set = new Set([a]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const d = 1 + ((rng() * 9) | 0);
    const c = a + (rng() < 0.5 ? d : -d);
    set.add(c >= 0 ? c : a + d);
  }
  const arr = [...set];
  for (let i = arr.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function strOpts(a, candidates, rng) {
  const set = new Set([a]);
  for (const c of candidates) if (c !== a) set.add(c);
  const arr = [...set].slice(0, 4);
  while (arr.length < 4) arr.push(a + "?");
  for (let i = arr.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
export function generatePercentage(seed = 0) {
  const rng = mulberry32(seed);
  const type = (rng() * 3) | 0;
  let q, a;
  if (type === 0) { const N = [50, 100, 200, 80, 25][(rng() * 5) | 0], P = [10, 20, 25, 50, 75][(rng() * 5) | 0]; a = N * P / 100; q = `${N} 的 ${P}% 是多少？`; }
  else if (type === 1) { const A = [30, 20, 40, 25, 10][(rng() * 5) | 0], B = [50, 80, 100, 200, 40][(rng() * 5) | 0]; a = A / B * 100; q = `${A} 是 ${B} 的百分之幾？`; }
  else { const X = [100, 200, 50, 80][(rng() * 4) | 0], P = [8, 9, 7][(rng() * 3) | 0]; a = X * P / 10; q = `原價 ${X} 元，打 ${P} 折後多少元？`; }
  return { q, a, opts: numOpts(a, rng) };
}
export function generatePolynomial(seed = 0) {
  const rng = mulberry32(seed);
  const type = (rng() * 2) | 0;
  let q, a;
  if (type === 0) {
    const c1 = 1 + ((rng() * 5) | 0), c2 = 1 + ((rng() * 5) | 0), c3 = 1 + ((rng() * 3) | 0);
    a = (c1 + c2 - c3) + "x"; q = `${c1}x + ${c2}x − ${c3}x = ？`;
    return { q, a, opts: strOpts(a, [(c1 + c2 + c3) + "x", (c1 + c2) + "x", (c2 + c3) + "x"], rng) };
  }
  const c = 1 + ((rng() * 4) | 0), d = 1 + ((rng() * 4) | 0);
  const sum = c + d, prod = c * d;
  a = `x² + ${sum}x + ${prod}`; q = `(x + ${c})(x + ${d}) 展開 = ？`;
  return { q, a, opts: strOpts(a, [`x² + ${sum - 1}x + ${prod}`, `x² + ${sum}x + ${prod - 1}`, `x² + ${sum + 1}x + ${prod}`], rng) };
}
export function generateCoordinate(seed = 0) {
  const rng = mulberry32(seed);
  const x = -5 + ((rng() * 11) | 0), y = -5 + ((rng() * 11) | 0);
  const type = (rng() * 3) | 0;
  let q, a;
  if (type === 0) { a = `(${-x}, ${-y})`; q = `點 (${x}, ${y}) 繞原點旋轉 180° 後是？`; }
  else if (type === 1) { a = `(${y}, ${-x})`; q = `點 (${x}, ${y}) 繞原點順時針旋轉 90° 後是？`; }
  else { const dx = 1 + ((rng() * 3) | 0); a = `(${x + dx}, ${y})`; q = `點 (${x}, ${y}) 向右平移 ${dx} 個單位後是？`; }
  return { q, a, opts: strOpts(a, [`(${-x}, ${-y})`, `(${y}, ${-x})`, `(${x}, ${-y})`, `(${-y}, ${x})`], rng) };
}

// 数学薄弱单元诊断：从 mathwrong 事件（type=mathwrong，含 op/difficulty）聚合
export function diagnoseMathWeaknesses(events) {
  const zhById = Object.fromEntries(MATH_ERROR_TYPES.map(t => [t.id, t.zh]));
  const agg = new Map();
  for (const e of events || []) {
    if (!e || e.type !== "mathwrong") continue;
    const id = classifyMathError(e.op, e.difficulty);
    if (!agg.has(id)) agg.set(id, { count: 0 });
    agg.get(id).count++;
  }
  return [...agg.entries()].map(([unit, a]) => ({ unit, zh: zhById[unit] || unit, count: a.count })).sort((x, y) => y.count - x.count);
}

// 听音题薄弱单元诊断：wrong 事件带 chosen（孩子错选的词索引），比 target 与 chosen 的 IPA
export function diagnosePhonemeWeaknesses(events, wordOf) {
  const zhById = Object.fromEntries(PHONEME_CONFUSIONS.map(c => [c.id, c.zh]));
  const agg = new Map();
  for (const e of events || []) {
    if (!e || e.type !== "wrong" || typeof e.w !== "number" || typeof e.chosen !== "number") continue;
    const tw = wordOf ? wordOf(e.w) : null;
    const cw = wordOf ? wordOf(e.chosen) : null;
    const id = tw && cw ? phonemeConfusion(tw.p, cw.p) : null;
    if (!id) continue;
    if (!agg.has(id)) agg.set(id, { count: 0, words: new Set() });
    const a = agg.get(id); a.count++; a.words.add(tw.w);
  }
  return [...agg.entries()].map(([unit, a]) => ({ unit, zh: zhById[unit] || unit, count: a.count, words: [...a.words] })).sort((x, y) => y.count - x.count);
}

// 场景组合器（场景农场的生产函数）：参数 → 合法 laze.json（validateLaze 必过）。
// 确定性：同参数恒同场景。生产与选择分离——组合器只产场景，bandit 只排序（docs/scenario-farm.md）。
export function scenarioCompose(opts = {}) {
  const id = typeof opts.id === "string" && opts.id ? opts.id : "";
  const words = (opts.words || []).map(w => (typeof w === "string" ? w : (w && w.w))).filter(Boolean);
  return {
    laze: "0.1",
    scenario: {
      id,
      title: opts.title || id,
      subject: opts.subject || "en",
      entities: { words: words.slice(0, 50) },
      behavior: { type: opts.type || "word-quiz", mode: opts.mode || "en2zh", difficulty: opts.difficulty || 1, count: opts.count || 10 },
      conditions: { seed: Number.isInteger(opts.seed) ? opts.seed : 0 },
      trace: { write: true },
      storyboard: opts.storyboard || [],
    },
  };
}

// DSE 专题 prompt 生成器（场景层的生产者之一）：
// 大纲课题 + 孩子薄弱词 → 结构化 prompt，交给 dsh AI 老师开发互动做题 UI（本机亦可运行）。
// 确定性：同输入恒同 prompt；输出约束为单文件 HTML（沙箱可运行，无外部依赖）。
export function dsePrompt(subjectZh, unitZh, weakWords) {
  const words = (weakWords || []).filter(Boolean).slice(0, 10);
  const diag = words.length
    ? `學生近期的薄弱詞：${words.join("、")}。請在題目或提示中自然帶入這些詞。`
    : "學生暫無記錄的薄弱詞。";
  return [
    "你是香港 DSE 補習老師，也是互動網頁開發者。",
    `請開發一個互動做題頁面：主題「${unitZh}」（${subjectZh}，DSE 級別）。`,
    "要求：",
    "1. 輸出 ONLY 一個完整的單一 HTML 文件（內聯 CSS/JS），不依賴外部網絡、CDN 或圖片。",
    "2. 題型：選擇題為主（可含填空），共 8 題，由易到難，每題即時判分並顯示簡短解析（繁體中文）。",
    "3. 計分與總結：答完顯示分數與鼓勵語；提供「再來一次」按鈕（重新出題，同參數確定性）。",
    "4. 適合小學生到初中生：字體偏大、按鈕友好、不超過 500 行代碼。",
    "5. 教學誠實：不编造公式或定理；題目難度與 DSE 大綱一致。",
    diag,
    "驗收標準：可在瀏覽器直接打開運行；點擊即判分；全部 8 題可完成。",
  ].join("\n");
}

// 旧 {stage,due} → seed 快照事件（迁移用；due 严格不变）
const LEGACY_INTERVALS_DAYS = [0, 1, 3, 7, 15, 30]; // 旧固定间隔（legacy，仅迁移）
export function fsrsMigrateLegacy(legacy, index) {
  const due = (legacy && typeof legacy.due === "number") ? legacy.due : 0;
  const stage = clampF((legacy && typeof legacy.stage === "number") ? legacy.stage : 0, 0, 5) | 0;
  const t = due - LEGACY_INTERVALS_DAYS[stage] * DAY_MS;
  const seed = stage >= 1
    ? { s: LEGACY_INTERVALS_DAYS[stage], d: 5, state: 2, due, last: t, reps: stage, lapses: 0 }
    : { s: 0, d: 0, state: 0, due, last: 0, reps: 0, lapses: 0 };
  return { type: "know", source: "app", w: index, rating: 3, t, seed };
}

// 轨迹压缩：有状态词各保留一条 seed 快照事件，非词类事件保留最近 2000 条。
// 压缩后 fold 出的状态与原轨迹等价（due/stability 不变），热力图因事件密度下降有轻微近似。
export function compactTrajectory(events, now) {
  const states = foldWordStates(events, now);
  const latestT = new Map();
  for (const e of events || []) {
    if (e && typeof e.w === "number" && states[e.w]) {
      const t = e.t || 0;
      if (!latestT.has(e.w) || t > latestT.get(e.w)) latestT.set(e.w, t);
    }
  }
  const out = [];
  for (const [w, t] of latestT) {
    out.push({ type: "know", source: "app", w, rating: 3, t, seed: states[w] });
  }
  out.push(...(events || []).filter(e => !(e && typeof e.w === "number" && states[e.w])).slice(-2000));
  out.sort((a, b) => (a.t || 0) - (b.t || 0));
  return out;
}

export const IPA_VOWELS = new Set("iɪeɛæaɑɔoʊuʌəɜɝɚɨʉɵœɒyøɯ".split(""));
export const IPA_SONORANTS = new Set("mnŋl".split(""));   // syllabic-consonant nuclei (e.g. the "n" in -tion)
export const IPA_OBSTRUENTS = new Set("pbtdkgfvszʃʒθðh".split(""));
export function ipaIsVowel(c) { return IPA_VOWELS.has(c); }
export function ipaSplitGroup(seg) {
  const chars = [...seg];
  const nuclei = [];
  for (let i = 0; i < chars.length; i++) {
    if (!ipaIsVowel(chars[i])) continue;
    const start = i; let len = 1;
    if (chars[i + 1] === "ː") { len = 2; i += 1; }
    else if (chars[i + 1] && ipaIsVowel(chars[i + 1])) { len = 2; i += 1; if (chars[i + 1] === "ː") { len = 3; i += 1; } }
    nuclei.push({ start, len });
  }
  if (!nuclei.length) return [seg];
  const syls = [];
  let pos = 0;
  for (let n = 0; n < nuclei.length; n++) {
    const vStart = nuclei[n].start, vEnd = vStart + nuclei[n].len;
    let end;
    if (n === nuclei.length - 1) {
      end = chars.length;
      // trailing syllabic consonant (e.g. "ʃn" in -tion, "tl" in -tle): give it its own syllable
      const tail = chars.slice(vEnd);
      if (tail.length >= 2) {
        const last = tail[tail.length - 1], prev = tail[tail.length - 2];
        if (IPA_SONORANTS.has(last) && IPA_OBSTRUENTS.has(prev)) end = chars.length - 2;
      }
    } else {
      const between = nuclei[n + 1].start - vEnd;
      end = vEnd + (between >= 2 ? 1 : 0);
    }
    syls.push(chars.slice(pos, end).join(""));
    pos = end;
  }
  if (pos < chars.length) syls.push(chars.slice(pos).join(""));
  return syls;
}
export function ipaSyllables(ipa) {
  const s = String(ipa || "").replace(/^\/+|\/+$/g, "");   // strip surrounding slashes before parsing
  const out = [];
  let stress = 0, seg = "";
  const flush = () => {
    if (!seg) return;
    ipaSplitGroup(seg).forEach((t, i) => out.push({ t, s: i === 0 ? stress : 0 }));
    seg = "";
  };
  for (const ch of s) {
    if (ch === "ˈ") { flush(); stress = 1; }
    else if (ch === "ˌ") { flush(); stress = 2; }
    else seg += ch;
  }
  flush();
  return out;
}
export function ipaHtml(ipa) {
  if (!ipa) return "";
  const syls = ipaSyllables(ipa);
  return syls.map(s => {
    const cls = s.s === 1 ? "ipa-stress-primary" : s.s === 2 ? "ipa-stress-secondary" : "";
    return `<span class="ipa-syl ${cls}">${escapeHtml(s.t)}</span>`;
  }).join('<span class="ipa-dot">·</span>');
}
/* ---- English word syllabification (orthographic) so letters highlight in step with IPA ---- */
export const WORD_DIGRAPHS = new Set(["ch","sh","th","ph","wh","ck","qu","gh","wr","kn","ng","tch","dge"]);
export const WORD_BLENDS = new Set(["bl","br","cl","cr","dr","fl","fr","gl","gr","pl","pr","sc","sk","sl","sm","sn","sp","st","sw","tr","tw","dw","thr","shr","spl","spr","str","scr","squ","sch"]);
export function wordIsVowel(c) { return "aeiouy".includes(c); }
export function wordVowelGroups(w) {
  const g = [];
  for (let i = 0; i < w.length; i++) {
    if (wordIsVowel(w[i])) { let j = i; while (j + 1 < w.length && wordIsVowel(w[j + 1])) j++; g.push([i, j]); i = j; }
  }
  return g;
}
export function wordSyllables(word) {
  const w = String(word || "").trim().toLowerCase();
  if (!w) return [];
  let g = wordVowelGroups(w);
  if (!g.length) return [word];
  // silent final 'e' (CVCe): a lone trailing 'e' after a consonant, with another vowel before it
  if (g.length > 1) {
    const [ls, le] = g[g.length - 1];
    if (ls === le && le === w.length - 1 && w[ls] === "e" && !wordIsVowel(w[ls - 1])) g = g.slice(0, -1);
  }
  const parts = [];
  let start = 0;
  for (let v = 0; v < g.length; v++) {
    const [vs, ve] = g[v];
    if (v === g.length - 1) { parts.push(word.slice(start)); break; }
    const ns = g[v + 1][0];
    const cluster = w.slice(ve + 1, ns);           // consonants between this vowel and the next
    let keep = 0;                                   // consonants of the cluster kept at the end of this syllable
    if (cluster.length === 1) keep = 0;             // V.CV
    else if (cluster.length >= 2) {
      keep = cluster.length - 1;                    // VC.CV
      if (WORD_DIGRAPHS.has(cluster.slice(-2))) keep = cluster.length - 2;
      else if (WORD_BLENDS.has(cluster.slice(-3))) keep = cluster.length - 3;
      else if (WORD_BLENDS.has(cluster.slice(-2))) keep = cluster.length - 2;
      if (keep < 0) keep = 0;
    }
    const end = ve + 1 + keep;
    parts.push(word.slice(start, end));
    start = end;
  }
  return parts;
}
export function wordHtml(word) {
  return String(word || "").trim().split(/\s+/).filter(Boolean).map(w => (
    wordSyllables(w).map(s => `<span class="w-syl">${escapeHtml(s)}</span>`).join("")
  )).join(" ");
}

export function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function blankWord(sentence, word) {
  const base = word.split(" ")[0];
  const re = new RegExp("\\b" + escapeRegExp(base) + "(?:es|s|ed|ing|d)?\\b", "ig");
  const replaced = sentence.replace(re, "______");
  return { sentence: replaced, found: replaced !== sentence };
}

export function gradeGuess(guess, target) {
  const g = guess.toLowerCase(), t = target.toLowerCase();
  const res = g.split("").map(ch => ({ ch, status: "gray" }));
  const counts = {};
  for (const c of t) counts[c] = (counts[c] || 0) + 1;
  for (let i = 0; i < g.length; i++) if (g[i] === t[i]) { res[i].status = "green"; counts[g[i]]--; }
  for (let i = 0; i < g.length; i++) if (res[i].status !== "green" && counts[g[i]] > 0) { res[i].status = "yellow"; counts[g[i]]--; }
  return res;
}

export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* Anki revlog 条目 → 轨迹事件（事件级统一：source:"anki" 并入同一条确定性时间线）。
 * ease 1-4 → rating；id 小于 1e12 视为秒 → ×1000（跨 AnkiConnect 版本时间单位差异）；
 * 无匹配词返回 null（调用方计数跳过）。 */
export function ankiRevlogToEvent(revlog, cardToWordIndex) {
  const w = cardToWordIndex.get(revlog.cardId);
  if (w === undefined) return null;
  const ease = clampF(typeof revlog.ease === "number" ? revlog.ease : 3, 1, 4) | 0;
  let t = typeof revlog.id === "number" ? revlog.id : 0;
  if (t > 0 && t < 1e12) t *= 1000;
  return { type: "anki", source: "anki", w, rating: ease, t };
}

/* ---- 单词挖雷（纯逻辑，可测）----
 * 标准扫雷规则（数字推理）+ 拆雷版：雷 = 错题词，踩雷须答对释义才能拆除。
 */
// 生成雷场：seed 确定性；counts[i] = 格子 i 的相邻雷数
export function mineField(size, mineCount, seed) {
  const rng = mulberry32(seed);
  const total = size * size;
  const mines = new Set();
  while (mines.size < Math.min(mineCount, total - 1)) mines.add((rng() * total) | 0);
  const counts = new Array(total).fill(0);
  for (const m of mines) {
    const r = Math.floor(m / size), c = m % size;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < size && cc >= 0 && cc < size) counts[rr * size + cc]++;
    }
  }
  return { size, mines, counts };
}
// 零扩散翻开：从 idx 起扩散，返回本次新翻开的格子（不含雷；数字格不继续扩散）
export function mineReveal(field, idx, revealed) {
  const seen = new Set(revealed);
  const out = [];
  const stack = [idx];
  while (stack.length) {
    const i = stack.pop();
    if (seen.has(i) || field.mines.has(i)) continue;
    seen.add(i);
    out.push(i);
    if (field.counts[i] !== 0) continue;
    const r = Math.floor(i / field.size), c = i % field.size;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < field.size && cc >= 0 && cc < field.size) stack.push(rr * field.size + cc);
    }
  }
  return out;
}

/* ---- 单词赛车（纯逻辑，可测）----
 * 路面三道各挂一个单词，按释义选对车道。同 rng 流恒同门。
 */
export const RACE_LANES = 3;
// 从词池生成一道「单词门」：目标词 + 干扰词随机排入三道
export function raceGate(words, rng) {
  const pool = words.filter(w => w && typeof w.w === "string" && w.w.length > 0);
  if (pool.length < 2) return null;
  const target = pool[(rng() * pool.length) | 0];
  const others = pool.filter(w => w !== target);
  const picks = [target];
  for (let i = others.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [others[i], others[j]] = [others[j], others[i]]; }
  for (const o of others) { if (picks.length < RACE_LANES) picks.push(o); }
  for (let i = picks.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [picks[i], picks[j]] = [picks[j], picks[i]]; }
  return { target, lanes: picks, correctLane: picks.indexOf(target) };
}

/* ---- 在线批量加词（纯逻辑，可测）---- */
// 解析一行输入：返回 {w, m}；「word 释义」格式带 m，纯单词则 m=null；非法返回 null
export function parseAddWordsLine(line) {
  const s = String(line || "").trim();
  if (!s) return null;
  const m = s.match(/^([A-Za-z][A-Za-z' -]{1,60})\s+([一-鿿][\s\S]{0,80})$/);
  if (m) return { w: m[1], m: m[2].trim() };
  if (/^[A-Za-z][A-Za-z' -]{1,60}$/.test(s)) return { w: s, m: null };
  return null;
}

/* ---- 字母组词（纯逻辑，可测）----
 * 6 个目标词（前 5 字母）放进 size×size 字母网格，孩子拖拽连线拼出单词。
 */
// 词条规范化：小写、去非字母、取前 5 字母（其他长度「高亮前 5 个首字母」）
export function letterGameWord(w) {
  const s = String(w || "").toLowerCase().replace(/[^a-z]/g, "");
  return s.slice(0, 5);
}
// 网格构建：每个词随机起点 + 8 方向之一放置（允许共享同字母格），余格随机填充。
// 同 seed 恒同网格（确定性）。
export function letterGridBuild(targets, size, seed) {
  const rng = mulberry32(seed);
  const total = size * size;
  const grid = new Array(total).fill("");
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const placed = [];
  for (const word of targets) {
    let ok = false;
    for (let attempt = 0; attempt < 300 && !ok; attempt++) {
      const r0 = (rng() * size) | 0, c0 = (rng() * size) | 0;
      const [dr, dc] = dirs[(rng() * dirs.length) | 0];
      const path = [];
      for (let k = 0; k < word.length; k++) {
        const rr = r0 + dr * k, cc = c0 + dc * k;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) break;
        const idx = rr * size + cc;
        if (grid[idx] !== "" && grid[idx] !== word[k]) break; // 冲突且字母不同 → 此方向不可
        path.push(idx);
      }
      if (path.length === word.length) {
        path.forEach((idx, k) => { grid[idx] = word[k]; });
        placed.push({ word, path });
        ok = true;
      }
    }
  }
  // 余格随机小写字母填充
  for (let i = 0; i < total; i++) {
    if (grid[i] === "") grid[i] = String.fromCharCode(97 + ((rng() * 26) | 0));
  }
  return { grid, placed };
}
// 路径合法性：8 方向相邻、不重复访问、不越界
export function letterPathValid(path, size) {
  if (!Array.isArray(path) || path.length < 1) return false;
  const seen = new Set();
  let prev = -1;
  for (const idx of path) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= size * size || seen.has(idx)) return false;
    seen.add(idx);
    if (prev >= 0) {
      const dr = Math.abs(Math.floor(idx / size) - Math.floor(prev / size));
      const dc = Math.abs((idx % size) - (prev % size));
      if (dr > 1 || dc > 1) return false;
    }
    prev = idx;
  }
  return true;
}

/* ---- Anki 兼容（纯函数，供导出/同步共用） ---- */
export const ANKI_TSV_HEADER = "#separator:tab\n#html:true\n#tags:lazeword";

// Anki TSV 一行：Front=词+IPA（HTML），Back=词性+释义，标签 laz... 用 #tags 行
export function ankiTsvRow(w) {
  return `<b>${escapeHtml(w.w)}</b> &nbsp; <span style="color:#666">${escapeHtml(w.p)}</span>\t${escapeHtml(w.pos + " " + w.m)}`;
}

// AnkiConnect addNotes 的单条 note（Basic 模板：正面词+音标，背面词性+释义）
export function ankiNoteFor(w, deck) {
  return {
    deckName: deck,
    modelName: "Basic",
    fields: {
      Front: `<b>${escapeHtml(w.w)}</b><br><span style="color:#888">${escapeHtml(w.p)}</span>`,
      Back: `${escapeHtml(w.pos)}<br>${escapeHtml(w.m)}`,
    },
    tags: ["lazeword", w.c],
  };
}
export function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
export function similarity(a, b) {
  a = String(a).toLowerCase().trim(); b = String(b).toLowerCase().trim();
  if (!a.length || !b.length) return 0;
  const m = a.length, n = b.length;
  const d = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
  }
  return 1 - d[m][n] / Math.max(m, n);
}

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

// 按天聚合事件数（学习热力图等用；键为 YYYY-MM-DD，本地时区）
export function eventsByDay(events) {
  const days = {};
  for (const e of events) {
    if (!e || typeof e.t !== "number") continue;
    const d = new Date(e.t);
    const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    days[k] = (days[k] || 0) + 1;
  }
  return days;
}

/* ---- 繁/简转换（紧凑映射表：char:char,...） ---- */
// 把 "發:发,學:学" 形式的映射串编译成 Map；编译结果按映射串缓存
// （启动/大列表渲染会对数万文本节点调用 zhConv，每次重解析是分钟级阻塞的根源）
const ZH_MAP_CACHE = new Map();
export function makeZhMap(mapStr) {
  const hit = ZH_MAP_CACHE.get(mapStr);
  if (hit) return hit;
  const m = new Map();
  if (mapStr) {
    for (const pair of mapStr.split(",")) {
      const i = pair.indexOf(":");
      if (i > 0) m.set(pair[0], pair.slice(i + 1));
    }
  }
  ZH_MAP_CACHE.set(mapStr, m);
  return m;
}
// 按映射表逐字转换；不在表中的字符原样保留
export function zhConv(s, mapStr) {
  if (!mapStr) return s;
  const m = makeZhMap(mapStr);
  let out = "";
  for (const ch of String(s)) {
    const v = m.get(ch);
    out += v !== undefined ? v : ch;
  }
  return out;
}

/* ---- 短文阅读（用词库高频词写的小文章，配合背单词） ---- */
export const ARTICLES = [
  {
    title: "My New School in Hong Kong",
    titleZh: "我的香港新學校",
    en: "My family moved to Hong Kong last summer. At first, I was nervous about my new school because everything was different. The teachers speak English in class, and my classmates use Cantonese in the playground. But now I think my new school is wonderful.\n\nEvery morning, I wake up early and take the bus with my sister. We usually arrive before the first lesson. In class, our teacher often says, \"Open your book and listen carefully.\" At first, I did not understand much, but I never gave up. I asked questions when I needed help, and my teachers were very patient. They always encourage me to try again.\n\nMy favourite subject is science. We do simple experiments about energy and the environment. I also enjoy art because I can draw and paint. After class, I go to the library to read stories. Reading helps me learn new words every day, and my vocabulary is growing fast.\n\nMaking friends was not easy at the beginning. Some students spoke too fast, but they were friendly and helped me with Cantonese. Now I play football with them during recess. We share our lunch and laugh together. Last month, my class visited a museum, and we took many photographs.\n\nI believe that effort and courage can change everything. My parents are proud of my progress. Next year, I want to join the school choir and make more friends. Hong Kong is my new home now, and my new school is a big part of my future.",
    zh: "去年夏天，我們全家搬到了香港。一開始，我對新學校感到緊張，因為一切都不同。老師在課堂上說英語，同學們在操場上說粵語。但現在我覺得我的新學校很棒。\n\n每天早上，我很早起床，和姐姐一起坐巴士。我們通常在第一堂課前就到達。課堂上，老師常說：「打開你的書，仔細聽。」起初我聽不懂太多，但我從不放棄。需要幫助時我就問問題，老師們都很有耐心，總鼓勵我再試一次。\n\n我最喜歡的科目是科學。我們會做關於能量和環境的簡單實驗。我也喜歡美術，因為可以畫畫。課後，我去圖書館看故事書。閱讀幫助我每天學到新詞，詞彙量增長得很快。\n\n一開始交朋友並不容易。有些同學說話太快，但他們很友善，還教我粵語。現在小息時我和他們一起踢足球。我們分享午餐，一起歡笑。上個月，全班參觀了博物館，我們拍了很多照片。\n\n我相信努力和勇氣可以改變一切。爸爸媽媽為我的進步感到驕傲。明年，我想加入學校合唱團，認識更多朋友。香港現在是我的新家，而我的新學校是我未來重要的一部分。",
  },
  {
    title: "A Visit to the Space Station",
    titleZh: "太空站之旅",
    en: "Last week, my class visited a science museum. The most exciting part was the space station model. A young scientist explained how astronauts live and work in space. I learned many important facts about the universe.\n\nIn space, there is no gravity, so everything floats. Astronauts sleep in special bags and eat food from small packages. They exercise every day to keep their muscles strong. Water is very valuable in space, so they use it carefully. The station gets its power from the sun, which is a clean source of energy.\n\nThe scientist told us that the station travels around the Earth sixteen times every day. That means the astronauts see the sunrise many times! They also take beautiful photographs of our blue planet. From space, you can see the ocean, the mountains, and even the lights of big cities at night.\n\nI asked a question about the future. The scientist said that people will build stations on the Moon and maybe on Mars. He believes that young students like us will become the next generation of engineers and scientists. His words gave me a big dream: one day, I want to travel to space.\n\nThat evening, I looked at the stars and thought about our small planet. I felt both excited and humble. The universe is huge, but our Earth is still the only home we have. We must protect it with knowledge and wisdom, and we must never stop asking questions.",
    zh: "上星期，我們班參觀了科學館。最精彩的部分是太空站模型。一位年輕的科學家講解了太空人如何在太空中生活和工作。我學到了很多關於宇宙的重要知識。\n\n在太空中沒有重力，所有東西都會飄起來。太空人睡在特別的睡袋裡，吃小包裝的食物。他們每天做運動，保持肌肉強壯。水在太空中非常珍貴，所以要小心使用。太空站的電力來自太陽，這是清潔的能源。\n\n科學家告訴我們，太空站每天繞地球十六圈。也就是說，太空人一天能看到很多次日出！他們還拍下了我們藍色星球的美麗照片。從太空可以看到海洋、山脈，甚至夜晚大城市的燈光。\n\n我問了一個關於未來的問題。科學家說，人類將來會在月球上建太空站，也許還會在火星上。他相信像我們這樣的年輕學生會成為下一代工程師和科學家。他的話給了我一個大夢想：有一天，我想去太空旅行。\n\n那天晚上，我看著星星，想著我們的小星球。我感到既興奮又謙卑。宇宙很大，但地球仍然是我們唯一的家。我們必須用知識和智慧保護它，永遠不要停止發問。",
  },
  {
    title: "How to Keep Our Planet Healthy",
    titleZh: "如何保護我們的地球",
    en: "Our planet is beautiful, but it is facing many problems. Pollution, waste, and climate change are damaging the environment. The good news is that everyone, including children, can help. Small actions can make a big difference.\n\nFirst, we can reduce waste. Instead of buying new things all the time, we can repair and reuse them. At school, we put paper and bottles into recycling bins. We also bring our own water bottles so we do not need plastic cups. These simple choices save energy and protect nature.\n\nSecond, we can save water and electricity. We turn off the lights when we leave a room, and we take short showers. My family hangs clothes outside to dry instead of using a machine. These habits are easy to keep, and they help our environment.\n\nThird, we can protect plants and animals. Trees clean the air and give us shade. Animals need safe habitats to live. In our neighbourhood, we plant flowers in the garden to help bees and butterflies. My friends and I also join the beach cleaning activity every month. We collect rubbish and sort it carefully.\n\nI believe education is the key. When we learn about the environment, we understand how to make better choices. Our teachers say that children are the leaders of tomorrow. If we work together with honesty and patience, we can build a greener future for everyone.",
    zh: "我們的地球很美麗，但也面臨很多問題。污染、浪費和氣候變化正在破壞環境。好消息是，每個人——包括小朋友——都可以出一分力。小小的行動可以帶來很大的改變。\n\n首先，我們可以減少浪費。與其常常買新東西，不如修理和重用。在學校，我們把紙張和瓶子放進回收箱。我們還自備水樽，這樣就不需要膠杯。這些簡單的選擇節省能源，保護大自然。\n\n第二，我們可以節約用水和用電。離開房間時關燈，洗澡時間短一點。我的家人把衣服掛在室外晾乾，而不是用機器。這些習慣很容易堅持，而且對環境有幫助。\n\n第三，我們可以保護植物和動物。樹木淨化空氣，為我們遮蔭。動物需要安全的棲息地。在我們的社區，我們在花園種花，幫助蜜蜂和蝴蝶。我和朋友每個月還參加清潔沙灘的活動。我們收集垃圾並仔細分類。\n\n我相信教育是關鍵。當我們了解環境，就會懂得做出更好的選擇。老師說，孩子是明天的領袖。如果我們用誠實和耐心一起努力，就能為每個人建設更綠色的未來。",
  },
  {
    title: "My Best Friend",
    titleZh: "我最好的朋友",
    en: "Everyone needs a good friend. My best friend is a boy called Tim. We met in primary school, and we have been friends for three years. We sit next to each other in class and walk home together after school.\n\nTim is funny and honest. When I make a mistake, he always tells me the truth in a kind way. He is also very helpful. Last term, I was sick for a week, and Tim brought my homework to my home every day. He even explained the maths lessons to me.\n\nWe share many hobbies. We both love football and often play in the park at the weekend. We also enjoy drawing. Sometimes we enter small art competitions together. Tim says that art is a way to express our feelings.\n\nOf course, friends sometimes argue. Once, we had a big argument about a game. We did not speak for two days, and I felt sad. Then Tim said sorry first. I learned that friendship is more important than winning an argument.\n\nNow I understand the true meaning of friendship. A good friend shares your joy and supports you in difficult times. I hope our friendship will last forever.",
    zh: "每個人都需要好朋友。我最好的朋友是一個叫 Tim 的男孩。我們在小學認識，已經是三年好朋友。我們在課堂上坐在一起，放學後一起走路回家。\n\nTim 很有趣，也很誠實。當我犯錯時，他總是用友善的方式告訴我真相。他也很樂於助人。上個學期我病了一星期，Tim 每天把功課帶到我家，甚至給我講解數學課。\n\n我們有很多共同愛好。我們都喜歡足球，週末常常在公園踢球。我們也喜歡畫畫，有時一起參加小型美術比賽。Tim 說，藝術是表達情感的一種方式。\n\n當然，朋友有時也會吵架。有一次我們為了一個遊戲大吵一架，兩天沒說話，我很難過。後來 Tim 先道歉。我學會了：友誼比贏得爭吵更重要。\n\n現在我明白了友誼的真正意義。好朋友分享你的快樂，在困難時支持你。我希望我們的友誼永遠長久。",
  },
  {
    title: "A Day at the Beach",
    titleZh: "沙灘的一天",
    en: "Last Saturday, my family went to a beach in Hong Kong. The weather was perfect: the sun was bright, and a gentle wind came from the sea. We left home early in the morning to avoid the crowd.\n\nWhen we arrived, the beach was already full of happy families. We found a good spot under a big umbrella. My sister and I quickly changed into our swimsuits and ran to the water. The waves were cool and refreshing.\n\nWe built a huge sandcastle near the water. We used buckets and small tools, and we decorated the castle with shells. A little boy came to help us. We became friends in just one morning!\n\nAt noon, we ate sandwiches and fresh fruit for lunch. Mother reminded us to drink enough water because the sun was strong. After lunch, we collected beautiful shells along the shore. I found a pink one with a perfect shape.\n\nIn the afternoon, we played beach volleyball with another family. Everyone laughed when the ball flew into the water. Before we went home, we cleaned up our rubbish to keep the beach beautiful.\n\nThat evening, I felt tired but very happy. The beach is a wonderful place to relax and enjoy nature with the people you love.",
    zh: "上星期六，我們一家去了香港的一個沙灘。天氣好極了：陽光明媚，海面吹來柔和的風。我們一大早就出門，避開人群。\n\n到達時，沙灘已經滿是快樂的家庭。我們在一把大太陽傘下找到好位置。我和妹妹很快換上泳衣，跑向大海。海浪清涼又舒服。\n\n我們在水邊建了一座大沙堡，用水桶和小工具，還用貝殼裝飾。一個小男孩過來幫忙，我們一個早上就成了朋友！\n\n中午，我們吃三文治和新鮮水果當午餐。媽媽提醒我們要多喝水，因為太陽很猛。午餐後，我們沿著海邊收集美麗的貝殼。我找到一個粉紅色、形狀完美的。\n\n下午，我們和另一個家庭打沙灘排球。球飛進水裡時，大家都笑了。回家前，我們清理了自己的垃圾，讓沙灘保持美麗。\n\n那天晚上，我覺得很累但很開心。沙灘是和心愛的人一起放鬆、享受大自然的好地方。",
  },
  {
    title: "My Lovely Pet",
    titleZh: "我可愛的寵物",
    en: "Do you have a pet? I have a lovely cat called Mimi. She is white and grey with big green eyes. My parents gave her to me as a birthday present two years ago. She was very small then, but now she has grown into a beautiful cat.\n\nMimi has a funny personality. In the morning, she wakes me up by sitting on my bed. She always wants her breakfast first. She loves fish and milk, but she is also curious about everything in the house.\n\nMimi is very smart. She knows how to open the door of my room with her paw! Sometimes she brings me small toys and asks me to play with her. When I do my homework, she quietly sleeps beside me.\n\nTaking care of a pet is not always easy. I need to feed her, clean her bowl, and take her to the doctor when she is sick. I also brush her fur every day. But every moment with her is full of joy.\n\nI have learned a lot from keeping a pet. Animals have feelings too, and they need our love and patience. Mimi is not just a pet; she is a member of our family. I will protect her and love her forever.",
    zh: "你有寵物嗎？我有一隻可愛的貓，叫 Mimi。她白灰色，有一雙綠色大眼睛。兩年前爸爸媽媽把她送給我當生日禮物。那時她很小，現在已經長成一隻漂亮的貓。\n\nMimi 的性格很有趣。早上，她會坐在我的床上把我叫醒，總是想先吃早餐。她喜歡魚和牛奶，但對家裡的每樣東西都很好奇。\n\nMimi 很聰明。她知道用爪子打開我房間的門！有時她會叼來小玩具，叫我陪她玩。我做功課時，她就靜靜地睡在我旁邊。\n\n照顧寵物並不總是容易。我要餵她、清洗她的碗、生病時帶她看醫生，每天還要幫她梳毛。但和她在一起的每一刻都充滿快樂。\n\n養寵物讓我學到很多。動物也有感情，牠們需要我們的愛和耐心。Mimi 不只是寵物，她是我們家的一員。我會永遠保護她、愛她。",
  },
  {
    title: "The Four Seasons in Hong Kong",
    titleZh: "香港的四季",
    en: "Hong Kong has four seasons, and each one has its own beauty. Spring arrives in March. The weather becomes warm and wet, and flowers open everywhere. The air is fresh after the rain, and birds sing in the trees.\n\nSummer is long and hot. The temperature often rises above thirty degrees. People wear light clothes and drink cold drinks. Many families go to the beach or swim in the pool. Sometimes typhoons bring strong wind and heavy rain, and schools close for safety.\n\nAutumn is my favourite season. The sky is clear and blue, and the weather is cool and comfortable. This is the best time for outdoor activities. Last October, my class went hiking on a mountain and enjoyed the wonderful view of the sea.\n\nWinter in Hong Kong is mild. It is not as cold as in other countries, but we still wear sweaters and coats. During the New Year, families gather together and share delicious food. The streets are full of lights and happy faces.\n\nEvery season teaches me something different. Spring gives us hope, summer gives us energy, autumn gives us peace, and winter gives us warmth at home. I am thankful to live in a place with such rich and changing nature.",
    zh: "香港有四個季節，每個季節都有它的美。春天在三月到來，天氣變得溫暖潮濕，到處鮮花盛開。雨後空氣清新，鳥兒在樹上唱歌。\n\n夏天又長又熱，氣溫常常升到三十度以上。人們穿輕薄的衣服，喝冷飲。很多家庭去沙灘或泳池游泳。有時颱風帶來強風暴雨，學校會為了安全而停課。\n\n秋天是我最喜歡的季節。天空晴朗蔚藍，天氣涼爽舒適，是戶外活動的最好時機。去年十月，我們班去行山，欣賞了美麗的海景。\n\n香港的冬天很溫和，不像其他國家那麼冷，但我們還是會穿毛衣和外套。新年時，家人聚在一起分享美食，街上滿是燈光和笑臉。\n\n每個季節都教會我不同的東西。春天給我們希望，夏天給我們活力，秋天給我們寧靜，冬天給我們家的溫暖。我很感恩生活在這樣一個自然豐富多變的地方。",
  },
  {
    title: "Food Around the World",
    titleZh: "世界各地的美食",
    en: "Food is one of the most interesting parts of every culture. Last month, our school held an international food festival. Every class chose a country and prepared its famous dishes. It was a delicious journey around the world!\n\nOur class chose Italy. We made pasta with tomato sauce and cheese. My friend's class chose Japan and prepared sushi and green tea. Another class cooked dumplings for China, and the students explained the history of this traditional food.\n\nThe most popular table was the dessert corner. There were French cakes, Spanish churros, and Hong Kong egg tarts. Everyone waited patiently in the long queue. The teachers also joined us and enjoyed the food.\n\nI learned that food can tell us many stories. Ingredients, cooking methods, and even the way people eat show the history and values of a place. Sharing food is also a warm way to make friends.\n\nAfter the festival, I tried to cook fried rice at home with my mother. It was not perfect, but my family said it tasted great. Now I want to learn more about food from different countries, and one day I hope to travel and taste the real dishes in their hometowns.",
    zh: "食物是每種文化最有趣的部分之一。上個月，我們學校舉辦了國際美食節。每個班選擇一個國家，準備它的著名菜式。這是一次美味的環球之旅！\n\n我們班選了意大利，做了番茄醬芝士意粉。朋友的班選了日本，準備了壽司和綠茶。另一個班為中國包了餃子，同學們還介紹了這種傳統食物的歷史。\n\n最受歡迎的是甜品角，有法國蛋糕、西班牙油條和香港蛋撻。大家耐心地在長長的隊伍中排隊。老師們也加入我們，一起享受美食。\n\n我學到，食物可以告訴我們很多故事。食材、烹調方法，甚至人們進食的方式，都展現一個地方的歷史和價值觀。分享食物也是交朋友的溫暖方式。\n\n美食節後，我和媽媽在家嘗試炒飯。雖然不算完美，但家人說很好吃。現在我想認識更多不同國家的食物，希望有一天去旅行，親口品嚐當地的真正美食。",
  },
  {
    title: "Our School Sports Day",
    titleZh: "學校運動會",
    en: "Sports Day is the most exciting event of our school year. It happens every November. Students from all classes wear colourful T-shirts and gather in the playground. Parents come to watch and cheer for us.\n\nThe day starts with a short opening ceremony. The head teacher gives a speech about teamwork and courage. Then the races begin! There are short runs, long runs, and relay races. I joined the relay race with three classmates.\n\nMy heart was beating fast before my turn. When I received the baton, I ran as fast as I could. Our team finished second! We were a little disappointed at first, but our teacher said that winning is not everything, and that we tried our best and worked together. We all smiled and cheered for the champions.\n\nBetween the races, there were fun games for everyone. Some students played jump rope, and others did a funny three-legged race. The whole playground was full of laughter.\n\nAt the end, the winners received medals, and every class received a certificate for joining. I learned that sport is not only about winning. It is about health, friendship, and never giving up. Next year, I will train harder and try to win the race!",
    zh: "運動會是我們學校一年中最精彩的活動，每年十一月舉行。各班同學穿上色彩繽紛的 T 恤，聚集在操場。家長們也來觀看，為我們打氣。\n\n當天以簡短的開幕禮開始，校長發表了關於團隊合作和勇氣的講話。然後比賽開始了！有短跑、長跑和接力賽。我和三位同學參加了接力賽。\n\n輪到我之前，心跳得很快。接到接力棒後，我拼命地跑。我們隊得了第二名！起初有點失望，但老師說，贏不是一切，我們盡了力，而且合作得很好。我們都笑了，也為冠軍歡呼。\n\n比賽之間還有各種好玩的遊戲。有同學跳繩，也有人玩搞笑的三足賽跑。整個操場充滿歡笑。\n\n最後，得獎者獲得獎牌，每個班都獲得參與證書。我學到，運動不只是為了贏，而是關於健康、友誼和永不放棄。明年我會更努力訓練，爭取贏得比賽！",
  },
];
