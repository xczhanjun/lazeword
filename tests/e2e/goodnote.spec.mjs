// 关键流 6：向善笔记 —— 写下想法 → goodnote 轨迹事件（家长可查的回归钉）
import { test, expect } from "@playwright/test";

test("向善筆記：寫入 → goodnote 事件入軌跡", async ({ page }) => {
  await page.goto("/?user=anna&tab=ref");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 参考 tab → ai-good 区
  await page.evaluate(() => { refSection = "ai-good"; renderRef(); });
  await expect(page.locator("#goodNoteInput")).toBeVisible();

  const before = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    return (s.anna && s.anna.trajectory) ? s.anna.trajectory.length : 0;
  });

  await page.locator("#goodNoteInput").fill("我想用 AI 保護動物");
  await page.locator("button", { hasText: "寫入筆記" }).first().click();

  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    const traj = s.anna && s.anna.trajectory;
    const last = traj && traj.length ? traj[traj.length - 1] : null;
    return { count: traj ? traj.length : 0, type: last && last.type, text: last && last.text };
  });
  expect(after.count).toBe(before + 1);
  expect(after.type).toBe("goodnote");
  expect(after.text).toBe("我想用 AI 保護動物");
});
