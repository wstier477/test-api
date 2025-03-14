/**
 * 成绩模型
 * 用于存储学生的课程成绩
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Grade extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与课程模型关联
      Grade.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
      
      // 与学生模型关联
      Grade.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student'
      });
    }
  }
  
  Grade.init({
    // 成绩ID
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
    // 学生ID
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 课堂成绩
    classScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 雨课堂成绩
    rainScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 考试成绩
    examScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 总成绩
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 学期
    semester: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 评语
    comment: {
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
    modelName: 'Grade',
    tableName: 'grades',
    timestamps: true
  });
  
  return Grade;
}; 