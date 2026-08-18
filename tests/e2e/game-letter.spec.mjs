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

test("字母組詞：錯詞優先——錯題本的詞排最前（遊戲即複習）", async ({ page }) => {
  await page.goto("/?user=anna&tab=game");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 选一个满足字母组词条件的词（≥5 字母、纯 ASCII）标记为错词
  // 注意：wrong 存的是词的 .i（全局词条 id），不是数组下标
  const expected = await page.evaluate(() => {
    const w = WORDS.find(w => /^[a-zA-Z][a-zA-Z' -]{4,}$/.test(w.w) && !/[一-鿿]/.test(w.w));
    mutateUser(u => { u.wrong = [w.i]; });
    return { full: w.w.toLowerCase() };
  });
  expect(expected.full).toBeTruthy();

  await page.locator("#gameLetterBtn").click();
  await expect(page.locator("#letterArea")).toBeVisible();

  // 错词排最前：targets[0].full 即错词
  const first = await page.evaluate(() => window.__letterState.targets[0]);
  expect(first.full).toBe(expected.full);
});
