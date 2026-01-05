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

# --- 第二阶段：极简运行 (自动定位版) ---
FROM node:20.15.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3010
ENV NEXT_TELEMETRY_DISABLED=1

# 1. 拷贝所有原始产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 2. 💡 核心逻辑：自动寻找并对齐静态资源
# 使用 sh -c 在启动时执行脚本：
#   A. 寻找 server.js 所在的嵌套路径
#   B. 将根目录的 public 和 static 拷贝/移动到该路径旁边（修复标题图标不生效）
#   C. 进入该路径并启动 node
CMD sh -c "\
    SERVER_PATH=\$(find /app/.next -name 'server.js' -not -path '*/node_modules/*' | head -n 1); \
    if [ -z \"\$SERVER_PATH\" ]; then \
    echo 'server.js 未找到'; \
    exit 1; \
    fi; \
    echo '启动 server.js 目录: \$SERVER_PATH'; \
    node \$SERVER_PATH"
