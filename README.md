# 教育管理系统API

这是一个基于Express和Sequelize的教育管理系统API，用于管理课程、学生、教师、公告、作业、考试、成绩等信息。

## 技术栈

- Node.js
- Express
- Sequelize
- MySQL
- JWT认证

## 功能特性

- 用户认证与管理
- 课程管理
- 学生管理
- 公告管理
- 作业/考试管理
- 成绩管理
- 分组管理
- 资源管理
- 消息管理
- 课堂记录管理
- 智能助手

## 安装与运行

### 前提条件

- Node.js (>= 12.0.0)
- MySQL (>= 5.7)

### 安装依赖

```bash
npm install
```

### 配置数据库

在`config/config.json`文件中配置数据库连接信息：

```json
{
  "development": {
    "username": "root",
    "password": "your_password",
    "database": "education_system_dev",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+08:00"
  },
  "test": {
    "username": "root",
    "password": "your_password",
    "database": "education_system_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+08:00"
  },
  "production": {
    "username": "root",
    "password": "your_password",
    "database": "education_system_prod",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+08:00"
  }
}
```

### 创建数据库

```bash
npx sequelize-cli db:create
```

### 运行迁移

```bash
npx sequelize-cli db:migrate
```

### 运行种子数据

```bash
npx sequelize-cli db:seed:all
```

### 启动服务器

```bash
npm start
```

## API文档

### 用户认证与管理接口

#### 用户登录

- **接口路径**: `/api/auth/login`
- **请求方法**: POST
- **请求参数**:
  ```json
  {
    "email": "用户邮箱/用户名",
    "password": "密码"
  }
  ```

#### 用户注册

- **接口路径**: `/api/auth/register`
- **请求方法**: POST
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "phone": "手机号",
    "email": "邮箱",
    "password": "密码",
    "role": "角色(teacher/student)"
  }
  ```

#### 获取用户信息

- **接口路径**: `/api/users/profile`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌

#### 更新用户信息

- **接口路径**: `/api/users/profile`
- **请求方法**: PUT
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "phone": "手机号",
    "avatar": "头像URL",
    "workId": "工号/学号",
    "college": "学院",
    "gender": "性别",
    "introduction": "个人介绍",
    "education": "教育经历"
  }
  ```

### 课程管理接口

#### 获取课程列表

- **接口路径**: `/api/courses`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌

#### 创建新课程

- **接口路径**: `/api/courses`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "title": "课程标题",
    "description": "课程描述",
    "cover": "课程封面图URL",
    "location": "教学地点"
  }
  ```

#### 获取课程详情

- **接口路径**: `/api/courses/:id`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌

### 学生管理接口

#### 获取课程学生列表

- **接口路径**: `/api/courses/:courseId/students`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌

#### 添加学生到课程

- **接口路径**: `/api/courses/:courseId/students`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "studentIds": ["学生ID1", "学生ID2"]
  }
  ```

#### 从课程中移除学生

- **接口路径**: `/api/courses/:courseId/students/:studentId`
- **请求方法**: DELETE
- **请求头**: 需要包含认证令牌

### 公告管理接口

#### 获取课程公告列表

- **接口路径**: `/api/courses/:courseId/announcements`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌

#### 发布课程公告

- **接口路径**: `/api/courses/:courseId/announcements`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "title": "公告标题",
    "content": "公告内容"
  }
  ```

## 项目结构

```
.
├── bin/                  # 启动脚本
├── config/               # 配置文件
├── controllers/          # 控制器
├── middleware/           # 中间件
├── migrations/           # 数据库迁移
├── models/               # 数据模型
├── public/               # 静态资源
├── routes/               # 路由
├── seeders/              # 种子数据
├── utils/                # 工具函数
├── app.js                # 应用入口
├── package.json          # 项目依赖
└── README.md             # 项目说明
```

## 许可证

MIT 