/**
 * 考试答案模型
 * 用于存储学生提交的考试答案
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class ExamAnswer extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与考试题目模型关联
      ExamAnswer.belongsTo(models.ExamQuestion, {
        foreignKey: 'questionId',
        as: 'question'
      });
      
      // 与考试提交模型关联
      ExamAnswer.belongsTo(models.ExamSubmission, {
        foreignKey: 'submissionId',
        as: 'submission'
      });
    }
  }
  
  ExamAnswer.init({
    // 答案ID
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
        model: 'exam_submissions',
        key: 'id'
      }
    },
    // 题目ID
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'exam_questions',
        key: 'id'
      }
    },
    // 学生答案
    answer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 得分
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 评语
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 是否正确
    isCorrect: {
      type: DataTypes.BOOLEAN,
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
    modelName: 'ExamAnswer',
    tableName: 'exam_answers',
    timestamps: true
  });
  
  return ExamAnswer;
}; 