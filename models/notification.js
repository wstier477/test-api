/**
 * 通知模型
 * 定义通知表结构和关联关系
 */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * 定义模型的关联关系
     * @param {object} models - 所有模型的集合
     */
    static associate(models) {
      // 通知与用户的多对一关系
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // 通知与课程的多对一关系
      Notification.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
    }
  }

  Notification.init({
    // 通知ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 通知标题
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    // 通知内容
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // 通知类型
    type: {
      type: DataTypes.ENUM('announcement', 'assignment', 'exam', 'grade', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    // 用户ID，外键
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 课程ID，外键
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    // 是否已读
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true
  });

  return Notification;
}; 