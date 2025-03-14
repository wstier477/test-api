/**
 * 作业提交模型
 * 用于存储学生提交的作业
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class AssignmentSubmission extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与作业模型关联
      AssignmentSubmission.belongsTo(models.Assignment, {
        foreignKey: 'assignmentId',
        as: 'assignment'
      });
      
      // 与学生模型关联
      AssignmentSubmission.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student'
      });
      
      // 与提交文件模型关联
      AssignmentSubmission.hasMany(models.SubmissionFile, {
        foreignKey: 'submissionId',
        as: 'files'
      });
    }
  }
  
  AssignmentSubmission.init({
    // 提交ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    // 作业ID
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      }
    },
    // 学生ID
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 提交内容
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 得分
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 教师评语
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 状态（已提交/已批改）
    status: {
      type: DataTypes.ENUM('submitted', 'graded'),
      allowNull: false,
      defaultValue: 'submitted'
    },
    // 提交时间
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // 批改时间
    gradedAt: {
      type: DataTypes.DATE,
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
    modelName: 'AssignmentSubmission',
    tableName: 'assignment_submissions',
    timestamps: true
  });
  
  return AssignmentSubmission;
}; 