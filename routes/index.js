const express = require('express');
const router = express.Router();

/**
 * 路由索引文件
 * 用于组织和导出所有API路由
 */

// 导入各个模块的路由
const authRoutes = require('./auth');
const userRoutes = require('./users');
const courseRoutes = require('./courses');
const studentRoutes = require('./students');
const announcementRoutes = require('./announcements');
const courseStudentRoutes = require('./courseStudents');
const courseAnnouncementRoutes = require('./courseAnnouncements');
// 新增路由
const assistantRoutes = require('./assistant');
const studentAssignmentRoutes = require('./studentAssignments');
const studentExamRoutes = require('./studentExams');
const studentGradeRoutes = require('./studentGrades');
// 其他路由
// const examRoutes = require('./exams');
// const gradeRoutes = require('./grades');
// const groupRoutes = require('./groups');
// const resourceRoutes = require('./resources');
// const messageRoutes = require('./messages');
// const recordRoutes = require('./records');

// 基础路由，用于测试API是否正常工作
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '教育管理系统API服务正常运行',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// 注册各个模块的路由
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api/students', studentRoutes);
router.use('/api/announcements', announcementRoutes);
router.use('/api/courses', courseStudentRoutes);
router.use('/api/courses', courseAnnouncementRoutes);
// 注册新增路由
router.use('/api/assistant', assistantRoutes);
router.use('/api/students', studentAssignmentRoutes);
router.use('/api/students', studentExamRoutes);
router.use('/api/students', studentGradeRoutes);
// 注册其他路由
// router.use('/api/exams', examRoutes);
// router.use('/api/grades', gradeRoutes);
// router.use('/api/groups', groupRoutes);
// router.use('/api/resources', resourceRoutes);
// router.use('/api/messages', messageRoutes);
// router.use('/api/records', recordRoutes);

module.exports = router; 