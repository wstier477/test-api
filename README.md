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

### 1. 认证模块

#### 1.1 用户登录

- **接口路径**: `/api/auth/login`
- **请求方法**: POST
- **请求参数**:
  ```json
  {
    "email": "用户邮箱/用户名",
    "password": "密码"
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱",
        "role": "角色",
        "avatar": "头像URL"
      }
    }
  }
  ```
- **功能说明**: 用户登录系统，获取认证令牌

#### 1.2 用户注册

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
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "role": "角色"
    }
  }
  ```
- **功能说明**: 新用户注册系统

### 2. 用户模块

#### 2.1 获取用户信息

- **接口路径**: `/api/users/profile`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "phone": "手机号",
      "avatar": "头像URL",
      "role": "角色",
      "workId": "工号/学号",
      "college": "学院",
      "gender": "性别",
      "introduction": "个人介绍",
      "education": "教育经历",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 获取当前登录用户的个人信息

#### 2.2 更新用户信息

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
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "个人信息更新成功",
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "phone": "手机号",
      "avatar": "头像URL",
      "role": "角色",
      "workId": "工号/学号",
      "college": "学院",
      "gender": "性别",
      "introduction": "个人介绍",
      "education": "教育经历",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 更新当前登录用户的个人信息

### 3. 课程模块

#### 3.1 获取课程列表

- **接口路径**: `/api/courses`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "课程总数",
      "courses": [
        {
          "id": "课程ID",
          "title": "课程标题",
          "description": "课程描述",
          "cover": "课程封面图URL",
          "location": "教学地点",
          "teacherId": "教师ID",
          "teacher": {
            "id": "教师ID",
            "username": "教师姓名",
            "avatar": "教师头像"
          },
          "studentCount": "学生数量",
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取用户可访问的所有课程列表

#### 3.2 创建新课程

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
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "课程创建成功",
    "data": {
      "id": "课程ID",
      "title": "课程标题",
      "description": "课程描述",
      "cover": "课程封面图URL",
      "location": "教学地点",
      "teacherId": "教师ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 教师创建新课程

#### 3.3 获取课程详情

- **接口路径**: `/api/courses/:id`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "id": "课程ID",
      "title": "课程标题",
      "description": "课程描述",
      "cover": "课程封面图URL",
      "location": "教学地点",
      "teacherId": "教师ID",
      "teacher": {
        "id": "教师ID",
        "username": "教师姓名",
        "avatar": "教师头像",
        "email": "教师邮箱",
        "introduction": "教师介绍"
      },
      "students": [
        {
          "id": "学生ID",
          "username": "学生姓名",
          "avatar": "学生头像"
        }
      ],
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 获取指定课程的详细信息

### 4. 学生管理模块

#### 4.1 获取课程学生列表

- **接口路径**: `/api/courses/:courseId/students`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "学生总数",
      "students": [
        {
          "id": "学生ID",
          "username": "学生姓名",
          "avatar": "学生头像",
          "email": "学生邮箱",
          "workId": "学号",
          "college": "学院",
          "joinedAt": "加入课程时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取指定课程的所有学生列表

#### 4.2 添加学生到课程

- **接口路径**: `/api/courses/:courseId/students`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "studentIds": ["学生ID1", "学生ID2"]
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "学生添加成功",
    "data": {
      "addedCount": "成功添加的学生数量",
      "addedStudents": [
        {
          "id": "学生ID",
          "username": "学生姓名"
        }
      ]
    }
  }
  ```
- **功能说明**: 将一个或多个学生添加到指定课程

#### 4.3 从课程中移除学生

