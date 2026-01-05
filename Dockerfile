# --- 第一阶段：打包编译 ---
FROM node:20.15.0-alpine AS builder
WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk add --no-cache libc6-compat
RUN npm config set registry https://registry.npmmirror.com && npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN rm -rf .next && pnpm run build

# --- 第二阶段：极简运行 (自动拍平路径) ---
FROM node:20.15.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3010
ENV NEXT_TELEMETRY_DISABLED=1

# 1. 拷贝 standalone 原始产物
COPY --from=builder /app/.next/standalone ./

# 2. 💡 核心逻辑：自动寻找并拍平动态路径
# 原理：找到深层的 server.js，把同级所有文件搬到根目录，然后删掉空壳
RUN SERVER_PATH=$(find . -mindepth 2 -name "server.js" | head -n 1); \
    if [ -n "$SERVER_PATH" ]; then \
    SERVER_DIR=$(dirname "$SERVER_PATH"); \
    echo "🚀 检测到动态路径: $SERVER_DIR，正在提取到根目录..."; \
    cp -rn "$SERVER_DIR"/* ./; \
    # 递归删除第一个嵌套目录（清理空间）
    rm -rf "$(echo $SERVER_DIR | cut -d'/' -f2)"; \
    fi

# 3. 拷贝静态资源 (必须放在根目录，与拍平后的 server.js 同级)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3010

# 4. 💡 完美达成：直接运行根目录的 server.js
CMD ["node", "server.js"]