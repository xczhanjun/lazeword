// 关键流 2：考试数学判分 —— 回归钉：答案值 vs 选项索引的潜伏 bug（修复后数学题可答对）
import { test, expect } from "@playwright/test";

test("數學題：點正確選項 → 得分 +1（索引判分回歸）", async ({ page }) => {
  await page.goto("/?user=anna&tab=quiz");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.selectOption("#quizDirection", "arith");
  await page.locator("#startQuizBtn").click();

  await expect(page.locator("#quizChoices .choice").first()).toBeVisible();
  // 从运行时拿到正确答案索引（判分修复的契约：answer 是选项下标）
  const answerIdx = await page.evaluate(() => quizQuestions[0].answer);
  expect(answerIdx).toBeGreaterThanOrEqual(0);
  expect(answerIdx).toBeLessThan(4);

  await page.locator("#quizChoices .choice").nth(answerIdx).click();
  await expect(page.locator("#quizScore")).toHaveText("1", { timeout: 3000 });
});
