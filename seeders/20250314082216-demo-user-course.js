'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 创建测试用户
    const teacherId = uuidv4();
    const studentId = uuidv4();
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: teacherId,
        username: 'teacher1',
        password: hashedPassword,
        email: 'teacher1@test.com',
        role: 'teacher',
        workId: 'T2024001',
        college: '计算机科学与技术学院',
        gender: 'male',
        introduction: '测试教师账号',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: studentId,
        username: 'student1',
        password: hashedPassword,
        email: 'student1@test.com',
        role: 'student',
        workId: 'S2024001',
        college: '计算机科学与技术学院',
        gender: 'male',
        introduction: '测试学生账号',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 创建测试课程
    const courseId = uuidv4();
    await queryInterface.bulkInsert('courses', [
      {
        id: courseId,
        title: '测试课程',
        description: '这是一个用于测试的课程',
        teacherId: teacherId,
        cover: 'https://example.com/course-cover.jpg',
        location: '教学楼A101',
        assessmentScheme: [
          { name: '课堂', percentage: 30 },
          { name: '雨课堂课件', percentage: 20 },
          { name: '考试', percentage: 50 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 将学生添加到课程
    await queryInterface.bulkInsert('course_students', [
      {
        courseId: courseId,
        studentId: studentId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 创建测试作业
    await queryInterface.bulkInsert('Assignments', [
      {
        title: '测试作业',
        description: '这是一个用于测试的作业',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一周后截止
        totalScore: 100,
        courseId: courseId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 创建测试公告
    await queryInterface.bulkInsert('Announcements', [
      {
        title: '测试公告',
        content: '这是一个用于测试的公告',
        courseId: courseId,
        creatorId: teacherId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('course_students', null, {});
    await queryInterface.bulkDelete('Assignments', null, {});
    await queryInterface.bulkDelete('Announcements', null, {});
    await queryInterface.bulkDelete('courses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
