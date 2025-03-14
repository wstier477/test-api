/**
 * 消息模型
 * 定义消息表结构和关联关系
 */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * 定义模型的关联关系
     * @param {object} models - 所有模型的集合
     */
    static associate(models) {
      // 消息与发送者的多对一关系
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });

      // 消息与接收者的多对一关系
      Message.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver'
      });
    }
  }

  Message.init({
    // 消息ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 发送者ID，外键
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 接收者ID，外键
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 消息内容
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // 是否已读
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true
  });

  return Message;
};
