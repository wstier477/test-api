'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建聊天历史表
    await queryInterface.createTable('AssistantChats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '新对话'
      },
      courseId: {
        type: Sequelize.UUID,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      lastMessageTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建聊天消息表
    await queryInterface.createTable('AssistantMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AssistantChats',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('user', 'assistant'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 添加索引
    await queryInterface.addIndex('AssistantChats', ['userId']);
    await queryInterface.addIndex('AssistantChats', ['courseId']);
    await queryInterface.addIndex('AssistantChats', ['lastMessageTime']);
    await queryInterface.addIndex('AssistantMessages', ['chatId']);
    await queryInterface.addIndex('AssistantMessages', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表（顺序很重要，需要先删除有外键引用的表）
    await queryInterface.dropTable('AssistantMessages');
    await queryInterface.dropTable('AssistantChats');
  }
}; 