- **接口路径**: `/api/courses/:courseId/students/:studentId`
- **请求方法**: DELETE
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "学生已从课程中移除",
    "data": {
      "courseId": "课程ID",
      "studentId": "学生ID"
    }
  }
  ```
- **功能说明**: 从指定课程中移除特定学生

### 5. 公告模块

#### 5.1 获取课程公告列表

- **接口路径**: `/api/courses/:courseId/announcements`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "公告总数",
      "announcements": [
        {
          "id": "公告ID",
          "title": "公告标题",
          "content": "公告内容",
          "courseId": "课程ID",
          "authorId": "作者ID",
          "author": {
            "id": "作者ID",
            "username": "作者姓名",
            "avatar": "作者头像"
          },
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取指定课程的所有公告列表

#### 5.2 发布课程公告

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
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "公告发布成功",
    "data": {
      "id": "公告ID",
      "title": "公告标题",
      "content": "公告内容",
      "courseId": "课程ID",
      "authorId": "作者ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 在指定课程中发布新公告

### 6. 作业/考试模块

#### 6.1 获取课程作业列表

- **接口路径**: `/api/courses/:courseId/assignments`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "作业总数",
      "assignments": [
        {
          "id": "作业ID",
          "title": "作业标题",
          "description": "作业描述",
          "dueDate": "截止日期",
          "totalPoints": "总分",
          "courseId": "课程ID",
          "submissionCount": "提交数量",
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取指定课程的所有作业列表

#### 6.2 创建课程作业

- **接口路径**: `/api/courses/:courseId/assignments`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "title": "作业标题",
    "description": "作业描述",
    "dueDate": "截止日期",
    "totalPoints": "总分"
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "作业创建成功",
    "data": {
      "id": "作业ID",
      "title": "作业标题",
      "description": "作业描述",
      "dueDate": "截止日期",
      "totalPoints": "总分",
      "courseId": "课程ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 在指定课程中创建新作业

#### 6.3 获取课程考试列表

- **接口路径**: `/api/courses/:courseId/exams`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "考试总数",
      "exams": [
        {
          "id": "考试ID",
          "title": "考试标题",
          "description": "考试描述",
          "startTime": "开始时间",
          "endTime": "结束时间",
          "totalPoints": "总分",
          "courseId": "课程ID",
          "status": "考试状态(未开始/进行中/已结束)",
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取指定课程的所有考试列表

#### 6.4 创建课程考试

- **接口路径**: `/api/courses/:courseId/exams`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "title": "考试标题",
    "description": "考试描述",
    "startTime": "开始时间",
    "endTime": "结束时间",
    "totalPoints": "总分"
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "考试创建成功",
    "data": {
      "id": "考试ID",
      "title": "考试标题",
      "description": "考试描述",
      "startTime": "开始时间",
      "endTime": "结束时间",
      "totalPoints": "总分",
      "courseId": "课程ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **功能说明**: 在指定课程中创建新考试

### 7. 成绩模块

#### 7.1 获取学生成绩

- **接口路径**: `/api/courses/:courseId/grades`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "courseId": "课程ID",
      "courseName": "课程名称",
      "grades": [
        {
          "id": "成绩ID",
          "score": "分数",
          "feedback": "反馈",
          "assignment": {
            "id": "作业/考试ID",
            "title": "作业/考试标题",
            "type": "类型(assignment/exam)",
            "totalPoints": "总分",
            "dueDate": "截止日期"
          },
          "submittedAt": "提交时间",
          "gradedAt": "评分时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 学生获取自己在指定课程中的所有成绩

#### 7.2 提交成绩

- **接口路径**: `/api/courses/:courseId/students/:studentId/grades`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "assignmentId": "作业/考试ID",
    "score": "分数",
    "feedback": "反馈"
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "成绩提交成功",
    "data": {
      "id": "成绩ID",
      "studentId": "学生ID",
      "assignmentId": "作业/考试ID",
      "score": "分数",
      "feedback": "反馈",
      "courseId": "课程ID",
      "gradedAt": "评分时间"
    }
  }
  ```
- **功能说明**: 教师为指定学生的作业/考试提交成绩

### 8. 资源模块

#### 8.1 获取课程资源列表

