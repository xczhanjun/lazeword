// 关键流 3：字母組詞游戏 —— 棋盘/词单渲染的回归钉
import { test, expect } from "@playwright/test";

test("字母組詞：進入遊戲 → 棋盤與目標詞渲染", async ({ page }) => {
  await page.goto("/?user=anna&tab=game");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.locator("#gameLetterBtn").click();
  await expect(page.locator("#letterArea")).toBeVisible();

  // 目标词 chips（中文释义，≥5 个）
  const chips = page.locator("#letterArea .letter-chip");
  await expect(chips.first()).toBeVisible();
  expect(await chips.count()).toBeGreaterThanOrEqual(5);
  // 棋盘格子渲染（7×7=49）
  const cells = page.locator("#letterArea .letter-cell, #letterArea button.letter-cell, #letterGrid button");
  expect(await cells.count()).toBeGreaterThanOrEqual(49);
});
