const express = require('express');
const router = express.Router();
const { 
  getCourseStudents, 
  addStudentsToCourse, 
  removeStudentFromCourse, 
  getStudentById 
} = require('../controllers/studentController');
const { authenticate, isTeacher } = require('../middleware/auth');

/**
 * 学生路由
 * 处理学生的增删改查
 */

/**
 * @route   GET /api/students/:id
 * @desc    获取学生详情
 * @access  Private
 */
router.get('/:id', authenticate, getStudentById);

/**
 * @route   GET /api/courses/:courseId/students
 * @desc    获取课程学生列表
 * @access  Private/Teacher
 */
router.get('/courses/:courseId/students', authenticate, isTeacher, getCourseStudents);

/**
 * @route   POST /api/courses/:courseId/students
 * @desc    添加学生到课程
 * @access  Private/Teacher
 */
router.post('/courses/:courseId/students', authenticate, isTeacher, addStudentsToCourse);

/**
 * @route   DELETE /api/courses/:courseId/students/:studentId
 * @desc    从课程中移除学生
 * @access  Private/Teacher
 */
router.delete('/courses/:courseId/students/:studentId', authenticate, isTeacher, removeStudentFromCourse);

module.exports = router; 