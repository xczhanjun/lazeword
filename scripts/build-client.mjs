#!/usr/bin/env node
// build-client.mjs — 生成 lib/client.js：把独立 App HTML 嵌入客户端 bundle。
// 用法：node scripts/build-client.mjs（需先运行 scripts/build.mjs）
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const app = readFileSync(path.join(root, "app/lazeword.html"), "utf8");
const tpl = readFileSync(path.join(root, "lib/client.template.js"), "utf8");

if (!tpl.includes("__APP_HTML__")) throw new Error("client template missing __APP_HTML__ marker");
// JSON.stringify 安全嵌入（转义引号/换行/反斜杠）
const out = tpl.replace("__APP_HTML__", JSON.stringify(app));

writeFileSync(path.join(root, "lib/client.js"), out);
console.log(`built lib/client.js (${(out.length / 1024).toFixed(0)} KB)`);
