# 确定性部署（Docker / NixOS / Cloudflare）

> lazeword 的部署哲学与产品哲学一致：**时空确定性**。
> 同一 commit → 同一产物 → 同一容器镜像 → 同一行为。升级路径显式、可回放、可审计。

## 三种部署形态

| 形态 | 工具 | 说明 |
|---|---|---|
| 单文件 | 任意静态服务器 | `app/lazeword.html` 一个文件即可运行（AI 功能降级为直连/离线） |
| 容器 | Docker（本文件） | 静态 + 零依赖 API server（/api/* 与 Cloudflare Worker 共用 handlers.js） |
| NixOS | flake.nix | 声明式包 + systemd 服务，flake.lock 固定整个依赖图 |
| Serverless | Cloudflare Worker | `worker/index.js`（薄适配器）+ `wrangler secret put DEEPSEEK_API_KEY` |

## 确定性手段（各形态对应）

1. **产物可复现**：CI 已强制 `npm run build` 后 `git diff --exit-code -- app/lazeword.html lib/client.js`
   ——同一个 commit 构建出的产物逐位一致。
2. **Docker**：基础镜像按 **digest 固定**（`FROM node:24-alpine@sha256:…`，无浮动 tag）；
   零 npm 依赖（无 install 层）；构建期跑 `npm run build` + `npm test`（含 pack 质量门）；
   运行时非 root、HEALTHCHECK 走 `/api/health`。升级依赖 = 显式改 digest + 重新构建验证。
3. **Nix**：`flake.lock` 固定 nixpkgs 与 nodejs 版本；构建是纯函数 derivation；
   systemd 服务只读挂载包目录。
4. **Cloudflare**：`wrangler.toml` + handlers.js 单一事实源（与 Node 容器共用，行为一致）。

## Docker

```sh
docker build -t lazeword:$(git rev-parse --short HEAD) .
docker run -d -p 8000:8000 \
  -e DEEPSEEK_API_KEY=sk-... \   # 可选：缺省时 AI 端点 500，客户端自动降级
  --name lazeword lazeword:$(git rev-parse --short HEAD)
# 验证
curl http://127.0.0.1:8000/api/health   # {"ok":true,...}
open http://127.0.0.1:8000/             # 单文件应用
```

- 镜像标签用 git sha；「latest」只作为本地便捷名，不用于部署声明。
- 数据说明：进度默认存浏览器 localStorage；`/api/progress/:user` 的持久化互通
  由 dsh-vocab 服务器承担（lazeword 的 server 不实现多端进度持久化，客户端静默降级）。

## Cloudflare（deepedu.me，轻量级：单 worker 零服务器）

**lazeword**（静态 app + /api/* 同一个 worker，Workers Assets 同源托管）：

```sh
npx wrangler login                          # 首次：浏览器授权（一次性）
npm run build                              # 确保产物最新
npx wrangler deploy                         # 部署 → https://lazeword.<account>.workers.dev/
npx wrangler secret put DEEPSEEK_API_KEY    # 可选：托管 AI key（不下发浏览器）
```

自定义域名（deepedu.me 已在 Cloudflare 名下时，二选一）：
- Dashboard → Workers → lazeword → Settings → Domains & Routes → Add custom domain: `lazeword.deepedu.me`
- 或 wrangler.toml 加 `routes = [{ pattern = "lazeword.deepedu.me/*", zone_name = "deepedu.me" }]` 后重新 deploy

**dsh 本身**（Node CLI/桌面应用，无官方 CF 部署路径）——轻量方案是 cloudflared 隧道：

```sh
brew install cloudflared
cloudflared tunnel login                    # 浏览器授权
cloudflared tunnel create dsh-tunnel
cloudflared tunnel route dns dsh-tunnel dsh.deepedu.me
cloudflared tunnel run dsh-tunnel --url http://127.0.0.1:8760   # 本地 dsh web UI 对外
```

- 成本：Workers 免费额度 + 免费隧道——**$0**
- macOS 12 本地 wrangler dev 有兼容警告（部署到远端不受影响；本仓库服务器可用 server/index.mjs 替代）

## NixOS

```nix
# flake.nix 已提供 package / devShell / nixosModules.lazeword
{
  inputs.lazeword.url = "github:xczhanjun/lazeword";
  outputs = { self, nixpkgs, lazeword }: {
    nixosConfigurations.home = nixpkgs.lib.nixosSystem {
      modules = [
        lazeword.nixosModules.lazeword
        {
          services.lazeword = {
            enable = true;
            port = 8000;
            # deepseekApiKeyFile = "/run/secrets/deepseek";  # 可选
          };
        }
      ];
    };
  };
}
```

- 首次克隆后先 `nix flake lock`（生成 flake.lock 固定依赖图），之后每次构建输入固定。
- systemd 服务：`node server/index.mjs`，ReadOnlyPaths、非特权运行，`systemctl status lazeword`。

## 开发环境

```sh
nix develop          # nodejs_24 + python3（build 需要 check-packs.py）
npm test && npm run build
```

## 升级与回放

部署升级 = 指向新 commit（Docker：新 sha tag；Nix：更新 flake input + lock）。
回放 = 指回旧 commit 重新构建——产物逐位一致，行为一致。
