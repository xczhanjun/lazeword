// 关键流 1：背单词 —— 认识 → know 事件写入轨迹（事件溯源根基的回归钉）
import { test, expect } from "@playwright/test";

test("背单词：點擊認識 → know 事件寫入軌跡", async ({ page }) => {
  await page.goto("/?user=anna&tab=learn");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const before = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    return (s.anna && s.anna.trajectory) ? s.anna.trajectory.length : 0;
  });

  await expect(page.locator("#knowBtn")).toBeVisible();
  await page.locator("#knowBtn").click();

  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    const traj = s.anna && s.anna.trajectory;
    return { count: traj ? traj.length : 0, lastType: traj && traj.length ? traj[traj.length - 1].type : null };
  });
  expect(after.count).toBe(before + 1);
  expect(after.lastType).toBe("know");
});
