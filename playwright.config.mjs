// Playwright E2E：关键用户流回归（背单词轨迹 / 考试数学判分 / 字母游戏 / AI 私教）。
// webServer 用项目自己的零依赖 server（server/index.mjs）——与 Docker 部署同一条服务路径。
import { defineConfig } from "@playwright/test";

const PORT = 8790;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  retries: 0,
  workers: 1, // 共享轨迹状态，串行执行避免 localStorage 竞争
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1280, height: 860 },
  },
  webServer: {
    command: `node server/index.mjs`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    env: { PORT: String(PORT), HOST: "127.0.0.1" },
    reuseExistingServer: false,
    timeout: 15000,
  },
});
