/**
 * 作业模型
 * 用于存储课程作业信息
 */

'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    /**
     * 定义模型关联
     * @param {object} models - 所有模型
     */
    static associate(models) {
      // 与课程模型关联
      Assignment.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
      
      // 与教师模型关联
      Assignment.belongsTo(models.User, {
        foreignKey: 'teacherId',
        as: 'teacher'
      });
      
      // 与作业提交模型关联
      Assignment.hasMany(models.AssignmentSubmission, {
        foreignKey: 'assignmentId',
        as: 'submissions'
      });
    }
  }
  
  Assignment.init({
    // 作业ID
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
    // 作业标题
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 作业描述
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 截止日期
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // 总分值
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
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
    modelName: 'Assignment',
    tableName: 'assignments',
    timestamps: true
  });
  
  return Assignment;
}; 