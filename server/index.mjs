/**
 * lazeword 零依赖服务器（Node 22.19+ / 24+，Web 标准全局 Request/Response）。
 * 静态服务 app/（单文件应用）+ /api/* 后端（与 Cloudflare Worker 共用 handlers.js）。
 *
 * 用法：node server/index.mjs
 * 环境变量：
 *   PORT              监听端口（默认 8000）
 *   HOST              监听地址（默认 0.0.0.0）
 *   DEEPSEEK_API_KEY  可选：托管 DeepSeek key（不下发到浏览器）；缺省时 AI 端点返回 500，客户端自动降级
 *
 * Docker/NixOS 部署见 docs/deployment.md。
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { handleFetch } from "../worker/handlers.js";

const ROOT = fileURLToPath(new URL("../app/", import.meta.url));
const PORT = parseInt(process.env.PORT || "8000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const ENV = { DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "" };

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

// 静态文件：根路径默认入口 lazeword.html；normalize + 前缀检查防路径穿越
async function staticFile(pathname) {
  let p = pathname;
  if (p === "/" || p === "/index.html") p = "/lazeword.html";
  let file;
  try { file = normalize(join(ROOT, decodeURIComponent(p))); } catch { return null; }
  if (!file.startsWith(ROOT)) return null; // 路径穿越守卫
  try {
    const data = await readFile(file);
    const type = MIME[extname(file).toLowerCase()] || "application/octet-stream";
    return new Response(data, { headers: { "Content-Type": type, "Cache-Control": "no-cache" } });
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    // API：交给与 CF Worker 共用的处理器（Request 全局在 Node 22.19+ 可用）
    if (url.pathname.startsWith("/api/")) {
      const request = new Request(url.href, {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
        duplex: "half", // Node 流 body 必需（undici 规范）
      });
      const resp = await handleFetch(request, ENV);
      res.writeHead(resp.status, Object.fromEntries(resp.headers));
      res.end(Buffer.from(await resp.arrayBuffer()));
      return;
    }
    // 静态文件
    const file = await staticFile(url.pathname);
    if (file) {
      res.writeHead(200, Object.fromEntries(file.headers));
      res.end(Buffer.from(await file.arrayBuffer()));
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("not found");
  } catch (e) {
    console.error("server error:", e);
    if (!res.headersSent) { res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }); res.end("internal error"); }
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`lazeword: http://${HOST}:${PORT} (AI 端点 ${ENV.DEEPSEEK_API_KEY ? "已配置 key" : "未配置——客户端自动降级"})`);
});
