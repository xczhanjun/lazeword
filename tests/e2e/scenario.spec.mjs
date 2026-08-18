// 关键流 5：场景分享 —— 载入入门场景包 → 运行场景 → 考试引擎接管（laze.json 消费链路回归钉）
import { test, expect } from "@playwright/test";

test("場景分享：載入入門包 → 運行場景 → 考試題目就位", async ({ page }) => {
  await page.goto("/?user=anna&tab=learn");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 场景包已构建注入 + 一键载入
  const injected = await page.evaluate(() => Array.isArray(STARTER_SCENARIOS) && STARTER_SCENARIOS.length);
  expect(injected).toBeGreaterThanOrEqual(48);

  await page.evaluate(() => { loadStarterScenarios(); });
  const count = await page.evaluate(() => loadScenarios().length);
  expect(count).toBeGreaterThanOrEqual(48);

  // 运行第一个场景 → 跳到考试 tab，题目为场景词
  await page.evaluate(() => scenarioRun(0));
  await expect(page.locator("#quizChoices .choice").first()).toBeVisible();
  const total = await page.evaluate(() => quizQuestions.length);
  expect(total).toBeGreaterThan(0);
});
