/* lazeword 数学 pack：算术练习生成器（确定性：同 seed 恒同题）。
 * 自编纯函数（本仓库作者原创），依赖 core 的 mulberry32。 */
export function packMathUniqueOpts(ans, rng, count = 4) {
  const set = new Set([ans]);
  let guard = 0;
  while (set.size < count && guard++ < 100) {
    const d = 1 + ((rng() * 9) | 0);
    const cand = ans + (rng() < 0.5 ? d : -d);
    set.add(cand >= 1 ? cand : ans + d); // 儿童用户：选项恒为正整数
  }
  const arr = [...set];
  // 确定性洗牌（同一 rng 流同一顺序）
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// op ∈ add/sub/mul/div/mix；difficulty 1=20以内/表内乘除，2=两位整数，3=三位整数
export function generateArithmetic(op = "mix", difficulty = 1, seed = 0) {
  const rng = mulberry32(seed);
  const rint = (lo, hi) => lo + ((rng() * (hi - lo + 1)) | 0);
  const ops = op === "mix" ? ["add", "sub", "mul", "div"][(rng() * 4) | 0] : op;
  let a, b, ans, sym;
  const D = { 1: [1, 20], 2: [11, 99], 3: [101, 999] }[difficulty] || [1, 20];
  const [lo, hi] = D;
  if (ops === "add") { b = rint(lo, hi); a = rint(1, Math.max(1, hi - b)); ans = a + b; sym = "+"; }
  else if (ops === "sub") { a = rint(2, hi); b = rint(1, a - 1); ans = a - b; sym = "−"; }
  else if (ops === "mul") {
    const cap = difficulty === 1 ? 9 : 12;
    a = rint(2, cap); b = rint(2, cap); ans = a * b; sym = "×";
  }
  else { b = rint(2, difficulty === 1 ? 9 : 12); ans = rint(2, difficulty === 1 ? 9 : 20); a = b * ans; sym = "÷"; }
  const opts = packMathUniqueOpts(ans, rng);
  // op 返回解析后的运算类型（add/sub/mul/div），供数学易错题诊断归类（docs/adaptive-learning.md）
  return { q: a + " " + sym + " " + b + " = ？", a: ans, opts, op: ops };
}
