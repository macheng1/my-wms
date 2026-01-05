# --- 第一阶段：编译阶段 (Builder) ---
FROM node:20.15.0-alpine AS builder
WORKDIR /app

# 1. 声明构建参数 (必须与云效变量组及流水线参数名完全一致)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV  # 💡 这里改成了 APP_ENV，匹配你的截图

# 将 ARG 转换为 ENV，供 npm run build 使用
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
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

ENV NODE_ENV=production
ENV PORT=3010

# 复制打包产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3010

CMD ["npx", "next", "start", "-p", "3010", "-H", "0.0.0.0"]