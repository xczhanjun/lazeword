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

test("今日 10 词：释义默认隐藏，点一下回忆后揭晓", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const first = page.locator("#dailyList .daily-item").first();
  // 释义默认隐藏（先回忆）
  await expect(first.locator(".m")).not.toBeVisible();
  // 点一下 → 揭晓释义
  await first.locator(".daily-main").click();
  await expect(first.locator(".m")).toBeVisible();
});

test("场景下拉：选高级专属词表自动加载（不再 0 词）", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 找一个「基础模式 0 词、全量有词」的高级场景
  const sceneKey = await page.evaluate(() => {
    const has = (words, s) => words.some(w => w.c === s || (w.cs && w.cs.includes(s)));
    const basic = WORDS.filter(w => w.b);
    return SCENE_CATS_ALL.map(c => c.key).find(s => !has(basic, s) && has(WORDS, s));
  });
  expect(sceneKey).toBeTruthy();

  // 选该场景 → 自动开启高级模式并加载
  await page.selectOption("#sceneFilter", sceneKey);
  const advanced = await page.evaluate(() => settings.advancedMode);
  expect(advanced).toBe(true);
  const count = await page.evaluate(() => filteredWords().length);
  expect(count).toBeGreaterThan(0);
});
