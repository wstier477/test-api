/**
 * 智能助手消息模型
 * 用于存储用户与智能助手的对话消息
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class AssistantMessage extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与聊天历史模型关联
      AssistantMessage.belongsTo(models.AssistantChat, {
        foreignKey: 'chatId',
        as: 'chat'
      });
    }
  }
  
  AssistantMessage.init({
    // 消息ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    // 聊天ID
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assistant_chats',
        key: 'id'
      }
    },
    // 消息类型（用户/助手）
    type: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false
    },
    // 消息内容
    content: {
      type: DataTypes.TEXT,
      allowNull: false
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
    modelName: 'AssistantMessage',
    tableName: 'assistant_messages',
    timestamps: true
  });
  
  return AssistantMessage;
}; 