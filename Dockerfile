FROM debian:buster-slim

# 安装Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y --no-install-recommends \
    nodejs \
    netcat \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 设置启动脚本权限
RUN chmod +x docker-entrypoint.sh

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 使用启动脚本
ENTRYPOINT ["./docker-entrypoint.sh"]

# 启动应用
CMD ["npm", "start"] 