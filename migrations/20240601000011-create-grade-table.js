'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建成绩表
    await queryInterface.createTable('Grades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      courseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      classScore: {
        type: Sequelize.FLOAT,
        comment: '课堂成绩'
      },
      rainScore: {
        type: Sequelize.FLOAT,
        comment: '雨课堂成绩'
      },
      examScore: {
        type: Sequelize.FLOAT,
        comment: '考试成绩'
      },
      totalScore: {
        type: Sequelize.FLOAT,
        comment: '总成绩'
      },
      semester: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '学期，例如：2023-2024-2'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建成绩评估方案表
    await queryInterface.createTable('GradeSchemes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      courseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '评估项名称，例如：课堂、雨课堂、考试'
      },
      percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '百分比，例如：30表示30%'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 添加索引
    await queryInterface.addIndex('Grades', ['studentId', 'courseId', 'semester'], {
      unique: true,
      name: 'student_course_semester_unique'
    });
    await queryInterface.addIndex('Grades', ['courseId']);
    await queryInterface.addIndex('Grades', ['semester']);
    await queryInterface.addIndex('GradeSchemes', ['courseId']);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表（顺序很重要，需要先删除有外键引用的表）
    await queryInterface.dropTable('GradeSchemes');
    await queryInterface.dropTable('Grades');
  }
}; 