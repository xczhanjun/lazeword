// 关键流 8：单词挖雷（简化版 3×3）——点击路径回归钉（此前「点击不了」的教训）
import { test, expect } from "@playwright/test";

test("挖雷：3×3 开局示范 → 点安全格翻词 → 踩雷答对拆掉", async ({ page }) => {
  await page.goto("/?user=anna&tab=game");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // 挖雷在高级模式（基础模式只留字母组词）
  await page.evaluate(() => { settings.advancedMode = true; saveSettings(); applyModeVisibility(); });

  await page.locator("#gameMineBtn").click();
  await expect(page.locator("#mineBoard")).toBeVisible();

  // 3×3 九宫格 + 开局自动翻开一张
  expect(await page.locator("#mineBoard .mine-cell").count()).toBe(9);
  const autoRevealed = await page.evaluate(() => window.__mineState.revealed.size);
  expect(autoRevealed).toBeGreaterThanOrEqual(1);

  // 点击一个安全格 → 翻出单词
  const safeIdx = await page.evaluate(() => {
    const s = window.__mineState;
    for (let i = 0; i < 9; i++) if (!s.field.mines.has(i) && !s.revealed.has(i)) return i;
    return -1;
  });
  expect(safeIdx).toBeGreaterThanOrEqual(0);
  await page.locator(`#mineBoard [data-i="${safeIdx}"]`).click();
  await expect(page.locator(`#mineBoard [data-i="${safeIdx}"]`)).not.toHaveClass(/hidden/);

  // 踩雷 → 答题面板出现 → 答对 → 拆掉（不爆炸，继续玩）
  const mineIdx = await page.evaluate(() => [...window.__mineState.field.mines][0]);
  await page.locator(`#mineBoard [data-i="${mineIdx}"]`).click();
  await expect(page.locator("#mineQ")).toBeVisible();
  const correctWord = await page.evaluate(() => {
    const s = window.__mineState;
    return s.mineWords[[...s.field.mines].indexOf(s.pending)].w;
  });
  await page.locator(`#mineQOpts [data-w="${correctWord}"]`).click();
  const defused = await page.evaluate(() => window.__mineState.defused.size);
  expect(defused).toBe(1);
  // 游戏未结束（答错不再爆炸）
  const won = await page.evaluate(() => window.__mineState.won);
  expect(won).toBe(false);
});
