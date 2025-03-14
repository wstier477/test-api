'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建课堂记录表
    await queryInterface.createTable('ClassRecords', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT
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

    // 创建出勤记录表
    await queryInterface.createTable('Attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recordId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ClassRecords',
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
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late'),
        allowNull: false,
        defaultValue: 'present'
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
    await queryInterface.addIndex('ClassRecords', ['courseId']);
    await queryInterface.addIndex('ClassRecords', ['date']);
    await queryInterface.addIndex('Attendances', ['recordId', 'studentId'], {
      unique: true,
      name: 'record_student_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表（顺序很重要，需要先删除有外键引用的表）
    await queryInterface.dropTable('Attendances');
    await queryInterface.dropTable('ClassRecords');
  }
}; 