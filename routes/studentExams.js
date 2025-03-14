/**
 * 学生考试路由
 * 处理学生考试相关的路由
 */

const express = require('express');
const router = express.Router();
const { getExams, startExam, saveAnswer, submitExam } = require('../controllers/studentExamController');
const { authenticate, isStudent } = require('../middleware/auth');

/**
 * @route   GET /api/students/exams
 * @desc    获取学生考试列表
 * @access  Private (Student)
 */
router.get('/exams', authenticate, isStudent, getExams);

/**
 * @route   POST /api/students/exams/:examId/start
 * @desc    开始/继续考试
 * @access  Private (Student)
 */
router.post('/exams/:examId/start', authenticate, isStudent, startExam);

/**
 * @route   PUT /api/students/exams/answers/:answerId
 * @desc    保存答案
 * @access  Private (Student)
 */
router.put('/exams/answers/:answerId', authenticate, isStudent, saveAnswer);

/**
 * @route   POST /api/students/exams/:examId/submit
 * @desc    提交考试
 * @access  Private (Student)
 */
router.post('/exams/:examId/submit', authenticate, isStudent, submitExam);

module.exports = router; 