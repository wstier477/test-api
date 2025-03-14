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
        assessmentScheme: JSON.stringify([
          { name: '课堂', percentage: 30 },
          { name: '雨课堂课件', percentage: 20 },
          { name: '考试', percentage: 50 }
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
