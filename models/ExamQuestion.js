/**
 * 考试题目模型
 * 用于存储考试的题目信息
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class ExamQuestion extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与考试模型关联
      ExamQuestion.belongsTo(models.Exam, {
        foreignKey: 'examId',
        as: 'exam'
      });
      
      // 与答案模型关联
      ExamQuestion.hasMany(models.ExamAnswer, {
        foreignKey: 'questionId',
        as: 'answers'
      });
    }
  }
  
  ExamQuestion.init({
    // 题目ID
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
    // 题目类型（单选/多选/判断/简答）
    type: {
      type: DataTypes.ENUM('single', 'multiple', 'boolean', 'essay'),
      allowNull: false
    },
    // 题目内容
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // 选项（JSON格式）
    options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // 正确答案
    answer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 分值
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    // 排序
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    modelName: 'ExamQuestion',
    tableName: 'exam_questions',
    timestamps: true
  });
  
  return ExamQuestion;
}; 