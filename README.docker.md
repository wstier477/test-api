# Docker 部署指南

本文档提供了使用 Docker 部署该 Node.js 应用的详细说明。

## 前提条件

- 安装 [Docker](https://www.docker.com/get-started)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

## 部署步骤

### 1. 克隆代码库

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. 使用 Docker Compose 构建和启动服务

```bash
docker-compose up -d
```

这将在后台启动应用服务和 MySQL 数据库服务。

### 3. 初始化数据库

首次部署时，需要运行数据库迁移和种子数据：

```bash
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

### 4. 访问应用

应用将在以下地址运行：

```
http://localhost:3000
```

## 常用命令

### 查看日志

```bash
docker-compose logs -f app  # 查看应用日志
docker-compose logs -f db   # 查看数据库日志
```

### 停止服务

```bash
docker-compose down  # 停止所有服务
```

### 重新构建和启动服务

```bash
docker-compose up -d --build
```

### 重置数据库

```bash
docker-compose exec app npm run db:reset
```

## 环境变量

Docker Compose 配置中已经设置了以下环境变量：

- `NODE_ENV`: 运行环境 (production)
- `PORT`: 应用端口 (3000)
- `DB_HOST`: 数据库主机名 (db)
- `DB_USER`: 数据库用户名 (root)
- `DB_PASSWORD`: 数据库密码 (clwy1234)
- `DB_NAME`: 数据库名称 (education_system_production)

如需修改这些变量，请编辑 `docker-compose.yml` 文件。

## 数据持久化

MySQL 数据存储在名为 `mysql-data` 的 Docker 卷中，确保数据在容器重启后仍然保留。

## 生产环境部署注意事项

在生产环境中部署时，请确保：

1. 修改数据库密码为强密码
2. 配置 HTTPS
3. 设置适当的日志记录和监控
4. 考虑使用容器编排工具（如 Kubernetes）进行更复杂的部署 