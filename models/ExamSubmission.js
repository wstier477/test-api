/**
 * 考试提交模型
 * 用于存储学生提交的考试
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class ExamSubmission extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与考试模型关联
      ExamSubmission.belongsTo(models.Exam, {
        foreignKey: 'examId',
        as: 'exam'
      });
      
      // 与学生模型关联
      ExamSubmission.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student'
      });
      
      // 与答案模型关联
      ExamSubmission.hasMany(models.ExamAnswer, {
        foreignKey: 'submissionId',
        as: 'answers'
      });
    }
  }
  
  ExamSubmission.init({
    // 提交ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    // 考试ID
    examId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'exams',
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
    // 开始时间
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // 提交时间
    submitTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // 总得分
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 状态（进行中/已提交/已批改）
    status: {
      type: DataTypes.ENUM('ongoing', 'submitted', 'graded'),
      allowNull: false,
      defaultValue: 'ongoing'
    },
    // 教师评语
    feedback: {
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
    modelName: 'ExamSubmission',
    tableName: 'exam_submissions',
    timestamps: true
  });
  
  return ExamSubmission;
}; 