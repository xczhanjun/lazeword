/**
 * lazeword Cloudflare Worker — 薄适配器。
 * 全部路由逻辑在 handlers.js（与 Node/容器共用，见 docs/deployment.md）。
 *
 * 部署：wrangler deploy（先 wrangler secret put DEEPSEEK_API_KEY）
 * 本地：wrangler dev
 */
import { handleFetch } from "./handlers.js";

export default {
  async fetch(request, env) {
    return handleFetch(request, env);
  },
};
