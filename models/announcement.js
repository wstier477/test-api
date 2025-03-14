/**
 * 公告模型
 * 定义公告表结构和关联关系
 */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Announcement extends Model {
    /**
     * 定义模型的关联关系
     * @param {object} models - 所有模型的集合
     */
    static associate(models) {
      // 公告与课程的多对一关系
      Announcement.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });

      // 公告与创建者的多对一关系
      Announcement.belongsTo(models.User, {
        foreignKey: 'creatorId',
        as: 'creator'
      });
    }
  }

  Announcement.init({
    // 公告ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 公告标题
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    // 公告内容
    content: {
      type: DataTypes.TEXT,
      allowNull: false
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
    // 创建者ID，外键
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Announcement',
    tableName: 'announcements',
    timestamps: true
  });

  return Announcement;
}; 