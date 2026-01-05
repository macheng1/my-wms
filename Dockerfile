FROM node:20.15.0-alpine AS builder
WORKDIR /app

# 1. 切换源并安装编译工具
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache libc6-compat

# 2. 💡 优化：使用 pnpm 提速依赖安装
RUN corepack enable && corepack prepare pnpm@latest --activate

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

# 3. 💡 利用 Docker 层缓存：先装依赖，再拷源码
COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- 第二阶段：运行阶段 ---
FROM node:20.15.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 4. 💡 优化：只拷贝 standalone 产物，不再拷贝巨大的整个 node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3010
ENV PORT=3010

# 5. 💡 standalone 模式下启动文件是 server.js
CMD ["node", "server.js"]