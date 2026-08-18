// 关键流 7：家务打卡 —— 选家务 → 英语输入 → chore 轨迹事件（友愛+英语表达回归钉）
import { test, expect } from "@playwright/test";

test("家務打卡：選家務 → 英語一句 → chore 事件入軌跡", async ({ page }) => {
  await page.goto("/?user=anna&tab=chores");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator("#choresBody")).toContainText("家務");
  // 选第一件家务（chips 按 filteredWords 顺序）
  const picked = await page.evaluate(() => {
    const w = choreWords()[0];
    chorePick(w.i);
    return w.w;
  });
  await page.locator("#choreEnInput").fill("I washed the dishes.");
  const before = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    return (s.anna && s.anna.trajectory) ? s.anna.trajectory.length : 0;
  });
  await page.locator("button", { hasText: "記錄下來" }).click();

  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("vocab947_progress_v1") || "{}");
    const traj = s.anna && s.anna.trajectory;
    const last = traj && traj.length ? traj[traj.length - 1] : null;
    return { count: traj ? traj.length : 0, type: last && last.type, text: last && last.text, r: last && last.r };
  });
  expect(picked).toBeTruthy();
  expect(after.count).toBe(before + 1);
  expect(after.type).toBe("chore");
  expect(after.text).toBe("I washed the dishes.");
  expect(after.r).toBeGreaterThanOrEqual(1);
  expect(after.r).toBeLessThanOrEqual(3);
});
