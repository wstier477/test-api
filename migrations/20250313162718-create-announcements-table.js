'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      // 公告ID，主键
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      // 公告标题
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // 公告内容
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      // 课程ID，外键
      courseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // 创建者ID，外键
      creatorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('announcements');
  }
};