- **接口路径**: `/api/courses/:courseId/resources`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "资源总数",
      "resources": [
        {
          "id": "资源ID",
          "title": "资源标题",
          "description": "资源描述",
          "fileUrl": "文件URL",
          "fileType": "文件类型",
          "fileSize": "文件大小",
          "uploaderId": "上传者ID",
          "uploader": {
            "id": "上传者ID",
            "username": "上传者姓名",
            "avatar": "上传者头像"
          },
          "downloadCount": "下载次数",
          "createdAt": "上传时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取指定课程的所有资源列表

#### 8.2 上传课程资源

- **接口路径**: `/api/courses/:courseId/resources`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**: 表单数据，包含文件和描述
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "资源上传成功",
    "data": {
      "id": "资源ID",
      "title": "资源标题",
      "description": "资源描述",
      "fileUrl": "文件URL",
      "fileType": "文件类型",
      "fileSize": "文件大小",
      "courseId": "课程ID",
      "uploaderId": "上传者ID",
      "createdAt": "上传时间"
    }
  }
  ```
- **功能说明**: 向指定课程上传新资源

### 9. 分组模块

#### 9.1 获取课程分组列表

- **接口路径**: `/api/courses/:courseId/groups`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "分组总数",
      "groups": [
        {
          "id": "分组ID",
          "name": "分组名称",
          "description": "分组描述",
          "courseId": "课程ID",
          "members": [
            {
              "id": "学生ID",
              "username": "学生姓名",
              "avatar": "学生头像"
            }
          ],
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取指定课程的所有学生分组

#### 9.2 创建课程分组

- **接口路径**: `/api/courses/:courseId/groups`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "name": "分组名称",
    "description": "分组描述",
    "memberIds": ["学生ID1", "学生ID2"]
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "分组创建成功",
    "data": {
      "id": "分组ID",
      "name": "分组名称",
      "description": "分组描述",
      "courseId": "课程ID",
      "members": [
        {
          "id": "学生ID",
          "username": "学生姓名"
        }
      ],
      "createdAt": "创建时间"
    }
  }
  ```
- **功能说明**: 在指定课程中创建新的学生分组

### 10. 消息模块

#### 10.1 获取用户消息列表

- **接口路径**: `/api/messages`
- **请求方法**: GET
- **请求头**: 需要包含认证令牌
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "total": "消息总数",
      "unreadCount": "未读消息数",
      "messages": [
        {
          "id": "消息ID",
          "title": "消息标题",
          "content": "消息内容",
          "type": "消息类型(system/course/assignment)",
          "isRead": "是否已读",
          "senderId": "发送者ID",
          "sender": {
            "id": "发送者ID",
            "username": "发送者姓名",
            "avatar": "发送者头像"
          },
          "createdAt": "发送时间"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取当前用户的所有消息

#### 10.2 发送消息

- **接口路径**: `/api/messages`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "receiverId": "接收者ID",
    "title": "消息标题",
    "content": "消息内容",
    "type": "消息类型(course/assignment)"
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "message": "消息发送成功",
    "data": {
      "id": "消息ID",
      "title": "消息标题",
      "content": "消息内容",
      "type": "消息类型",
      "senderId": "发送者ID",
      "receiverId": "接收者ID",
      "createdAt": "发送时间"
    }
  }
  ```
- **功能说明**: 向指定用户发送消息

### 11. 智能助手模块

#### 11.1 获取智能助手回答

- **接口路径**: `/api/assistant/query`
- **请求方法**: POST
- **请求头**: 需要包含认证令牌
- **请求参数**:
  ```json
  {
    "query": "问题内容",
    "courseId": "课程ID（可选）"
  }
  ```
- **返回参数**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "助手回答内容",
      "relatedResources": [
        {
          "id": "资源ID",
          "title": "资源标题",
          "fileUrl": "文件URL"
        }
      ]
    }
  }
  ```
- **功能说明**: 获取智能助手对问题的回答

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