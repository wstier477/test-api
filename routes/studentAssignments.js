/**
 * 学生作业路由
 * 处理学生作业相关的路由
 */

const express = require('express');
const router = express.Router();
const { getAssignments, submitAssignment, getAssignmentDetail } = require('../controllers/studentAssignmentController');
const { authenticate, isStudent } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   GET /api/students/assignments
 * @desc    获取学生作业列表
 * @access  Private (Student)
 */
router.get('/assignments', authenticate, isStudent, getAssignments);

/**
 * @route   GET /api/students/assignments/:assignmentId
 * @desc    获取作业详情
 * @access  Private (Student)
 */
router.get('/assignments/:assignmentId', authenticate, isStudent, getAssignmentDetail);

/**
 * @route   POST /api/students/assignments/:assignmentId/submit
 * @desc    提交作业
 * @access  Private (Student)
 */
router.post('/assignments/:assignmentId/submit', authenticate, isStudent, upload.array('files', 5), submitAssignment);

module.exports = router; 