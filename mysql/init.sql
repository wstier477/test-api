-- 创建数据库
CREATE DATABASE IF NOT EXISTS education_system_production;

-- 设置root密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'clwy1234';
CREATE USER 'root'@'%' IDENTIFIED BY 'clwy1234';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES; 