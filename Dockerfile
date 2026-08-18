# syntax=docker/dockerfile:1
# lazeword 确定性容器构建：
#   - 基础镜像按 digest 固定（无浮动 tag），升级需显式更新 digest
#   - 零 npm 依赖（无 npm install），产物由 npm run build 生成，构建期跑全量测试 + pack 质量门
#   - 运行时仅静态文件 + 零依赖 server，非 root 运行，HEALTHCHECK 接 /api/health
# 说明见 docs/deployment.md

# ---- 构建阶段 ----
FROM node:24-bookworm@sha256:f6d02cf1353049cf3658e6ce9ec03c6877a6479495f122062d195e2279d01055 AS builder
WORKDIR /src
# 先拷清单与脚本层（变化最少），再拷源码——利用缓存分层
COPY package.json ./
COPY scripts/ ./scripts/
COPY src/ ./src/
COPY app/ ./app/
COPY data/ ./data/
COPY tests/ ./tests/
COPY lib/ ./lib/
# check-packs.py 需要 python3（质量门是构建的一部分）
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 \
 && rm -rf /var/lib/apt/lists/* \
 && npm run build \
 && npm test

# ---- 运行阶段 ----
FROM node:24-alpine@sha256:2a49bdf71e9fd965a58c1703fd9ddd205b34e5782b692a72dd1d248abb0beb43 AS runtime
WORKDIR /srv
ENV NODE_ENV=production \
    PORT=8000 \
    HOST=0.0.0.0
COPY --from=builder /src/app ./app
COPY --from=builder /src/worker ./worker
COPY server/ ./server/
EXPOSE 8000
# 健康检查走应用自己的 /api/health（零额外依赖）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
USER node
CMD ["node", "server/index.mjs"]
