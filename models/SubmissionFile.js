/**
 * 提交文件模型
 * 用于存储学生提交的作业文件
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class SubmissionFile extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与作业提交模型关联
      SubmissionFile.belongsTo(models.AssignmentSubmission, {
        foreignKey: 'submissionId',
        as: 'submission'
      });
    }
  }
  
  SubmissionFile.init({
    // 文件ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    // 提交ID
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assignment_submissions',
        key: 'id'
      }
    },
    // 文件名
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 文件URL
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 文件大小（字节）
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // 文件类型
    type: {
      type: DataTypes.STRING,
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
    modelName: 'SubmissionFile',
    tableName: 'submission_files',
    timestamps: true
  });
  
  return SubmissionFile;
}; 