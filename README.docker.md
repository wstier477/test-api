# Docker 部署说明

本项目已配置为使用国内镜像源，以解决在中国大陆网络环境下的部署问题。

## 修改内容

1. 主应用 Dockerfile:
   - 使用阿里云 Debian 镜像源
   - 使用阿里云 Node.js 安装源
   - 使用淘宝 NPM 镜像

2. MySQL:
   - 直接使用官方 MySQL 镜像，而不是从 Debian 安装
   - 通过 volume 挂载初始化脚本

## 部署步骤

1. 确保已安装 Docker 和 Docker Compose

2. 在项目根目录下运行:
   ```bash
   docker-compose up -d
   ```

3. 查看容器状态:
   ```bash
   docker-compose ps
   ```

4. 查看应用日志:
   ```bash
   docker-compose logs -f app
   ```

5. 查看数据库日志:
   ```bash
   docker-compose logs -f db
   ```

## 常见问题

1. 如果遇到网络问题，可以尝试设置 Docker 的镜像加速器:
   ```bash
   sudo mkdir -p /etc/docker
   sudo tee /etc/docker/daemon.json <<-'EOF'
   {
     "registry-mirrors": ["https://registry.docker-cn.com", "https://docker.mirrors.ustc.edu.cn"]
   }
   EOF
   sudo systemctl daemon-reload
   sudo systemctl restart docker
   ```

2. 如果数据库连接失败，请检查:
   - 数据库容器是否正常运行
   - 环境变量配置是否正确
   - 网络连接是否正常

## 数据持久化

数据库数据存储在名为 `mysql-data` 的 Docker volume 中，即使容器被删除，数据也不会丢失。

如需备份数据，可以使用:
```bash
docker exec -it test-api_db_1 mysqldump -u root -p education_system_production > backup.sql
```

如需恢复数据，可以使用:
```bash
cat backup.sql | docker exec -i test-api_db_1 mysql -u root -p education_system_production
```

## 生产环境部署注意事项

在生产环境中部署时，请确保：

1. 修改数据库密码为强密码
2. 配置 HTTPS
3. 设置适当的日志记录和监控
4. 考虑使用容器编排工具（如 Kubernetes）进行更复杂的部署 