# --- 第一阶段：打包编译 (保持不变) ---
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

# --- 第二阶段：极简运行 (精准拍平版) ---
FROM node:20.15.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3010
ENV NEXT_TELEMETRY_DISABLED=1

# 1. 拷贝 standalone 原始产物
COPY --from=builder /app/.next/standalone ./

# 2. 💡 修正后的核心逻辑：增加 -not -path 排除依赖包
# 这样它只会找到你业务生成的 Public/my-wms/server.js 或根目录的 server.js
RUN SERVER_PATH=$(find . -name "server.js" -not -path "*/node_modules/*" | head -n 1); \
    if [ -n "$SERVER_PATH" ]; then \
    SERVER_DIR=$(dirname "$SERVER_PATH"); \
    # 如果 server.js 不在根目录(.)，则执行移动
    if [ "$SERVER_DIR" != "." ]; then \
    echo "🚀 精准检测到业务路径: $SERVER_DIR，正在提取..."; \
    cp -rn "$SERVER_DIR"/* ./; \
    # 清理掉第一层嵌套目录
    rm -rf "$(echo $SERVER_DIR | cut -d'/' -f2)"; \
    fi \
    fi

# 3. 拷贝静态资源
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3010

# 4. 直接运行根目录下的 server.js
CMD ["node", "server.js"]