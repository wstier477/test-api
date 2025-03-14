/**
 * 资源模型
 * 定义资源表结构和关联关系
 */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Resource extends Model {
    /**
     * 定义模型的关联关系
     * @param {object} models - 所有模型的集合
     */
    static associate(models) {
      // 资源与课程的多对一关系
      Resource.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });

      // 资源与上传者的多对一关系
      Resource.belongsTo(models.User, {
        foreignKey: 'uploaderId',
        as: 'uploader'
      });
    }
  }

  Resource.init({
    // 资源ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 资源名称
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    // 资源类型(document/video/image)
    type: {
      type: DataTypes.ENUM('document', 'video', 'image', 'other'),
      allowNull: false,
      defaultValue: 'document'
    },
    // 资源URL
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 资源大小(字节)
    size: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    // 上传者ID，外键
    uploaderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 描述
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Resource',
    tableName: 'resources',
    timestamps: true
  });

  return Resource;
}; 