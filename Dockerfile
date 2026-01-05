# --- 第一阶段：打包编译 (Builder) ---
FROM node:20.15.0-alpine AS builder
WORKDIR /app

# 1. 快速安装环境依赖（换成阿里云源，解决 8 分钟卡顿）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache libc6-compat

# 2. 用淘宝源安装 pnpm (避开 corepack 报错)
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# 3. 接收云效变量 (前端打包必须)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

# 4. 安装依赖 (利用缓存)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 5. 复制源码并执行打包
COPY . .
RUN pnpm run build

# --- 第二阶段：极简运行 (Runner) ---
FROM node:20.15.0-alpine AS runner
WORKDIR /app

# 生产环境环境变量
ENV NODE_ENV=production
ENV PORT=3010

# 6. 只拷贝独立运行包 (standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3010

# 7. 启动（注意 standalone 模式入口是 server.js）
CMD ["node", "server.js"]