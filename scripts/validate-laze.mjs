/**
 * laze.json 场景校验：所有场景文件（starter.json + 任意 *.laze.json）对
 * laze.schema.json 做 JSON Schema 校验（ajv，devDependency，仅构建/CI 用）。
 * 这是「可互操作标准」的机器门——外部 agent 生成的场景先过这一关。
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(root, "laze.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile(schema);

const files = [];
// 场景农场产物（数组容器：拆成单个场景校验）
const starterPath = join(root, "data/scenarios/starter.json");
if (existsSync(starterPath)) {
  const arr = JSON.parse(readFileSync(starterPath, "utf8"));
  arr.forEach((s, i) => { if (!check(s, `starter.json[${i}]`)) process.exitCode = 1; });
}
// 任意 .laze.json 文件（data/ 下递归）
function scan(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) scan(p);
    else if (f.name.endsWith(".laze.json") && !check(JSON.parse(readFileSync(p, "utf8")), p)) process.exitCode = 1;
  }
}
if (existsSync(join(root, "data"))) scan(join(root, "data"));

function check(scene, label) {
  const ok = validate(scene);
  if (!ok) {
    console.error(`✗ ${label}:`);
    for (const e of validate.errors.slice(0, 5)) console.error(`    ${e.instancePath || "/"} ${e.message}`);
    return false;
  }
  return true;
}

if (process.exitCode !== 1) console.log("laze.json 校验通过：所有场景符合 laze.schema.json");
