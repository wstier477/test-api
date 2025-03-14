/**
 * 考试模型
 * 用于存储课程考试信息
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与课程模型关联
      Exam.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
      
      // 与教师模型关联
      Exam.belongsTo(models.User, {
        foreignKey: 'teacherId',
        as: 'teacher'
      });
      
      // 与考试题目模型关联
      Exam.hasMany(models.ExamQuestion, {
        foreignKey: 'examId',
        as: 'questions'
      });
      
      // 与考试提交模型关联
      Exam.hasMany(models.ExamSubmission, {
        foreignKey: 'examId',
        as: 'submissions'
      });
    }
  }
  
  Exam.init({
    // 考试ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    // 课程ID
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    // 教师ID
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 考试标题
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 考试描述
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 开始时间
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // 结束时间
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // 考试时长（分钟）
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // 总分值
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    // 状态（未开始/进行中/已结束）
    status: {
      type: DataTypes.ENUM('pending', 'ongoing', 'finished'),
      allowNull: false,
      defaultValue: 'pending'
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
    modelName: 'Exam',
    tableName: 'exams',
    timestamps: true
  });
  
  return Exam;
}; 