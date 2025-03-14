/**
 * 用户模型
 * 定义用户相关的数据结构和关联关系
 */

'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * 定义模型的关联关系
     * @param {object} models - 所有模型的集合
     */
    static associate(models) {
      // 教师与课程的关系：一对多
      User.hasMany(models.Course, { 
        foreignKey: 'teacherId', 
        as: 'teacherCourses' 
      });
      
      // 学生与课程的关系：多对多
      User.belongsToMany(models.Course, {
        through: 'course_students',
        foreignKey: 'studentId',
        otherKey: 'courseId',
        as: 'studentCourses'
      });
      
      // 用户与消息的关系：一对多（发送者）
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'sentMessages'
      });
      
      // 用户与消息的关系：一对多（接收者）
      User.hasMany(models.Message, {
        foreignKey: 'receiverId',
        as: 'receivedMessages'
      });
      
      // 用户与通知的关系：一对多
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications'
      });
      
      // 用户与公告的关系：一对多
      User.hasMany(models.Announcement, {
        foreignKey: 'creatorId',
        as: 'announcements'
      });
      
      // 用户与资源的关系：一对多
      User.hasMany(models.Resource, {
        foreignKey: 'uploaderId',
        as: 'resources'
      });
      
      // 学生与考试提交的关系：一对多
      User.hasMany(models.ExamSubmission, {
        foreignKey: 'studentId',
        as: 'examSubmissions'
      });
      
      // 学生与作业提交的关系：一对多
      User.hasMany(models.AssignmentSubmission, {
        foreignKey: 'studentId',
        as: 'assignmentSubmissions'
      });
      
      // 学生与成绩的关系：一对多
      User.hasMany(models.Grade, {
        foreignKey: 'studentId',
        as: 'grades'
      });
      
      // 用户与智能助手聊天的关系：一对多
      User.hasMany(models.AssistantChat, {
        foreignKey: 'userId',
        as: 'assistantChats'
      });
    }

    /**
     * 验证密码是否正确
     * @param {string} password - 待验证的密码
     * @returns {boolean} 密码是否匹配
     */
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: '用户名不能为空' },
        len: { args: [3, 30], msg: '用户名长度应在3-30个字符之间' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: '邮箱格式不正确' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '密码不能为空' },
        len: { args: [6, 100], msg: '密码长度应在6-100个字符之间' }
      }
    },
    role: {
      type: DataTypes.ENUM('teacher', 'student', 'admin'),
      allowNull: false,
      defaultValue: 'student'
    },
    workId: {
      type: DataTypes.STRING,
      unique: true
    },
    college: DataTypes.STRING,
    gender: DataTypes.ENUM('male', 'female', 'other'),
    avatar: DataTypes.STRING,
    introduction: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      /**
       * 创建用户前对密码进行加密
       * @param {User} user - 用户实例
       */
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      /**
       * 更新用户前对密码进行加密（如果密码被修改）
       * @param {User} user - 用户实例
       */
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);

        }
      }
    }
  });
  
  return User;
}; 