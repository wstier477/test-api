/**
 * 智能助手聊天历史模型
 * 用于存储用户与智能助手的聊天历史记录
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class AssistantChat extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与用户模型关联
      AssistantChat.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // 与课程模型关联（可选）
      AssistantChat.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
      
      // 与消息模型关联
      AssistantChat.hasMany(models.AssistantMessage, {
        foreignKey: 'chatId',
        as: 'messages'
      });
    }
  }
  
  AssistantChat.init({
    // 聊天ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    // 用户ID
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 课程ID（可选）
    courseId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    // 聊天标题
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 最后一条消息预览
    preview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 创建时间
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // 更新时间
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AssistantChat',
    tableName: 'assistant_chats',
    timestamps: true
  });
  
  return AssistantChat;
}; 