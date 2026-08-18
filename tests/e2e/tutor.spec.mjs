// 关键流 4：AI 私教 —— 备课 → 练习答对 → know 事件写回轨迹（私教闭环回归钉）
import { test, expect } from "@playwright/test";

test("私教：開課 → 練習答對 → know 事件寫回軌跡", async ({ page }) => {
  await page.goto("/?user=anna&tab=tutor");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator("#tutorBody h2")).toContainText("AI 私教");
  await page.locator("#tutorBody button", { hasText: "開始上課" }).click();
  await expect(page.locator("#tutorBody")).toContainText("講解");

  await page.locator("#tutorBody button", { hasText: "跳過講解" }).click();
  await expect(page.locator("#tutorBody .choice").first()).toBeVisible();

  const before = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    return (s.anna && s.anna.trajectory) ? s.anna.trajectory.length : 0;
  });

  // 答对第一题（从运行时拿正确选项下标）
  const ok = await page.evaluate(() => {
    const s = tutorSession, q = s.questions[s.qIdx];
    const oi = q.opts.indexOf(q.correct);
    answerTutorChoice(null, oi);
    return oi >= 0;
  });
  expect(ok).toBe(true);

  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    const traj = s.anna && s.anna.trajectory;
    return { count: traj ? traj.length : 0, lastType: traj && traj.length ? traj[traj.length - 1].type : null };
  });
  expect(after.count).toBe(before + 1);
  expect(after.lastType).toBe("know");
});
