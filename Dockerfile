# --- 第一阶段：编译阶段 (Builder) ---
FROM node:20.15.0-alpine AS builder
WORKDIR /app

# 1. 声明构建参数 (云效中的 NEXT_PUBLIC_ 变量必须在这里声明)
# 只有这样，打包时 process.env.NEXT_PUBLIC_API_URL 才不会是空的
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENV

# 将 ARG 转换为 ENV，供 npm run build 使用
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
ENV NEXT_TELEMETRY_DISABLED=1

# 安装依赖
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm install

# 复制源码并执行打包
COPY . .
RUN npm run build

# --- 第二阶段：运行阶段 (Runner) ---
FROM node:20.15.0-alpine AS runner
WORKDIR /app

# 生产环境默认配置
ENV NODE_ENV=production
ENV PORT=3010
# 💡 注意：运行时的非公开变量（如 DB_PASSWORD）不需要写在这里
# 云效在“部署”时会自动通过容器启动参数注入

# 复制打包产物（继续以 root 运行）
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3010

# 启动命令
CMD ["npx", "next", "start", "-p", "3010", "-H", "0.0.0.0"]