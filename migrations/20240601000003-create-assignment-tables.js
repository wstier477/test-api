'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建作业表
    await queryInterface.createTable('Assignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false
      },
      totalScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建作业提交表
    await queryInterface.createTable('AssignmentSubmissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assignmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Assignments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      content: {
        type: Sequelize.TEXT
      },
      submitTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      score: {
        type: Sequelize.INTEGER
      },
      comment: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('submitted', 'graded'),
        allowNull: false,
        defaultValue: 'submitted'
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

    // 创建作业文件表
    await queryInterface.createTable('AssignmentFiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AssignmentSubmissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING
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
    await queryInterface.addIndex('AssignmentSubmissions', ['assignmentId', 'studentId'], {
      unique: true,
      name: 'assignment_student_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表（顺序很重要，需要先删除有外键引用的表）
    await queryInterface.dropTable('AssignmentFiles');
    await queryInterface.dropTable('AssignmentSubmissions');
    await queryInterface.dropTable('Assignments');
  }
}; 