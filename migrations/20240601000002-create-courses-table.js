'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      // 课程ID，主键
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      // 课程标题
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // 课程描述
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // 课程封面图URL
      cover: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // 教师ID，外键
      teacherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // 教学地点
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // 评估方案，JSON格式存储
      assessmentScheme: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [
          { name: '课堂', percentage: 30 },
          { name: '雨课堂课件', percentage: 20 },
          { name: '考试', percentage: 50 }
        ]
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
    await queryInterface.dropTable('courses');
  }
}; 