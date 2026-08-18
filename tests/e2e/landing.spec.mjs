// 关键流 10：默认落地——打开即「今日 10 词」，不再是一堵 15233 词的墙
import { test, expect } from "@playwright/test";

test("默认落地：打开即今日 10 词（默认 tab = 今日，非全量词库）", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 今日面板是激活态（默认落地）
  await expect(page.locator("#panel-daily")).toHaveClass(/active/);
  // 今日列表恰好 10 个词
  expect(await page.locator("#dailyList .daily-item").count()).toBe(10);
  // 导航第一个 tab 是「今日」且处于激活态
  await expect(page.locator(".tab-btn").first()).toHaveClass(/active/);
  expect(await page.locator(".tab-btn.active .tab-lbl").textContent()).toBe("今日");
  // 全量词库面板不是默认落地
  await expect(page.locator("#panel-learn")).not.toHaveClass(/active/);
});
