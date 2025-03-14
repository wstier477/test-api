'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      // 用户ID，主键
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      // 用户名
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // 邮箱
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // 密码
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // 手机号
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // 角色(teacher/student)
      role: {
        type: Sequelize.ENUM('teacher', 'student'),
        allowNull: false,
        defaultValue: 'student'
      },
      // 头像URL
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // 工号/学号
      workId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // 学院
      college: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // 性别
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      // 个人介绍
      introduction: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // 教育经历
      education: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // 创建时间
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // 更新时间
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
