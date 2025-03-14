/**
 * 学生成绩路由
 * 处理学生成绩相关的路由
 */

const express = require('express');
const router = express.Router();
const { getGradeOverview, getGradeDetails, getCourseGrade } = require('../controllers/studentGradeController');
const { authenticate, isStudent } = require('../middleware/auth');

/**
 * @route   GET /api/students/grades/overview
 * @desc    获取学生成绩概览
 * @access  Private (Student)
 */
router.get('/grades/overview', authenticate, isStudent, getGradeOverview);

/**
 * @route   GET /api/students/grades
 * @desc    获取学生成绩详情
 * @access  Private (Student)
 */
router.get('/grades', authenticate, isStudent, getGradeDetails);

/**
 * @route   GET /api/students/grades/courses/:courseId
 * @desc    获取学生单门课程成绩
 * @access  Private (Student)
 */
router.get('/grades/courses/:courseId', authenticate, isStudent, getCourseGrade);

module.exports = router; 