#!/bin/sh
set -e

# 等待MySQL服务启动
echo "Waiting for MySQL to start..."
until nc -z -v -w30 $DB_HOST 3306
do
  echo "Waiting for database connection..."
  # 等待5秒后重试
  sleep 5
done

# 运行数据库迁移
echo "Running database migrations..."
npm run db:migrate

# 启动应用
echo "Starting application..."
exec "$@" 