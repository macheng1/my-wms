# 使用 Node.js 20 Alpine 基础镜像
FROM node:20.15.0-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=development

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 使用国内镜像源安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制项目文件
COPY . .

# 暴露 Next.js 默认端口
EXPOSE 3010

# 启动开发服务器
CMD ["npm", "run", "dev"]